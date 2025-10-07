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
      // Generate unique order number based on highest existing number for the year
      const year = new Date().getFullYear();
      const yearPrefix = `ORD-${year}-`;

      // Find the highest order number for this year
      const lastOrder = await ctx.db.order.findFirst({
        where: {
          orderNumber: {
            startsWith: yearPrefix,
          },
        },
        orderBy: {
          orderNumber: "desc",
        },
        select: {
          orderNumber: true,
        },
      });

      let nextNumber = 1;
      if (lastOrder) {
        // Extract the number from the order number (e.g., "ORD-2025-0003" -> 3)
        const lastNumber = parseInt(lastOrder.orderNumber.split("-")[2]);
        nextNumber = lastNumber + 1;
      }

      const orderNumber = `${yearPrefix}${String(nextNumber).padStart(4, "0")}`;

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

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "PENDING",
          "IN_PROGRESS",
          "COMPLETED",
          "CANCELLED",
          "ON_HOLD",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.order.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  updateStage: publicProcedure
    .input(
      z.object({
        id: z.string(),
        currentStage: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.order.update({
        where: { id: input.id },
        data: { currentStage: input.currentStage },
      });
    }),

  bulkImport: publicProcedure
    .input(
      z.object({
        orders: z.array(
          z.object({
            rowNumber: z.number().optional().nullable(),
            swCode: z.string().optional().nullable(),
            clientName: z.string(),
            clientProject: z.string().optional().nullable(),
            productName: z.string(),
            quantity: z.number(),
            size: z.string().optional().nullable(),
            description: z.string().optional().nullable(),
            pictureRef: z.string().optional().nullable(),
            materials: z.array(z.string()).default([]),
            poApprovalDate: z.date().optional().nullable(),
            deliveryDate: z.date().optional().nullable(),
            deliveryAddress: z.string().optional().nullable(),
            // Process stage dates
            metalIn: z.date().optional().nullable(),
            metalOut: z.date().optional().nullable(),
            veneerIn: z.date().optional().nullable(),
            veneerOut: z.date().optional().nullable(),
            assyIn: z.date().optional().nullable(),
            assyOut: z.date().optional().nullable(),
            finishingIn: z.date().optional().nullable(),
            finishingOut: z.date().optional().nullable(),
            packingIn: z.date().optional().nullable(),
            packingOut: z.date().optional().nullable(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get admin user for createdBy
      const admin = await ctx.db.user.findFirst({
        where: { role: "SUPERADMIN" },
      });

      if (!admin) throw new Error("No admin user found");

      // Generate unique order numbers based on highest existing number for the year
      const year = new Date().getFullYear();
      const yearPrefix = `ORD-${year}-`;

      // Find the highest order number for this year
      const lastOrder = await ctx.db.order.findFirst({
        where: {
          orderNumber: {
            startsWith: yearPrefix,
          },
        },
        orderBy: {
          orderNumber: "desc",
        },
        select: {
          orderNumber: true,
        },
      });

      let startNumber = 1;
      if (lastOrder) {
        const lastNumber = parseInt(lastOrder.orderNumber.split("-")[2]);
        startNumber = lastNumber + 1;
      }

      // Prepare orders with generated order numbers
      const ordersToCreate = input.orders.map((order, index) => {
        const orderNumber = `${yearPrefix}${String(
          startNumber + index
        ).padStart(4, "0")}`;

        // Determine current stage based on process dates
        let currentStage = "PENDING";
        if (order.packingOut) currentStage = "COMPLETED";
        else if (order.packingIn) currentStage = "PACKING";
        else if (order.finishingOut || order.finishingIn)
          currentStage = "FINISHING";
        else if (order.assyOut || order.assyIn) currentStage = "ASSY";
        else if (order.veneerOut || order.veneerIn) currentStage = "VENEER";
        else if (order.metalOut || order.metalIn) currentStage = "METAL";

        // Determine status
        let status: "PENDING" | "IN_PROGRESS" | "COMPLETED" = "PENDING";
        if (currentStage === "COMPLETED") status = "COMPLETED";
        else if (currentStage !== "PENDING") status = "IN_PROGRESS";

        return {
          orderNumber,
          rowNumber: order.rowNumber,
          swCode: order.swCode,
          clientName: order.clientName,
          clientProject: order.clientProject,
          productName: order.productName,
          quantity: order.quantity,
          size: order.size,
          description: order.description,
          pictureRef: order.pictureRef,
          materials: order.materials,
          poApprovalDate: order.poApprovalDate,
          deliveryDate: order.deliveryDate,
          deliveryAddress: order.deliveryAddress,
          currentStage,
          status,
          priority: "STANDARD" as const,
          metalIn: order.metalIn,
          metalOut: order.metalOut,
          veneerIn: order.veneerIn,
          veneerOut: order.veneerOut,
          assyIn: order.assyIn,
          assyOut: order.assyOut,
          finishingIn: order.finishingIn,
          finishingOut: order.finishingOut,
          packingIn: order.packingIn,
          packingOut: order.packingOut,
          createdById: admin.id,
        };
      });

      // Bulk create orders
      const result = await ctx.db.order.createMany({
        data: ordersToCreate,
        skipDuplicates: true, // Skip if order number already exists
      });

      return {
        count: result.count,
        message: `Successfully imported ${result.count} orders`,
      };
    }),
});
