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

export async function getPosts(token: string) {
  const response = await fetch(`${getApiUrl()}/posts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Não foi possivel carregar os posts.");
  }
  return response.json();
}
