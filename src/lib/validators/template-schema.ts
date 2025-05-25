import { z } from "zod";

// Template categories
export const TemplateCategory = z.enum([
  "MARKETING",
  "UTILITY",
  "AUTHENTICATION",
]);

// Template subcategories
export const TemplateSubCategory = z.enum(["ORDER_STATUS"]).optional();

// Header formats
export const HeaderFormat = z.enum([
  "TEXT",
  "IMAGE",
  "VIDEO",
  "DOCUMENT",
  "LOCATION",
]);

// Button types
export const ButtonType = z.enum([
  "QUICK_REPLY",
  "URL",
  "PHONE_NUMBER",
  "COPY_CODE",
  "OTP",
  "CATALOG",
  "MPM",
  "FLOW",
  "ORDER_DETAILS",
  "VOICE_CALL",
]);

// OTP types for authentication templates
export const OTPType = z.enum(["COPY_CODE", "ONE_TAP", "ZERO_TAP"]);

// Component types
export const ComponentType = z.enum([
  "HEADER",
  "BODY",
  "FOOTER",
  "BUTTONS",
  "CAROUSEL",
  "LIMITED_TIME_OFFER",
]);

// Variable validation - matches {{1}}, {{2}}, etc.
const variableRegex = /\{\{(\d+)\}\}/g;

// Text validation with character limits
const createTextValidator = (maxLength: number, allowVariables = true) => {
  return z
    .string()
    .min(1, "Text cannot be empty")
    .max(maxLength, `Text cannot exceed ${maxLength} characters`)
    .refine((text) => {
      if (!allowVariables) return true;

      // Extract all variables and check they are sequential
      const matches = Array.from(text.matchAll(variableRegex));
      if (matches.length === 0) return true;

      const variables = matches
        .map((match) => parseInt(match[1]))
        .sort((a, b) => a - b);

      // Check if variables are sequential starting from 1
      for (let i = 0; i < variables.length; i++) {
        if (variables[i] !== i + 1) {
          return false;
        }
      }
      return true;
    }, "Variables must be sequential starting from {{1}}")
    .refine((text) => {
      // Check for valid variable format
      const invalidVariables = text
        .match(/\{\{[^}]*\}\}/g)
        ?.filter((v) => !v.match(/^\{\{\d+\}\}$/));
      return !invalidVariables || invalidVariables.length === 0;
    }, "Variables must be in format {{1}}, {{2}}, etc.");
};

// Example schema for template components
export const ExampleSchema = z
  .object({
    header_text: z.array(z.string()).optional(),
    header_url: z.array(z.string().url()).optional(),
    body_text: z.array(z.array(z.string())).optional(),
  })
  .optional();

// Header component schema (base schema without refinements for discriminated union)
export const HeaderComponentBaseSchema = z.object({
  type: z.literal("HEADER"),
  format: HeaderFormat.optional(),
  text: createTextValidator(60).optional(),
  example: ExampleSchema,
});

// Header component schema with validation
export const HeaderComponentSchema = HeaderComponentBaseSchema.refine(
  (data) => {
    if (data.format === "TEXT" && !data.text) {
      return false;
    }
    if (data.format && data.format !== "TEXT" && !data.example?.header_url) {
      return false;
    }
    return true;
  },
  "Header with TEXT format requires text, media formats require example URL"
);

// Body component schema
export const BodyComponentSchema = z.object({
  type: z.literal("BODY"),
  text: createTextValidator(1024),
  add_security_recommendation: z.boolean().optional(),
  example: ExampleSchema,
});

// Footer component schema
export const FooterComponentSchema = z.object({
  type: z.literal("FOOTER"),
  text: createTextValidator(60, false), // Footer doesn't support variables
  code_expiration_minutes: z.number().min(1).max(60).optional(),
});

// Button schemas
export const QuickReplyButtonSchema = z.object({
  type: z.literal("QUICK_REPLY"),
  text: createTextValidator(25, false),
});

export const URLButtonSchema = z.object({
  type: z.literal("URL"),
  text: createTextValidator(25, false),
  url: z.string().url().max(2000),
  example: z.array(z.string().url()).optional(),
});

export const PhoneButtonSchema = z.object({
  type: z.literal("PHONE_NUMBER"),
  text: createTextValidator(25, false),
  phone_number: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Invalid phone number format"),
});

export const CopyCodeButtonSchema = z.object({
  type: z.literal("COPY_CODE"),
  example: z.array(z.string()).optional(),
});

export const OTPButtonSchema = z.object({
  type: z.literal("OTP"),
  otp_type: OTPType,
  text: createTextValidator(25, false).optional(),
  autofill_text: createTextValidator(25, false).optional(),
  package_name: z.string().optional(),
  signature_hash: z.string().optional(),
  zero_tap_terms_accepted: z.boolean().optional(),
});

export const CatalogButtonSchema = z.object({
  type: z.literal("CATALOG"),
  text: z.literal("View catalog"),
});

export const MPMButtonSchema = z.object({
  type: z.literal("MPM"),
  text: z.literal("View items"),
});

