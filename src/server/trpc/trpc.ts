import { initTRPC } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import superjson from "superjson";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db: prisma,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
