/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Add this line
  images: { unoptimized: true } // Required for images to work on GH Pages
};
export default nextConfig;
