import z from "zod";
import { createDashboardSidebarCategoriesAndFields } from "@/components/createDashboard/createDashboardSidebarFields/createDashboardSidebarCategoriesAndFields";

function generateZodSchema(categories) {
  const fieldSchemas = {};

  categories.forEach(category => {
    category.tabs.forEach(tab => {
      tab.fields.forEach(field => {
        let fieldSchema;
        switch (field.type) {
          case "text":
            fieldSchema = z.string();
            break;
          case "date":
            fieldSchema = z.coerce.date();
            break;
          case "select":
            fieldSchema = z.string();
            break;
          case "number":
            fieldSchema = z.number();
            break;
          default:
            fieldSchema = z.any();
        }

        if (!!field?.required) {
          switch (field.type) {
            case "date":
              fieldSchema = fieldSchema.min(new Date(), `${field.name} is required`);
              break;
            case "number":
              fieldSchema = fieldSchema.min(1, `${field.name} is required`);
              break;
            default:
              fieldSchema = fieldSchema.min(1, `${field.name} is required`);
          }
        } else {
          fieldSchema = fieldSchema.optional();
        }
        fieldSchemas[field.id] = fieldSchema;
      });
    });
  });

  // Custom schema for custom fields
  fieldSchemas["name"] = z.string().min(1, "Name is required");
  fieldSchemas["description"] = z.string().optional();
  return z.object(fieldSchemas);
}

export const schema = generateZodSchema(createDashboardSidebarCategoriesAndFields);