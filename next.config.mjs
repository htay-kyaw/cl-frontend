import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // pin tracing to this repo (a stray package-lock.json in the home folder confuses root detection)
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),

  images: {
    // product, banner and category images are uploaded to Cloudinary by the backend
    remotePatterns: [new URL("https://res.cloudinary.com/**")],
  },
};

export default nextConfig;
