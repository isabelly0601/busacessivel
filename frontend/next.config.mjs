import withPWAInit from "@ducanh2912/next-pwa";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === 'development', // Ativado em produção para offline
  register: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  images: { unoptimized: true },
  turbopack: {
    root: __dirname,
  },
};

export default withPWA(nextConfig);
