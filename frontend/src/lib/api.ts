// API_URL só existe no servidor (é a que o docker-compose troca para a URL
// interna http://api:3000). NEXT_PUBLIC_API_URL é o fallback: sempre existe,
// inclusive rodando o frontend fora do Docker.
export function getApiUrl(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001"
  );
}
