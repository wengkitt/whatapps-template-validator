import { WhatsAppTemplateSchema, WhatsAppTemplate } from "../validators/template-schema";
import { ZodError } from "zod";

export interface ParseResult {
  success: boolean;
  data?: WhatsAppTemplate;
  error?: string;
  lineNumber?: number;
  column?: number;
}

export interface TemplateStats {
  totalCharacters: number;
  componentCounts: {
    header: number;
    body: number;
    footer: number;
    buttons: number;
  };
  variableCount: number;
  buttonCount: number;
  estimatedSize: string;
}

export class TemplateParser {
  /**
   * Parse JSON string into WhatsApp template object
   */
  static parseJSON(jsonString: string): ParseResult {
    try {
      // First, try to parse as JSON
      const rawData = JSON.parse(jsonString);
      
      // Then validate against schema
      const validatedData = WhatsAppTemplateSchema.parse(rawData);
      
      return {
        success: true,
        data: validatedData,
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        // JSON parsing error
        const match = error.message.match(/at position (\d+)/);
        const position = match ? parseInt(match[1]) : 0;
        const { line, column } = this.getLineAndColumn(jsonString, position);
        
        return {
          success: false,
          error: `JSON syntax error: ${error.message}`,
          lineNumber: line,
          column: column,
        };
      } else if (error instanceof ZodError) {
        // Schema validation error
        const firstError = error.errors[0];
        return {
          success: false,
          error: `Validation error: ${firstError.message} at ${firstError.path.join('.')}`,
        };
      } else {
        return {
          success: false,
          error: `Unknown error: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }
  }

  /**
   * Convert line position to line and column numbers
   */
  private static getLineAndColumn(text: string, position: number): { line: number; column: number } {
    const lines = text.substring(0, position).split('\n');
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    };
  }

  /**
   * Generate template statistics
   */
  static getTemplateStats(template: WhatsAppTemplate): TemplateStats {
    let totalCharacters = 0;
    let variableCount = 0;
    let buttonCount = 0;
    
    const componentCounts = {
      header: 0,
      body: 0,
      footer: 0,
      buttons: 0,
    };

    // Count variables in text
    const countVariables = (text: string): number => {
      const matches = text.match(/\{\{\d+\}\}/g);
      return matches ? matches.length : 0;
    };

    // Analyze each component
    template.components.forEach(component => {
      switch (component.type) {
        case "HEADER":
          componentCounts.header++;
          if ((component as any).format === "TEXT" && (component as any).text) {
            const text = (component as any).text;
            totalCharacters += text.length;
            variableCount += countVariables(text);
          }
          break;
          
        case "BODY":
          componentCounts.body++;
          const bodyText = (component as any).text;
          totalCharacters += bodyText.length;
          variableCount += countVariables(bodyText);
          break;
          
        case "FOOTER":
          componentCounts.footer++;
          const footerText = (component as any).text;
          totalCharacters += footerText.length;
          break;
          
        case "BUTTONS":
          componentCounts.buttons++;
          const buttons = (component as any).buttons || [];
          buttonCount = buttons.length;
          
          buttons.forEach((button: any) => {
            if (button.text) {
              totalCharacters += button.text.length;
            }
            if (button.url) {
              variableCount += countVariables(button.url);
            }
          });
          break;
      }
    });

    // Estimate message size
    const estimatedSize = this.estimateMessageSize(totalCharacters);

    return {
      totalCharacters,
      componentCounts,
      variableCount,
      buttonCount,
      estimatedSize,
    };
  }

  /**
   * Estimate message size category
   */
  private static estimateMessageSize(characters: number): string {
    if (characters < 100) return "Small";
    if (characters < 500) return "Medium";
    if (characters < 1000) return "Large";
    return "Very Large";
  }

  /**
   * Extract all variables from template
   */
  static extractVariables(template: WhatsAppTemplate): Array<{ component: string; variable: string; position: number }> {
    const variables: Array<{ component: string; variable: string; position: number }> = [];
    
    const extractFromText = (text: string, componentName: string) => {
      const regex = /\{\{(\d+)\}\}/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        variables.push({
          component: componentName,
          variable: match[0],
          position: match.index,
        });
      }
    };

    template.components.forEach((component, index) => {
      const componentName = `${component.type.toLowerCase()}[${index}]`;
      
      switch (component.type) {
        case "HEADER":
          if ((component as any).format === "TEXT" && (component as any).text) {
            extractFromText((component as any).text, componentName);
          }
          break;
          
        case "BODY":
          extractFromText((component as any).text, componentName);
          break;
          
        case "BUTTONS":
          (component as any).buttons?.forEach((button: any, buttonIndex: number) => {
            if (button.url) {
              extractFromText(button.url, `${componentName}.buttons[${buttonIndex}].url`);
            }
          });
          break;
      }
    });

    return variables.sort((a, b) => {
      const aNum = parseInt(a.variable.match(/\d+/)?.[0] || "0");
      const bNum = parseInt(b.variable.match(/\d+/)?.[0] || "0");
      return aNum - bNum;
    });
  }

  /**
   * Generate example template for each category
   */
  static generateExampleTemplate(category: "MARKETING" | "UTILITY" | "AUTHENTICATION"): WhatsAppTemplate {
    const baseTemplate = {
      name: `example_${category.toLowerCase()}_template`,
      language: "en_US",
      category,
    };

    switch (category) {
      case "AUTHENTICATION":
        return {
          ...baseTemplate,
          messageSendTtlSeconds: 600,
          components: [
            {
              type: "BODY" as const,
              text: "{{1}} is your verification code. For your security, do not share this code.",
              add_security_recommendation: true,
              example: {
                body_text: [["123456"]],
              },
            },
            {
              type: "FOOTER" as const,
              text: "This code expires in 5 minutes.",
              code_expiration_minutes: 5,
            },
            {
              type: "BUTTONS" as const,
              buttons: [
                {
                  type: "OTP" as const,
                  otp_type: "COPY_CODE" as const,
                  text: "Copy Code",
                },
              ],
            },
          ],
        };

      case "UTILITY":
        return {
          ...baseTemplate,
          components: [
            {
              type: "BODY" as const,
              text: "Your order {{1}} for a total of {{2}} is confirmed. The expected delivery is {{3}}.",
              example: {
                body_text: [["ORDER-5555", "99 USD", "February 25, 2023"]],
              },
            },
          ],
        };

      case "MARKETING":
        return {
          ...baseTemplate,
          components: [
            {
              type: "HEADER" as const,
              format: "IMAGE" as const,
              example: {
                header_url: ["https://example.com/image.jpg"],
              },
            },
            {
              type: "BODY" as const,
              text: "Hi {{1}}, check out our amazing deals! Get {{2}} off your next purchase.",
              example: {
                body_text: [["John", "20%"]],
              },
            },
            {
              type: "FOOTER" as const,
              text: "Limited time offer",
            },
            {
              type: "BUTTONS" as const,
              buttons: [
                {
                  type: "URL" as const,
                  text: "Shop Now",
                  url: "https://example.com/shop",
                },
                {
                  type: "QUICK_REPLY" as const,
                  text: "Learn More",
                },
              ],
            },
          ],
        };

      default:
        throw new Error(`Unknown category: ${category}`);
    }
  }

  /**
   * Validate template name format
   */
  static validateTemplateName(name: string): { valid: boolean; error?: string; suggestion?: string } {
    if (!name) {
      return {
        valid: false,
        error: "Template name is required",
        suggestion: "Enter a template name using lowercase letters, numbers, and underscores",
      };
    }

    if (name.length > 512) {
      return {
        valid: false,
        error: "Template name cannot exceed 512 characters",
        suggestion: `Reduce name by ${name.length - 512} characters`,
      };
    }

    if (!/^[a-z0-9_]+$/.test(name)) {
      return {
        valid: false,
        error: "Template name can only contain lowercase letters, numbers, and underscores",
        suggestion: "Use only a-z, 0-9, and _ characters. Example: my_template_name",
      };
    }

    // Additional recommendations
    if (name.length < 3) {
      return {
        valid: true,
        error: "Template name is very short",
        suggestion: "Consider using a more descriptive name (3+ characters)",
      };
    }

    if (name.includes("__")) {
      return {
        valid: true,
        error: "Template name contains consecutive underscores",
        suggestion: "Use single underscores to separate words",
      };
    }

    return { valid: true };
  }

  /**
   * Format template for display
   */
  static formatTemplateForDisplay(template: WhatsAppTemplate): string {
    return JSON.stringify(template, null, 2);
  }

  /**
   * Minify template JSON
   */
  static minifyTemplate(template: WhatsAppTemplate): string {
    return JSON.stringify(template);
  }
}
