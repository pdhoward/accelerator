import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Brand imagery (logo, social cards) is hosted on our Cloudinary account.
    remotePatterns: [new URL("https://res.cloudinary.com/stratmachine/**")],
  },
};

export default nextConfig;
