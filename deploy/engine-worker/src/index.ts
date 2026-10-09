import { Container } from "@cloudflare/containers";

interface Env {
  ENGINE: DurableObjectNamespace<Engine>;
  DATABASE_URL: string;
  FRED_API_KEY: string;
  ENGINE_API_TOKEN: string;
}

/** The Python engine (services/engine) as a single container instance. */
export class Engine extends Container<Env> {
  defaultPort = 8080;
  sleepAfter = "10m";
  pingEndpoint = "container/ping";

  constructor(ctx: DurableObjectState<Env>, env: Env) {
    super(ctx, env);
    this.envVars = {
      DATABASE_URL: env.DATABASE_URL,
      FRED_API_KEY: env.FRED_API_KEY,
      ENGINE_API_TOKEN: env.ENGINE_API_TOKEN,
    };
  }
}

const engine = (env: Env) => env.ENGINE.getByName("engine");

function authorised(req: Request, env: Env): boolean {
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const want = env.ENGINE_API_TOKEN ?? "";
  if (!want || given.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= given.charCodeAt(i) ^ want.charCodeAt(i);
  return diff === 0;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/health") return engine(env).fetch(new Request("http://container/health"));
    if (url.pathname === "/run" && req.method === "POST") {
      if (!authorised(req, env)) return new Response("unauthorised", { status: 401 });
      return engine(env).fetch(
        new Request(`http://container/run${url.search}`, { method: "POST", headers: { authorization: `Bearer ${env.ENGINE_API_TOKEN}` } }),
      );
    }
    return new Response("not found", { status: 404 });
  },

  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      engine(env)
        .fetch(new Request("http://container/run", { method: "POST", headers: { authorization: `Bearer ${env.ENGINE_API_TOKEN}` } }))
        .then(async (r) => console.log("engine run", r.status, (await r.text()).slice(0, 500))),
    );
  },
};
