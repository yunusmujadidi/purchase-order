import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const orderRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.order.findMany({
      include: {
        createdBy: {
          select: { name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.order.findUnique({
        where: { id: input.id },
        include: { createdBy: true },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        clientName: z.string().min(1),
        clientProject: z.string().optional(),
        productName: z.string().min(1),
        quantity: z.number().min(1),
        size: z.string().optional(),
        description: z.string().optional(),
        pictureRef: z.string().optional(),
        materials: z.array(z.string()).default([]),
        poApprovalDate: z.date().optional(),
        deliveryDate: z.date().optional(),
        deliveryAddress: z.string().optional(),
        priority: z.enum(["URGENT", "STANDARD", "LOW"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const count = await ctx.db.order.count();
      const orderNumber = `ORD-${new Date().getFullYear()}-${String(
        count + 1
      ).padStart(4, "0")}`;

      // TODO: Get actual user from session
      const admin = await ctx.db.user.findFirst({
        where: { role: "SUPERADMIN" },
      });

      if (!admin) throw new Error("No admin user found");

      return ctx.db.order.create({
        data: {
          orderNumber,
          ...input,
          priority: input.priority || "STANDARD",
          createdById: admin.id,
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        clientName: z.string().optional(),
        clientProject: z.string().optional(),
        productName: z.string().optional(),
        quantity: z.number().optional(),
        size: z.string().optional(),
        description: z.string().optional(),
        pictureRef: z.string().optional(),
        materials: z.array(z.string()).optional(),
        poApprovalDate: z.date().optional(),
        deliveryDate: z.date().optional(),
        deliveryAddress: z.string().optional(),
        currentStage: z.string().optional(),
        status: z
          .enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED", "ON_HOLD"])
          .optional(),
        priority: z.enum(["URGENT", "STANDARD", "LOW"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.order.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.order.delete({
        where: { id: input.id },
      });
    }),
});
