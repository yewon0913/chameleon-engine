import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/trpc/router";
import { createClient } from "@/lib/supabase/server";
import type { TRPCContext } from "@/server/trpc/init";

async function createContext(): Promise<TRPCContext> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return { userId: data.user?.id ?? null };
  } catch {
    return { userId: null };
  }
}

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
