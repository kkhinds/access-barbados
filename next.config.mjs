/** @type {import('next').NextConfig} */
const isGhPages = process.env.GITHUB_PAGES === "true";
const repoName = "access-barbados";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // When deployed to GitHub Pages at username.github.io/access-barbados/, all
  // links/assets need to be prefixed. Locally (npm run dev) we keep paths at /.
  basePath: isGhPages ? `/${repoName}` : "",
  assetPrefix: isGhPages ? `/${repoName}/` : "",
};

export default nextConfig;
