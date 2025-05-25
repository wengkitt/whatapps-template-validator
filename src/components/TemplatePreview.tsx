"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Image,
  Video,
  FileText,
  MapPin,
  Phone,
  ExternalLink,
  Copy,
  Zap,
  ShoppingCart,
  Package,
  Play,
} from "lucide-react";

interface TemplatePreviewProps {
  template: any;
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const renderHeaderPreview = (component: any) => {
    if (!component) return null;

    const format = component.format;

    switch (format) {
      case "TEXT":
        return (
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-t-lg">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {component.text || "Header text"}
            </p>
          </div>
        );

      case "IMAGE":
        return (
          <div className="relative bg-gray-200 dark:bg-gray-700 rounded-t-lg h-48 flex items-center justify-center">
            <Image className="h-12 w-12 text-gray-400" />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              IMAGE
            </div>
          </div>
        );

      case "VIDEO":
        return (
          <div className="relative bg-gray-200 dark:bg-gray-700 rounded-t-lg h-48 flex items-center justify-center">
            <Video className="h-12 w-12 text-gray-400" />
            <Play className="h-8 w-8 text-white absolute" />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              VIDEO
            </div>
          </div>
        );

      case "DOCUMENT":
        return (
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-t-lg flex items-center space-x-3">
            <FileText className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Document
              </p>
              <p className="text-sm text-gray-500">PDF Document</p>
            </div>
          </div>
        );

      case "LOCATION":
        return (
          <div className="relative bg-green-100 dark:bg-green-900 rounded-t-lg h-32 flex items-center justify-center">
            <MapPin className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              LOCATION
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderButtonPreview = (button: any, index: number) => {
    switch (button.type) {
      case "QUICK_REPLY":
        return (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {button.text}
          </Button>
        );

      case "URL":
        return (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {button.text}
          </Button>
        );

      case "PHONE_NUMBER":
        return (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start"
          >
            <Phone className="h-4 w-4 mr-2" />
            {button.text}
          </Button>
        );

      case "COPY_CODE":
        return (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Code
          </Button>
        );

      case "OTP":
        const otpText =
          button.otp_type === "COPY_CODE"
            ? "Copy Code"
            : button.otp_type === "ONE_TAP"
            ? button.autofill_text || "Autofill"
            : "Zero Tap";
        return (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start"
          >
            <Zap className="h-4 w-4 mr-2" />
            {otpText}
          </Button>
        );

      case "CATALOG":
        return (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            View catalog
          </Button>
        );

      case "MPM":
        return (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start"
          >
            <Package className="h-4 w-4 mr-2" />
            View items
          </Button>
        );

      case "ORDER_DETAILS":
        return (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start"
          >
            <FileText className="h-4 w-4 mr-2" />
            Review and Pay
          </Button>
        );

      case "VOICE_CALL":
        return (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start"
          >
            <Phone className="h-4 w-4 mr-2" />
            {button.text}
          </Button>
        );

      default:
        return (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start"
          >
            {button.text || button.type}
          </Button>
        );
    }
  };

  const replaceVariablesWithExamples = (text: string, examples?: string[]) => {
    if (!examples || examples.length === 0) {
      // Replace with placeholder values
      return text.replace(/\{\{(\d+)\}\}/g, (match, num) => {
        const placeholders = [
          "John",
          "20%",
          "ORDER-123",
          "December 25",
          "$99.99",
        ];
        return placeholders[parseInt(num) - 1] || `Value${num}`;
      });
    }

    // Replace with actual examples
    return text.replace(/\{\{(\d+)\}\}/g, (match, num) => {
      const index = parseInt(num) - 1;
      return examples[index] || match;
    });
  };

  const headerComponent = template.components?.find(
    (c: any) => c.type === "HEADER"
  );
  const bodyComponent = template.components?.find(
    (c: any) => c.type === "BODY"
  );
  const footerComponent = template.components?.find(
    (c: any) => c.type === "FOOTER"
  );
  const buttonsComponent = template.components?.find(
    (c: any) => c.type === "BUTTONS"
  );

  return (
    <div className="space-y-6">
      {/* Template Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Template Preview</CardTitle>
              <CardDescription>
                How your template will appear to WhatsApp users
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{template.category}</Badge>
              <Badge variant="secondary">{template.language}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mobile Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Mobile Preview</span>
            </CardTitle>
            <CardDescription>Template: {template.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-sm mx-auto">
              {/* WhatsApp Message Bubble */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border">
                {/* Header */}
                {headerComponent && renderHeaderPreview(headerComponent)}

                {/* Body */}
                <div className="p-4 space-y-3">
                  {bodyComponent && (
                    <div className="text-gray-900 dark:text-gray-100">
                      <p className="whitespace-pre-wrap">
                        {replaceVariablesWithExamples(
                          bodyComponent.text,
                          bodyComponent.example?.body_text?.[0]
                        )}
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  {footerComponent && (
                    <>
                      <Separator />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {footerComponent.text}
                      </p>
                    </>
                  )}

                  {/* Buttons */}
                  {buttonsComponent && buttonsComponent.buttons && (
                    <div className="space-y-2 pt-2">
                      {buttonsComponent.buttons.map(
                        (button: any, index: number) =>
                          renderButtonPreview(button, index)
                      )}
                    </div>
                  )}
                </div>

                {/* Message timestamp */}
                <div className="px-4 pb-2">
                  <p className="text-xs text-gray-400 text-right">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Details */}
        <Card>
          <CardHeader>
            <CardTitle>Component Details</CardTitle>
            <CardDescription>
              Breakdown of template components and their properties
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Metadata */}
            <div className="space-y-2">
              <h4 className="font-semibold">Template Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <p className="font-mono">{template.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Language:</span>
                  <p>{template.language}</p>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p>{template.category}</p>
                </div>
                {template.messageSendTtlSeconds && (
                  <div>
                    <span className="text-gray-500">TTL:</span>
                    <p>{template.messageSendTtlSeconds}s</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Components */}
            <div className="space-y-3">
              <h4 className="font-semibold">Components</h4>

              {headerComponent && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Header</span>
                    <Badge variant="outline">
                      {headerComponent.format || "TEXT"}
                    </Badge>
                  </div>
                  {headerComponent.format === "TEXT" &&
                    headerComponent.text && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {headerComponent.text}
                      </p>
                    )}
                  {headerComponent.example?.header_url && (
                    <p className="text-xs text-gray-500 mt-1">
                      Media URL: {headerComponent.example.header_url[0]}
                    </p>
                  )}
                </div>
              )}

              {bodyComponent && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Body</span>
                    <Badge variant="outline">
                      {bodyComponent.text?.length || 0} chars
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {bodyComponent.text}
                  </p>
                </div>
              )}

              {footerComponent && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Footer</span>
                    <Badge variant="outline">
                      {footerComponent.text?.length || 0} chars
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {footerComponent.text}
                  </p>
                </div>
              )}

              {buttonsComponent && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Buttons</span>
                    <Badge variant="outline">
                      {buttonsComponent.buttons?.length || 0} buttons
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {buttonsComponent.buttons?.map(
                      (button: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-600 dark:text-gray-400">
                            {button.text || button.type}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {button.type}
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
