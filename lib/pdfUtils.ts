// lib/pdfUtils.ts
import { jsPDF } from "jspdf";

type RequestItem = {
  text: string;
  files: File[];
};

type GeneratePDFParams = {
  requests: RequestItem[];
  addressId: string;
};

export async function generatePDFRequest({ requests, addressId }: GeneratePDFParams) {
  // Recupera indirizzo selezionato
  const res = await fetch(`/api/user/shipping/${addressId}`);
  const address = await res.json();

  // Fallback per i campi dell'indirizzo
  const nome = address?.name ?? "Nome non disponibile";
  const via = address?.address ?? "Indirizzo sconosciuto";
  const numero = address?.numeroCivico ?? "N°";
  const cap = address?.cap ?? "CAP";
  const citta = address?.city ?? "Città";

  const doc = new jsPDF();

  // Intestazione azienda
  doc.setFontSize(12);
  doc.text("CB Bettonagli Srl", 15, 20);
  doc.text("Via Industriale, 10 – 24047 Treviglio (BG)", 15, 28);
  doc.text("info@cbbettonagli.it", 15, 36);

  // Intestazione destinatario
  doc.setFontSize(14);
  doc.text("Destinatario:", 15, 50);
  doc.setFontSize(12);
  doc.text(nome, 15, 58);
  doc.text(`${via}, ${numero} - ${cap} ${citta}`, 15, 66);

  // Tabella delle richieste
  let y = 80;
  requests.forEach((req, i) => {
    doc.text(`Richiesta ${i + 1}`, 15, y);
    y += 8;
    doc.text(req.text || "(nessuna descrizione)", 20, y);
    y += 10;
  });

  // Salva come blob
  const blob = doc.output("blob");

  // Invia via email
  const formData = new FormData();
  formData.append("pdf", blob, "richiesta.pdf");

  await fetch("/api/email/send-request", {
    method: "POST",
    body: formData,
  });

  alert("✅ PDF generato e inviato via email!");
}