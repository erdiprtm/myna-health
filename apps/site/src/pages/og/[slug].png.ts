import { getCollection } from "astro:content";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import type { APIRoute, GetStaticPaths } from "astro";
import satori from "satori";
import { fillPlaceholders, product } from "../../lib/site";

// Open Graph images (1200×630 PNG) rendered at build time: satori → SVG → resvg (wasm, no native deps).
const require = createRequire(import.meta.url);
let wasmReady: Promise<void> | undefined;
const initResvg = () => {
  wasmReady ??= readFile(require.resolve("@resvg/resvg-wasm/index_bg.wasm")).then((buf) => initWasm(buf));
  return wasmReady;
};
// @fontsource packages only export CSS; their .woff files sit next to index.css (satori can't read woff2).
const fontFile = (pkg: string, file: string) => readFile(join(dirname(require.resolve(pkg)), "files", file));
const fonts = Promise.all([
  fontFile("@fontsource/montserrat", "montserrat-latin-800-normal.woff"),
  fontFile("@fontsource/montserrat", "montserrat-latin-400-normal.woff"),
]);

export const getStaticPaths = (async () => {
  const fixed = [
    { slug: "home", title: product.tagline },
    { slug: "kontak", title: "Kontak" },
    { slug: "tentang", title: "Tentang Kami" },
  ];
  const legal = (await getCollection("legal")).map((e) => ({ slug: e.id, title: fillPlaceholders(e.data.title) }));
  const seo = (await getCollection("seo")).map((e) => ({ slug: e.id, title: e.data.title }));
  return [...fixed, ...legal, ...seo].map(({ slug, title }) => ({ params: { slug }, props: { title } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  await initResvg();
  const [bold, regular] = await fonts;
  // Brand guideline 2026 (P-011): navy surface, white title, cyan rule.
  const [paper, ink, accent] = ["#032b84", "#ffffff", "#24dde2"];
  const svg = await satori(
    {
      type: "div",
      key: "root",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 80,
          background: paper,
          color: ink,
          fontFamily: "Montserrat",
          borderTop: `16px solid ${accent}`,
        },
        children: [
          {
            type: "div",
            key: "name",
            props: { style: { fontSize: 34, fontWeight: 400, color: "#dae7fc" }, children: product.name },
          },
          {
            type: "div",
            key: "title",
            props: {
              style: { fontSize: 64, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1.5, maxWidth: 980 },
              children: String(props.title),
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Montserrat", data: bold, weight: 800, style: "normal" },
        { name: "Montserrat", data: regular, weight: 400, style: "normal" },
      ],
    },
  );
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { "content-type": "image/png" } });
};
