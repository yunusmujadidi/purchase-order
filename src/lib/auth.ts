import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disable email verification for now
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
        unique: true,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "WORKER",
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
