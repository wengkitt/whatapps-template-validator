"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Upload,
  Zap,
  FileText,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { TemplatePreview } from "./TemplatePreview";

export function TemplateValidator() {
  const [jsonInput, setJsonInput] = useState("");
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "validating" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [parsedTemplate, setParsedTemplate] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("input");

  const handleValidate = async () => {
    if (!jsonInput.trim()) {
      setValidationStatus("error");
      setErrorMessage("Please enter a template JSON");
      return;
    }

    setValidationStatus("validating");
    setErrorMessage("");
    setValidationResults([]);

    try {
      // Basic JSON validation
      const parsed = JSON.parse(jsonInput);

      // Basic template structure validation
      const errors = [];
      const warnings: string[] = [];

      if (!parsed.name) {
        errors.push("Template name is required");
      } else if (!/^[a-z0-9_]+$/.test(parsed.name)) {
        errors.push(
          "Template name can only contain lowercase letters, numbers, and underscores"
        );
      }

      if (!parsed.language) {
        errors.push("Language code is required");
      }

      if (!parsed.category) {
        errors.push("Category is required");
      } else if (
        !["MARKETING", "UTILITY", "AUTHENTICATION"].includes(parsed.category)
      ) {
        errors.push("Category must be MARKETING, UTILITY, or AUTHENTICATION");
      }

      if (!parsed.components || !Array.isArray(parsed.components)) {
        errors.push("Components array is required");
      } else {
        const bodyComponents = parsed.components.filter(
          (c: any) => c.type === "BODY"
        );
        if (bodyComponents.length === 0) {
          errors.push("Template must have at least one BODY component");
        } else if (bodyComponents.length > 1) {
          errors.push("Template can have only one BODY component");
        }

        // Check character limits
        parsed.components.forEach((component: any, index: number) => {
          if (component.type === "BODY" && component.text) {
            if (component.text.length > 1024) {
              errors.push(
                `Body text exceeds 1024 character limit (${component.text.length} characters)`
              );
            } else if (component.text.length > 900) {
              warnings.push(
                `Body text is close to 1024 character limit (${component.text.length} characters)`
              );
            }
          }

          if (
            component.type === "HEADER" &&
            component.format === "TEXT" &&
            component.text
          ) {
            if (component.text.length > 60) {
              errors.push(
                `Header text exceeds 60 character limit (${component.text.length} characters)`
              );
            }
          }

          if (component.type === "FOOTER" && component.text) {
            if (component.text.length > 60) {
              errors.push(
                `Footer text exceeds 60 character limit (${component.text.length} characters)`
              );
            }
          }
        });
      }

      setValidationResults([
        ...errors.map((error) => ({ type: "error", message: error })),
        ...warnings.map((warning) => ({ type: "warning", message: warning })),
      ]);

      if (errors.length === 0) {
        setValidationStatus("success");
        setParsedTemplate(parsed);
        setActiveTab("preview");
      } else {
        setValidationStatus("error");
        setParsedTemplate(null);
        setActiveTab("results");
      }
    } catch (error) {
      setValidationStatus("error");
      setErrorMessage(
        `JSON parsing error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setParsedTemplate(null);
      setActiveTab("input");
    }
  };

  const loadExampleTemplate = (category: string) => {
    const examples = {
      MARKETING: {
        name: "marketing_example",
        language: "en_US",
        category: "MARKETING",
        components: [
          {
            type: "HEADER",
            format: "IMAGE",
            example: {
              header_url: ["https://example.com/image.jpg"],
            },
          },
          {
            type: "BODY",
            text: "Hi {{1}}, check out our amazing deals! Get {{2}} off your next purchase.",
            example: {
              body_text: [["John", "20%"]],
            },
          },
          {
            type: "FOOTER",
            text: "Limited time offer",
          },
          {
            type: "BUTTONS",
            buttons: [
              {
                type: "URL",
                text: "Shop Now",
                url: "https://example.com/shop",
              },
              {
                type: "QUICK_REPLY",
                text: "Learn More",
              },
            ],
          },
        ],
      },
      UTILITY: {
        name: "utility_example",
        language: "en_US",
        category: "UTILITY",
        components: [
          {
            type: "BODY",
            text: "Your order {{1}} for a total of {{2}} is confirmed. The expected delivery is {{3}}.",
            example: {
              body_text: [["ORDER-5555", "99 USD", "February 25, 2023"]],
            },
          },
        ],
      },
      AUTHENTICATION: {
        name: "auth_example",
        language: "en_US",
        category: "AUTHENTICATION",
        messageSendTtlSeconds: 600,
        components: [
          {
            type: "BODY",
            text: "{{1}} is your verification code. For your security, do not share this code.",
            add_security_recommendation: true,
            example: {
              body_text: [["123456"]],
            },
          },
          {
            type: "FOOTER",
            text: "This code expires in 5 minutes.",
            code_expiration_minutes: 5,
          },
          {
            type: "BUTTONS",
            buttons: [
              {
                type: "OTP",
                otp_type: "COPY_CODE",
                text: "Copy Code",
              },
            ],
          },
        ],
      },
    };

    const example = examples[category as keyof typeof examples];
    if (example) {
      setJsonInput(JSON.stringify(example, null, 2));
      setValidationStatus("idle");
      setErrorMessage("");
      setValidationResults([]);
      setParsedTemplate(null);
      setActiveTab("input");
    }
  };

  const getStatusIcon = () => {
    switch (validationStatus) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "validating":
        return <Zap className="h-5 w-5 text-blue-500 animate-pulse" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (validationStatus) {
      case "success":
        return "Template is valid!";
      case "error":
        return "Template has errors";
      case "validating":
        return "Validating...";
      default:
        return "Ready to validate";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with validation status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <CardTitle className="text-xl">
                  Template Validation Status
                </CardTitle>
                <CardDescription>{getStatusText()}</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleValidate}
                disabled={
                  validationStatus === "validating" || !jsonInput.trim()
                }
                className="flex items-center space-x-2"
              >
                <Zap className="h-4 w-4" />
                <span>
                  {validationStatus === "validating"
                    ? "Validating..."
                    : "Validate Template"}
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main content tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="input" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Input</span>
          </TabsTrigger>
          <TabsTrigger
            value="results"
            disabled={validationResults.length === 0}
          >
            <span>Results</span>
            {validationResults.length > 0 && (
              <Badge
                variant={
                  validationStatus === "success" ? "default" : "destructive"
                }
                className="ml-2"
              >
                {validationResults.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!parsedTemplate}>
            <Eye className="h-4 w-4 mr-2" />
            <span>Preview</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Template JSON Input</CardTitle>
                  <CardDescription>
                    Paste your WhatsApp Business template JSON or load an
                    example
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const content = event.target?.result as string;
                          setJsonInput(content);
                        };
                        reader.readAsText(file);
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload JSON
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste your WhatsApp template JSON here..."
                className="min-h-[400px] font-mono text-sm"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Load example:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadExampleTemplate("MARKETING")}
                  >
                    Marketing
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadExampleTemplate("UTILITY")}
                  >
                    Utility
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadExampleTemplate("AUTHENTICATION")}
                  >
                    Authentication
                  </Button>
                </div>
              </div>

              {errorMessage && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          {validationResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Validation Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {validationResults.map((result, index) => (
                  <Alert
                    key={index}
                    variant={
                      result.type === "error" ? "destructive" : "default"
                    }
                  >
                    {result.type === "error" ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      <Badge
                        variant={
                          result.type === "error" ? "destructive" : "secondary"
                        }
                        className="mr-2"
                      >
                        {result.type.toUpperCase()}
                      </Badge>
                      {result.message}
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preview">
          {parsedTemplate && <TemplatePreview template={parsedTemplate} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
