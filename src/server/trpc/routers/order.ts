import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const orderRouter = createTRPCRouter({
  // Get all orders
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.order.findMany({
      include: {
        createdBy: {
          select: { username: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Get single order
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.order.findUnique({
        where: { id: input.id },
        include: { createdBy: true },
      });
    }),

  // Create order
  create: publicProcedure
    .input(
      z.object({
        clientName: z.string().min(1),
        productName: z.string().min(1),
        quantity: z.number().min(1),
        materials: z.array(z.string()),
        deliveryDate: z.date().optional(),
        // ... add more fields
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate order number
      const count = await ctx.db.order.count();
      const orderNumber = `ORD-${new Date().getFullYear()}-${String(
        count + 1
      ).padStart(4, "0")}`;

      return ctx.db.order.create({
        data: {
          orderNumber,
          ...input,
          createdById: "temp-user-id", // TODO: Get from session
        },
      });
    }),

  // Update order
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          clientName: z.string().optional(),
          productName: z.string().optional(),
          // ... more fields
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.order.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  // Delete order
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.order.delete({
        where: { id: input.id },
      });
    }),
});
