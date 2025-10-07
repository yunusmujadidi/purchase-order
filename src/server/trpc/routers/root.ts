import { createTRPCRouter } from "../trpc";
import { orderRouter } from "./order";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
  order: orderRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
