import nodemailer from "nodemailer";

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  const transporter = nodemailer.createTransport({
  host: "smtps.aruba.it",
  port: 465,
  secure: true, // true se usi porta 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

  await transporter.sendMail({
    from: `"CB BETTONAGLI-registrazione utente" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Conferma registrazione",
    html: `
      <p>Ciao! Per completare la registrazione, clicca sul link:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Il link è valido per 1 ora.</p>
    `,
  });
}