export const FlowButtonSchema = z.object({
  type: z.literal("FLOW"),
  text: createTextValidator(25, false),
  flow_id: z.string(),
  navigate_screen: z.string().optional(),
  flow_action: z.enum(["navigate", "data_exchange"]).optional(),
});

export const OrderDetailsButtonSchema = z.object({
  type: z.literal("ORDER_DETAILS"),
  text: z.literal("Review and Pay"),
});

export const VoiceCallButtonSchema = z.object({
  type: z.literal("VOICE_CALL"),
  text: createTextValidator(25, false),
});

// Union of all button types
export const ButtonSchema = z.discriminatedUnion("type", [
  QuickReplyButtonSchema,
  URLButtonSchema,
  PhoneButtonSchema,
  CopyCodeButtonSchema,
  OTPButtonSchema,
  CatalogButtonSchema,
  MPMButtonSchema,
  FlowButtonSchema,
  OrderDetailsButtonSchema,
  VoiceCallButtonSchema,
]);

// Buttons component schema
export const ButtonsComponentSchema = z.object({
  type: z.literal("BUTTONS"),
  buttons: z
    .array(ButtonSchema)
    .min(1, "At least one button is required")
    .max(10, "Maximum 10 buttons allowed")
    .refine((buttons) => {
      // Validate button combinations
      const quickReplyButtons = buttons.filter((b) => b.type === "QUICK_REPLY");
      const otherButtons = buttons.filter((b) => b.type !== "QUICK_REPLY");

      // Quick reply buttons must be grouped together
      if (quickReplyButtons.length > 0 && otherButtons.length > 0) {
        // Check if quick reply buttons are grouped at start or end
        const firstQuickReplyIndex = buttons.findIndex(
          (b) => b.type === "QUICK_REPLY"
        );
        const lastQuickReplyIndex =
          buttons
            .map((b, i) => (b.type === "QUICK_REPLY" ? i : -1))
            .filter((i) => i !== -1)
            .pop() || -1;

        // All quick reply buttons must be consecutive
        for (let i = firstQuickReplyIndex; i <= lastQuickReplyIndex; i++) {
          if (buttons[i].type !== "QUICK_REPLY") {
            return false;
          }
        }
      }

      return true;
    }, "Quick reply buttons must be grouped together")
    .refine((buttons) => {
      // Check specific button type limits
      const phoneButtons = buttons.filter((b) => b.type === "PHONE_NUMBER");
      const urlButtons = buttons.filter((b) => b.type === "URL");
      const copyCodeButtons = buttons.filter((b) => b.type === "COPY_CODE");

      return (
        phoneButtons.length <= 1 &&
        urlButtons.length <= 2 &&
        copyCodeButtons.length <= 1
      );
    }, "Button type limits exceeded: max 1 phone, 2 URL, 1 copy code button"),
});

// Component union (using base schemas without refinements)
export const ComponentSchema = z.discriminatedUnion("type", [
  HeaderComponentBaseSchema,
  BodyComponentSchema,
  FooterComponentSchema,
  ButtonsComponentSchema,
]);

// Main template schema
export const WhatsAppTemplateSchema = z.object({
  wabaId: z.string().optional(),
  name: z
    .string()
    .min(1, "Template name is required")
    .max(512, "Template name cannot exceed 512 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Template name can only contain lowercase letters, numbers, and underscores"
    ),
  language: z
    .string()
    .min(2, "Language code is required")
    .regex(
      /^[a-z]{2}(_[A-Z]{2})?$/,
      "Invalid language code format (e.g., en_US, es, fr)"
    ),
  category: TemplateCategory,
  subCategory: TemplateSubCategory,
  messageSendTtlSeconds: z.number().min(30).max(2592000).optional(),
  components: z
    .array(ComponentSchema)
    .min(1, "At least one component is required")
    .refine((components) => {
      // Must have exactly one BODY component
      const bodyComponents = components.filter((c) => c.type === "BODY");
      return bodyComponents.length === 1;
    }, "Template must have exactly one BODY component")
    .refine((components) => {
      // Can have at most one of each other component type
      const headerComponents = components.filter((c) => c.type === "HEADER");
      const footerComponents = components.filter((c) => c.type === "FOOTER");
      const buttonComponents = components.filter((c) => c.type === "BUTTONS");

      return (
        headerComponents.length <= 1 &&
        footerComponents.length <= 1 &&
        buttonComponents.length <= 1
      );
    }, "Template can have at most one HEADER, FOOTER, and BUTTONS component each")
    .refine((components) => {
      // Validate header component requirements
      const headerComponent = components.find((c) => c.type === "HEADER");
      if (!headerComponent) return true;

      if (headerComponent.format === "TEXT" && !headerComponent.text) {
        return false;
      }
      if (
        headerComponent.format &&
        headerComponent.format !== "TEXT" &&
        !headerComponent.example?.header_url
      ) {
        return false;
      }
      return true;
    }, "Header with TEXT format requires text, media formats require example URL"),
});

export type WhatsAppTemplate = z.infer<typeof WhatsAppTemplateSchema>;
export type TemplateComponent = z.infer<typeof ComponentSchema>;
export type Button = z.infer<typeof ButtonSchema>;
