import { z } from "zod";

export const orderFormSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientProject: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  size: z.string().optional(),
  description: z.string().optional(),
  materials: z.string().optional(),
  deliveryDate: z.date().optional(),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;
