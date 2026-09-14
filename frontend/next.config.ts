import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // ajuda o Docker a gerar um arquivo executável ao rodar `docker build`
  agentRules: false, // evita que `next dev` reescreva CLAUDE.md com instruções para agentes
};

export default nextConfig;
