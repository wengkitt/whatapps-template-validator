import { TemplateValidator } from "@/components/TemplateValidator";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            WhatsApp Business Template Validator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Validate your WhatsApp Business message templates before submission
            to Meta. Get detailed feedback and fix issues before they cause
            rejections.
          </p>
        </div>

        <TemplateValidator />
      </div>
    </div>
  );
}
