import { z } from "zod";
import type { ZodTypeAny } from "zod";

export const generateZodSchema = (fields: any[]): z.ZodObject<any> => {
  console.log("🔧 Generating Zod schema for fields:", fields);
  const schemaShape: Record<string, ZodTypeAny> = {};

  fields.forEach((field) => {
    // Check both `enabled` (from constants) and `isActive` (from database)
    const isFieldActive = field.enabled !== false && field.isActive !== false;
    console.log(`🔍 Field ${field.name}: enabled=${field.enabled}, isActive=${field.isActive}, active=${isFieldActive}`);
    
    if (!isFieldActive) {
      console.log(`⏭️ Skipping inactive field: ${field.name}`);
      return; // Skip inactive fields
    }

    let zodField: ZodTypeAny;

    switch (field.type) {
      case "text":
      case "textarea":
        zodField = z.string().min(1, `${field.label} is required`);
        break;

      case "email":
        zodField = z.string().email(`${field.label} must be a valid email`);
        break;

      case "number":
        zodField = z.string().refine((val) => !isNaN(Number(val)), {
          message: `${field.label} must be a number`,
        });
        break;

      case "tel":
        zodField = z
          .string()
          .regex(/^[0-9]{10}$/, `${field.label} must be a valid 10-digit number`);
        break;

      case "checkbox":
        // Handle checkbox values - they can come as string "true"/"false" or boolean
        zodField = z.union([z.boolean(), z.string()]).transform((val) => {
          if (typeof val === 'boolean') return val;
          if (typeof val === 'string') {
            return val === 'true' || val === 'on' || val === '1';
          }
          return Boolean(val);
        });
        break;

      case "select":
        zodField = z
          .string()
          .min(1, `${field.label} is required`)
          .refine((val) => field.options?.some((opt: any) => opt.value === val), {
            message: `${field.label} selection is invalid`,
          });
        break;

      case "date":
        zodField = z.string().min(1, `${field.label} is required`);
        break;


      case "file":
        // You might use react-hook-form's `validate` separately for actual file uploads
        zodField = z.any(); // Or custom refine
        break;

      default:
        zodField = z.any();
    }

    // Add required check
    if (field.required !== false) {
      console.log(`✅ Adding field to schema: ${field.name} (${field.type})`);
      schemaShape[field.name] = zodField;
    } else {
      console.log(`ℹ️ Field ${field.name} is optional, skipping validation`);
    }
  });

  console.log("📋 Final schema shape:", Object.keys(schemaShape));
  return z.object(schemaShape);
};
