/** @type {import('next').NextConfig} */
// Marketing site served at accessbim.com via GitHub Pages with a custom domain.
// Custom domain = root path, so basePath/assetPrefix stay empty.
//
// If you ever need to revert to the legacy username.github.io/access-barbados/
// URL, set BASE_PATH=/access-barbados in the GH Actions env.
const basePath = process.env.BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : "",
};

export default nextConfig;
