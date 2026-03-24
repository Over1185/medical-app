import { createClient } from "@libsql/client";
import { env } from "@/lib/config/env";

export const tursoClient = createClient({
  url: env.tursoDatabaseUrl,
  authToken: env.tursoAuthToken,
});
