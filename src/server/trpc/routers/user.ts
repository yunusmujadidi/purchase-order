import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { auth } from "@/lib/auth";

export const userRouter = createTRPCRouter({
  // Get all users (superadmin only)
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Create user (superadmin only)
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        role: z.enum(["ADMIN", "WORKER"]),
      })
    )
    .mutation(async ({ input }) => {
      // Generate username from name (lowercase, no spaces)
      const username = input.name.toLowerCase().replace(/\s+/g, "");

      // Create user via Better Auth (without email - username only)
      const result = await auth.api.signUpEmail({
        body: {
          email: `${username}@internal.local`, // Dummy email
          password: input.password,
          name: input.name,
          role: input.role,
          isActive: true,
        },
      });

      return result;
    }),

  // Update user (superadmin only)
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        role: z.enum(["ADMIN", "WORKER"]).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.user.update({
        where: { id },
        data,
      });
    }),

  // Delete user (superadmin only)
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.delete({
        where: { id: input.id },
      });
    }),
});
