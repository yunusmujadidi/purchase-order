import { z } from "zod";

// Login Schema
export const loginSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Order Schema
export const orderFormSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientProject: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  size: z.string().optional(),
  description: z.string().optional(),
  pictureRef: z.string().optional(),
  materials: z.string().optional(), // Comma-separated string, will be converted to array
  poApprovalDate: z.date().optional(),
  deliveryDate: z.date().optional(),
  deliveryAddress: z.string().optional(),
  priority: z.enum(["URGENT", "STANDARD", "LOW"]).optional(),
  notes: z.string().optional(),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;
