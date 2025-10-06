import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, message, token } = body;

  // 1️⃣ Verifica reCAPTCHA
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`;

  const res = await fetch(verifyUrl, { method: "POST" });
  const data = await res.json();

  if (!data.success || data.score < 0.5) {
    console.error("reCAPTCHA fallito:", data);
    return new Response("Captcha non valido", { status: 403 });
  }

  // 2️⃣ Configura il transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true, // true per 465, false per 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Sito Web CB Bettonagli" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_RECEIVER,  // Dove ricevi la mail
    subject: `Nuovo messaggio da ${name}`,
    text: `Hai ricevuto un messaggio dal sito:\n\nNome: ${name}\nEmail: ${email}\nMessaggio:\n${message}`,
  };

  // 3️⃣ Prova l'invio
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email inviata:", info);
    return new Response("Successo", { status: 200 });
  } catch (err) {
    console.error("Errore invio email:", err);
    return new Response("Errore invio email", { status: 500 });
  }
}