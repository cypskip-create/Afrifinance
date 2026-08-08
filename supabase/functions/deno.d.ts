/// <reference lib="deno.ns" />

declare namespace Deno {
  interface Env {
    get(name: string): string | undefined;
  }
}

declare const Deno: {
  env: Deno.Env;
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};
