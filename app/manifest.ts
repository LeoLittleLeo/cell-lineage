import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "细胞 CELL · 让承诺生长",
    short_name: "细胞 CELL",
    description: "前夜写入基因，今天让承诺在细胞中生长。",
    start_url: "/?source=pwa",
    display: "standalone",
    background_color: "#f3f1e9",
    theme_color: "#536b59",
    orientation: "any",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
    shortcuts: [{ name: "捕捉明日基因", short_name: "明日基因", url: "/?capture=tomorrow" }],
  };
}
