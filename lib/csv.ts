function celula(valor: unknown): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  return `"${texto.replace(/"/g, '""')}"`;
}

export function baixarCsv(nomeArquivo: string, colunas: string[], linhas: unknown[][]) {
  const conteudo = [colunas, ...linhas].map((linha) => linha.map(celula).join(",")).join("\r\n");
  // BOM pra acentuação abrir certo no Excel
  const blob = new Blob(["﻿" + conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
