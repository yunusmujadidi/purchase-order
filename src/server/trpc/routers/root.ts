import { createTRPCRouter } from "../trpc";
import { orderRouter } from "./order";

export const appRouter = createTRPCRouter({
  order: orderRouter,
});

export type AppRouter = typeof appRouter;
