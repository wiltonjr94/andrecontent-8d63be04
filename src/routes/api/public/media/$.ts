import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat;
        if (!path) return new Response("Not found", { status: 404 });
        const projectId = process.env.SUPABASE_PROJECT_ID;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!projectId || !key) return new Response("Not found", { status: 404 });
        const host = `https://${projectId}.supabase.co`;
        const upstream = await fetch(
          `${host}/storage/v1/object/media/${path}`,
          { headers: { apikey: key, Authorization: `Bearer ${key}` } },
        );
        if (!upstream.ok) return new Response("Not found", { status: 404 });
        const buf = await upstream.arrayBuffer();
        return new Response(buf, {
          headers: {
            "Content-Type":
              upstream.headers.get("content-type") || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});