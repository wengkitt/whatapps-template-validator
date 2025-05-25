import { WhatsAppTemplate } from "./template-schema";

export interface ValidationError {
  field: string;
  message: string;
  suggestion?: string;
  line?: number;
  severity: "error" | "warning" | "info";
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
}

export class TemplateValidator {
  private errors: ValidationError[] = [];
  private warnings: ValidationError[] = [];
  private info: ValidationError[] = [];

  validate(template: WhatsAppTemplate): ValidationResult {
    this.errors = [];
    this.warnings = [];
    this.info = [];

    this.validateBasicStructure(template);
    this.validateCategorySpecificRules(template);
    this.validateComponentCombinations(template);
    this.validateVariableUsage(template);
    this.validateCharacterLimits(template);
    this.validateButtonCombinations(template);
    this.validateMediaRequirements(template);
    this.validateTTLSettings(template);

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      info: this.info,
    };
  }

  private addError(
    field: string,
    message: string,
    suggestion?: string,
    line?: number
  ) {
    this.errors.push({ field, message, suggestion, line, severity: "error" });
  }

  private addWarning(
    field: string,
    message: string,
    suggestion?: string,
    line?: number
  ) {
    this.warnings.push({
      field,
      message,
      suggestion,
      line,
      severity: "warning",
    });
  }

  private addInfo(
    field: string,
    message: string,
    suggestion?: string,
    line?: number
  ) {
    this.info.push({ field, message, suggestion, line, severity: "info" });
  }

  private validateBasicStructure(template: WhatsAppTemplate) {
    // Check required components
    const bodyComponent = template.components.find((c) => c.type === "BODY");
    if (!bodyComponent) {
      this.addError(
        "components",
        "Template must have a BODY component",
        "Add a BODY component with your message text"
      );
    }

    // Check component order (recommended)
    const componentOrder = ["HEADER", "BODY", "FOOTER", "BUTTONS"];
    let lastValidIndex = -1;

    template.components.forEach((component, index) => {
      const currentIndex = componentOrder.indexOf(component.type);
      if (currentIndex < lastValidIndex) {
        this.addWarning(
          `components[${index}]`,
          `Component ${component.type} should come before previous components`,
          `Reorder components: ${componentOrder.join(" → ")}`
        );
      }
      lastValidIndex = Math.max(lastValidIndex, currentIndex);
    });
  }

  private validateCategorySpecificRules(template: WhatsAppTemplate) {
    switch (template.category) {
      case "AUTHENTICATION":
        this.validateAuthenticationTemplate(template);
        break;
      case "UTILITY":
        this.validateUtilityTemplate(template);
        break;
      case "MARKETING":
        this.validateMarketingTemplate(template);
        break;
    }
  }

  private validateAuthenticationTemplate(template: WhatsAppTemplate) {
    const bodyComponent = template.components.find(
      (c) => c.type === "BODY"
    ) as any;
    const buttonComponent = template.components.find(
      (c) => c.type === "BUTTONS"
    ) as any;

    // Authentication templates should have OTP buttons or preset text
    if (buttonComponent) {
      const hasOTPButton = buttonComponent.buttons?.some(
        (b: any) => b.type === "OTP"
      );
      if (!hasOTPButton) {
        this.addWarning(
          "buttons",
          "Authentication templates typically use OTP buttons for better user experience",
          "Consider adding an OTP button (COPY_CODE, ONE_TAP, or ZERO_TAP)"
        );
      }
    }

    // Check TTL for authentication templates
    if (
      template.messageSendTtlSeconds &&
      (template.messageSendTtlSeconds < 30 ||
        template.messageSendTtlSeconds > 900)
    ) {
      this.addError(
        "messageSendTtlSeconds",
        "Authentication templates TTL must be between 30 seconds and 15 minutes (900 seconds)",
        "Set TTL between 30 and 900 seconds"
      );
    }

    // Recommend security disclaimer
    if (bodyComponent && !bodyComponent.add_security_recommendation) {
      this.addInfo(
        "body.add_security_recommendation",
        "Consider adding security recommendation for authentication templates",
        "Set add_security_recommendation to true"
      );
    }
  }

  private validateUtilityTemplate(template: WhatsAppTemplate) {
    // Check TTL for utility templates
    if (
      template.messageSendTtlSeconds &&
      (template.messageSendTtlSeconds < 30 ||
        template.messageSendTtlSeconds > 43200)
    ) {
      this.addError(
        "messageSendTtlSeconds",
        "Utility templates TTL must be between 30 seconds and 12 hours (43200 seconds)",
        "Set TTL between 30 and 43200 seconds"
      );
    }

    // Check for order status subcategory
    if (template.subCategory === "ORDER_STATUS") {
      const buttonComponent = template.components.find(
        (c) => c.type === "BUTTONS"
      );
      if (buttonComponent) {
        this.addWarning(
          "buttons",
          "Order status templates typically don't need buttons",
          "Consider removing buttons for order status updates"
        );
      }
    }
  }

  private validateMarketingTemplate(template: WhatsAppTemplate) {
    // Check TTL for marketing templates
    if (
      template.messageSendTtlSeconds &&
      (template.messageSendTtlSeconds < 43200 ||
        template.messageSendTtlSeconds > 2592000)
    ) {
      this.addError(
        "messageSendTtlSeconds",
        "Marketing templates TTL must be between 12 hours (43200 seconds) and 30 days (2592000 seconds)",
        "Set TTL between 43200 and 2592000 seconds"
      );
    }

    // Marketing templates benefit from rich media
    const headerComponent = template.components.find(
      (c) => c.type === "HEADER"
    ) as any;
    if (!headerComponent) {
      this.addInfo(
        "header",
        "Marketing templates perform better with media headers",
        "Consider adding an IMAGE, VIDEO, or DOCUMENT header"
      );
    }

    // Check for call-to-action buttons
    const buttonComponent = template.components.find(
      (c) => c.type === "BUTTONS"
    ) as any;
    if (!buttonComponent) {
      this.addInfo(
        "buttons",
        "Marketing templates benefit from call-to-action buttons",
        "Consider adding URL or QUICK_REPLY buttons"
      );
    }
  }

  private validateComponentCombinations(template: WhatsAppTemplate) {
    const headerComponent = template.components.find(
      (c) => c.type === "HEADER"
    ) as any;
    const buttonComponent = template.components.find(
      (c) => c.type === "BUTTONS"
    ) as any;

    // Validate header format requirements
    if (headerComponent) {
      if (headerComponent.format === "TEXT" && !headerComponent.text) {
        this.addError(
          "header.text",
          "TEXT header format requires text content",
          "Add text or change format"
        );
      }

      if (
        headerComponent.format &&
        headerComponent.format !== "TEXT" &&
        !headerComponent.example?.header_url
      ) {
        this.addError(
          "header.example.header_url",
          `${headerComponent.format} header format requires example URL`,
          "Add example URL for media header"
        );
      }
    }

    // Validate button requirements for specific button types
    if (buttonComponent) {
      buttonComponent.buttons?.forEach((button: any, index: number) => {
        if (
          button.type === "OTP" &&
          button.otp_type === "ONE_TAP" &&
          !button.package_name
        ) {
          this.addError(
            `buttons[${index}].package_name`,
            "ONE_TAP OTP buttons require package_name",
            "Add your Android app's package name"
          );
        }

        if (
          button.type === "OTP" &&
          button.otp_type === "ZERO_TAP" &&
          !button.zero_tap_terms_accepted
        ) {
          this.addError(
            `buttons[${index}].zero_tap_terms_accepted`,
            "ZERO_TAP OTP buttons require terms acceptance",
            "Set zero_tap_terms_accepted to true"
          );
        }
      });
    }
  }

  private validateVariableUsage(template: WhatsAppTemplate) {
    template.components.forEach((component, _componentIndex) => {
      if (
        component.type === "BODY" ||
        (component.type === "HEADER" && (component as any).format === "TEXT")
      ) {
        const text = (component as any).text;
        if (text) {
          this.validateVariablesInText(
            text,
            `${component.type.toLowerCase()}.text`
          );
        }
      }

      if (component.type === "BUTTONS") {
        (component as any).buttons?.forEach(
          (button: any, buttonIndex: number) => {
            if (button.type === "URL" && button.url) {
              this.validateVariablesInText(
                button.url,
                `buttons[${buttonIndex}].url`
              );
            }
          }
        );
      }
    });
  }

  private validateVariablesInText(text: string, field: string) {
    const variableRegex = /\{\{(\d+)\}\}/g;
    const matches = Array.from(text.matchAll(variableRegex));

    if (matches.length > 0) {
      const variables = matches
        .map((match) => parseInt(match[1]))
        .sort((a, b) => a - b);

      // Check for sequential variables starting from 1
      for (let i = 0; i < variables.length; i++) {
        if (variables[i] !== i + 1) {
          this.addError(
            field,
            `Variables must be sequential starting from {{1}}. Found: {{${variables.join(
              "}}, {{"
            )}}}`,
            `Use variables {{1}}, {{2}}, {{3}}, etc. in sequence`
          );
          break;
        }
      }

      // Check for duplicate variables
      const uniqueVariables = Array.from(new Set(variables));
      if (uniqueVariables.length !== variables.length) {
        this.addWarning(
          field,
          "Duplicate variables found",
          "Each variable should be used only once per component"
        );
      }
    }
  }

  private validateCharacterLimits(template: WhatsAppTemplate) {
    template.components.forEach((component, _index) => {
      switch (component.type) {
        case "HEADER":
          if ((component as any).format === "TEXT" && (component as any).text) {
            this.validateTextLength((component as any).text, 60, `header.text`);
          }
          break;
        case "BODY":
          this.validateTextLength((component as any).text, 1024, `body.text`);
          break;
        case "FOOTER":
          this.validateTextLength((component as any).text, 60, `footer.text`);
          break;
        case "BUTTONS":
          (component as any).buttons?.forEach(
            (button: any, buttonIndex: number) => {
              if (button.text) {
                this.validateTextLength(
                  button.text,
                  25,
                  `buttons[${buttonIndex}].text`
                );
              }
            }
          );
          break;
      }
    });
  }

  private validateTextLength(text: string, maxLength: number, field: string) {
    if (text.length > maxLength) {
      this.addError(
        field,
        `Text exceeds ${maxLength} character limit (current: ${text.length})`,
        `Reduce text by ${text.length - maxLength} characters`
      );
    }

    // Warning for texts approaching the limit
    if (text.length > maxLength * 0.9) {
      this.addWarning(
        field,
        `Text is close to ${maxLength} character limit (current: ${text.length})`,
        "Consider shortening the text to avoid future issues"
      );
    }
  }

  private validateButtonCombinations(template: WhatsAppTemplate) {
    const buttonComponent = template.components.find(
      (c) => c.type === "BUTTONS"
    ) as any;
    if (!buttonComponent?.buttons) return;

    const buttons = buttonComponent.buttons;

    // Count button types
    const buttonCounts = buttons.reduce((counts: any, button: any) => {
      counts[button.type] = (counts[button.type] || 0) + 1;
      return counts;
    }, {});

    // Validate button type limits
    if (buttonCounts.PHONE_NUMBER > 1) {
      this.addError(
        "buttons",
        "Maximum 1 phone number button allowed",
        "Remove extra phone number buttons"
      );
    }

    if (buttonCounts.URL > 2) {
      this.addError(
        "buttons",
        "Maximum 2 URL buttons allowed",
        "Remove extra URL buttons"
      );
    }

    if (buttonCounts.COPY_CODE > 1) {
      this.addError(
        "buttons",
        "Maximum 1 copy code button allowed",
        "Remove extra copy code buttons"
      );
    }

    // Validate quick reply button grouping
    const quickReplyIndices = buttons
      .map((b: any, i: number) => (b.type === "QUICK_REPLY" ? i : -1))
      .filter((i: number) => i !== -1);
    if (quickReplyIndices.length > 0) {
      const isGrouped = quickReplyIndices.every(
        (index: number, i: number) =>
          i === 0 || index === quickReplyIndices[i - 1] + 1
      );
      if (!isGrouped) {
        this.addError(
          "buttons",
          "Quick reply buttons must be grouped together",
          "Move all quick reply buttons to the beginning or end of the button list"
        );
      }
    }
  }

  private validateMediaRequirements(template: WhatsAppTemplate) {
    const headerComponent = template.components.find(
      (c) => c.type === "HEADER"
    ) as any;
    if (!headerComponent?.format || headerComponent.format === "TEXT") return;

    const example = headerComponent.example;
    if (!example?.header_url || !example.header_url[0]) {
      this.addError(
        "header.example.header_url",
        `${headerComponent.format} header requires example URL`,
        "Add a valid example URL for the media"
      );
      return;
    }

    const url = example.header_url[0];

    // Validate file extensions
    switch (headerComponent.format) {
      case "IMAGE":
        if (!url.match(/\.(jpg|jpeg|png)$/i)) {
          this.addError(
            "header.example.header_url",
            "Image header URL must end with .jpg, .jpeg, or .png",
            "Use a valid image file extension"
          );
        }
        break;
      case "VIDEO":
        if (!url.match(/\.mp4$/i)) {
          this.addError(
            "header.example.header_url",
            "Video header URL must end with .mp4",
            "Use a valid MP4 video file"
          );
        }
        break;
      case "DOCUMENT":
        if (!url.match(/\.pdf$/i)) {
          this.addError(
            "header.example.header_url",
            "Document header URL must end with .pdf",
            "Use a valid PDF document file"
          );
        }
        break;
    }
  }

  private validateTTLSettings(template: WhatsAppTemplate) {
    if (!template.messageSendTtlSeconds) {
      this.addInfo(
        "messageSendTtlSeconds",
        "Consider setting a TTL (time-to-live) for your template",
        "Add messageSendTtlSeconds based on your template category"
      );
      return;
    }

    const ttl = template.messageSendTtlSeconds;

    // General TTL validation
    if (ttl < 30) {
      this.addError(
        "messageSendTtlSeconds",
        "TTL cannot be less than 30 seconds",
        "Set TTL to at least 30 seconds"
      );
    }

    if (ttl > 2592000) {
      this.addError(
        "messageSendTtlSeconds",
        "TTL cannot exceed 30 days (2592000 seconds)",
        "Set TTL to maximum 2592000 seconds"
      );
    }
  }
}

export const validateTemplate = (
  template: WhatsAppTemplate
): ValidationResult => {
  const validator = new TemplateValidator();
  return validator.validate(template);
};
