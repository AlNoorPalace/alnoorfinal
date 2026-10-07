/** @type {import('next').NextConfig} */

// Hotel photos uploaded in the admin live in this project's Supabase storage
// bucket. Allow exactly that bucket (and nothing else) for next/image.
const images = { formats: ["image/webp"] };
if (process.env.SUPABASE_URL) {
  try {
    const u = new URL(process.env.SUPABASE_URL);
    images.remotePatterns = [
      {
        protocol: u.protocol.replace(":", ""),
        hostname: u.hostname,
        port: u.port,
        pathname: "/storage/v1/object/public/hotel-images/**",
      },
    ];
  } catch {
    // an invalid SUPABASE_URL is reported where the database is used
  }
}

const nextConfig = {
  reactStrictMode: true,
  images,
};

module.exports = nextConfig;
