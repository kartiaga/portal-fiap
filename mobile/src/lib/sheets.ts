/**
 * Altura das folhas de lista (fração da tela), usada no `sheetAllowedDetents` da rota e no ajuste
 * do teclado. Um detent só: com mais de um, o conteúdo é medido na altura maior e o rodapé
 * (campo de comentário) ficaria fora da tela no detent menor.
 */
export const SheetDetent = {
  comments: 0.75,
  likes: 0.6,
} as const;
