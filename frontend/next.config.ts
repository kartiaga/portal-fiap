import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // ajuda o Docker a gerar um arquivo executável ao rodar `docker build`
};

export default nextConfig;
