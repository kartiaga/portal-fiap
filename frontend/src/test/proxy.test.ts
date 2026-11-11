import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";

describe("Proxy - Controle de acesso", () => {
  it("deve permitir acessar /posts sem autenticação", () => {
    const request = new NextRequest("http://localhost:3000/posts");

    const response = proxy(request);

    expect(response.status).toBe(200);
  });

  it("deve permitir a leitura de um post sem autenticação", () => {
    const request = new NextRequest("http://localhost:3000/posts/123");

    const response = proxy(request);

    expect(response.status).toBe(200);
  });

  it("deve bloquear a edição de posts sem autenticação", () => {
    const request = new NextRequest("http://localhost:3000/posts/123/edit");

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login"
    );
  });

  it("deve bloquear a criação de posts sem autenticação", () => {
    const request = new NextRequest("http://localhost:3000/posts/new");

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login"
    );
  });

  it("deve bloquear a listagem de usuários sem autenticação", () => {
    const request = new NextRequest("http://localhost:3000/users/list");

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login"
    );
  });
});

it("deve redirecionar visitantes de /posts/admin para o login", () => {
  const request = new NextRequest("http://localhost:3000/posts/admin");

  const response = proxy(request);

  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toBe(
    "http://localhost:3000/login"
  );
});
