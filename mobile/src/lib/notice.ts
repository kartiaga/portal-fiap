export type Notice = { kind: 'success' | 'error'; text: string };

// Aviso deixado por uma tela que acabou de fechar (por exemplo, "Postagem publicada.")
// para a tela que volta a aparecer. Faz o papel do ?feedback= do frontend web.
let pendingNotice: Notice | null = null;

export function setFlashNotice(notice: Notice): void {
  pendingNotice = notice;
}

/** Devolve o aviso pendente, se houver, e o descarta para não ser exibido duas vezes. */
export function takeFlashNotice(): Notice | null {
  const notice = pendingNotice;
  pendingNotice = null;
  return notice;
}
