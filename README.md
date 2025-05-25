# WhatsApp Business Template Validator

A comprehensive tool for validating WhatsApp Business message templates before submission to Meta. This project solves the critical problem of template rejections by providing detailed validation and actionable feedback.

## 🚀 Features

- **Comprehensive Validation**: Validates templates against WhatsApp Business API requirements
- **Real-time Feedback**: Instant validation with detailed error messages and suggestions
- **Character Limits**: Automatic checking of character limits for all components
- **Variable Validation**: Ensures proper variable formatting and sequencing ({{1}}, {{2}}, etc.)
- **Example Templates**: Pre-built examples for Marketing, Utility, and Authentication categories
- **JSON Upload**: Support for uploading template JSON files
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS

## 🎯 Problem Solved

When Meta rejects WhatsApp Business message templates, they often don't provide specific error details or reasons for rejection. This creates a frustrating trial-and-error cycle. Our validator provides:

- **Clear Error Messages**: Specific details about what's wrong
- **Actionable Suggestions**: How to fix each issue
- **Comprehensive Checks**: All validation rules in one place
- **Prevention**: Catch issues before submission

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Validation**: Zod schemas with custom business logic
- **Icons**: Lucide React
- **Charts**: Recharts (for advanced features)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/whatsapp-template-validator.git
cd whatsapp-template-validator
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Basic Validation

1. **Input Template**: Paste your WhatsApp template JSON in the text area
2. **Load Examples**: Use the example buttons to see valid template structures
3. **Validate**: Click "Validate Template" to check for errors
4. **Review Results**: See detailed validation results with error/warning badges
5. **Fix Issues**: Address any errors or warnings highlighted with specific suggestions

### Example Templates

The validator includes examples for all three template categories:

- **Marketing**: Templates for promotional content with media headers and buttons
- **Utility**: Templates for transactional messages like order confirmations
- **Authentication**: Templates for OTP and verification codes

### File Upload

You can upload JSON files directly using the "Upload JSON" button for quick validation of existing templates.

## 📋 Template Structure

WhatsApp Business templates consist of:

### Required Components

- **Body**: Main message content (max 1024 characters)
- **Name**: Template identifier (lowercase, numbers, underscores only)
- **Language**: Language code (e.g., en_US, es, fr)
- **Category**: MARKETING, UTILITY, or AUTHENTICATION

### Optional Components

- **Header**: Text (60 chars), image, video, document, or location
- **Footer**: Additional text without variables (60 chars)
- **Buttons**: Interactive elements (URLs, quick replies, OTP, etc.)

## ✅ Validation Rules

The validator performs comprehensive checks:

### Basic Structure

- Template name format validation
- Required fields presence
- Component type validation
- Proper JSON structure

### Character Limits

- Header text: 60 characters
- Body text: 1024 characters
- Footer text: 60 characters
- Button text: 25 characters

### Variable Validation

- Sequential numbering ({{1}}, {{2}}, {{3}})
- Proper formatting
- No gaps in sequence
- Component-specific rules

### Category-Specific Rules

- **Authentication**: TTL limits (30s - 15min), OTP button recommendations
- **Utility**: TTL limits (30s - 12hrs), order status handling
- **Marketing**: TTL limits (12hrs - 30days), media header recommendations

### Button Validation

- Type-specific limits (max 1 phone, 2 URL, 1 copy code)
- Quick reply grouping requirements
- OTP button configuration validation

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── TemplateValidator.tsx  # Main validator component
│   ├── ValidationResults.tsx # Results display
│   ├── TemplatePreview.tsx   # Template preview
│   └── TemplateStats.tsx     # Statistics component
├── lib/                   # Utility libraries
│   ├── validators/        # Validation schemas and rules
│   │   ├── template-schema.ts
│   │   └── validation-rules.ts
│   └── parsers/          # Template parsing utilities
│       └── template-parser.ts
└── styles/               # Global styles
```

## 🔧 Development

### Adding New Validation Rules

1. Update schemas in `src/lib/validators/template-schema.ts`
2. Add business logic in `src/lib/validators/validation-rules.ts`
3. Update error messages and suggestions

### Adding New Components

1. Create component in `src/components/`
2. Follow existing patterns for props and styling
3. Use shadcn/ui components for consistency

### Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates/)
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Lucide](https://lucide.dev/) for the icons
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/whatsapp-template-validator/issues) page
2. Create a new issue with detailed information
3. Include template JSON and error messages when applicable

---

**Built with ❤️ to solve real WhatsApp Business template validation problems.**
