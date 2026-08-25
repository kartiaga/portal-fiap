import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();

  // Checagem "de verdade": diferente do proxy.ts (que só olha se o cookie
  // existe), aqui decodificamos o JWT e conferimos a expiração antes de
  // renderizar qualquer coisa.
  if (!session) {
    redirect("/login");
  }

  redirect("/posts");
}
