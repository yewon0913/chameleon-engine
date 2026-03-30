import { initTRPC } from "@trpc/server";

export interface TRPCContext {
  userId: string | null;
}

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
