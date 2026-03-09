import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Photobooth Online",
    short_name: "Photobooth",
    description:
      "Create beautiful photo booth strips online for free. No sign up, no downloads.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff5f9",
    theme_color: "#ec4899",
    icons: [
      {
        src: "/favicon-v2.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
  };
}
