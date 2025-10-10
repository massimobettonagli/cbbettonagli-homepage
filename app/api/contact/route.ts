import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message, token } = body;

    if (!name || !email || !message) {
      return new Response("Dati mancanti nel form", { status: 400 });
    }

    // ✅ Verifica reCAPTCHA Enterprise
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      console.error("❌ RECAPTCHA_SECRET_KEY mancante nelle variabili d’ambiente");
      return new Response("Errore di configurazione reCAPTCHA", { status: 500 });
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);

    const recaptchaRes = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const recaptchaData = await recaptchaRes.json();

    // ✅ Controlla validità del token
    if (!recaptchaData.success) {
      console.error("❌ reCAPTCHA fallito:", recaptchaData);
      return new Response("Verifica reCAPTCHA fallita", { status: 403 });
    }

    if (recaptchaData.score !== undefined && recaptchaData.score < 0.5) {
      console.warn("⚠️ reCAPTCHA score basso:", recaptchaData.score);
      return new Response("Interazione sospetta, messaggio bloccato", { status: 403 });
    }

    // ✅ Configura Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // usa TLS su 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ✅ Prepara l'email
    const mailOptions = {
      from: `"Sito Web CB Bettonagli" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
      subject: `📩 Nuovo messaggio da ${name}`,
      text: `
Hai ricevuto un nuovo messaggio dal sito web:

👤 Nome: ${name}
📧 Email: ${email}

💬 Messaggio:
${message}

-----
Inviato tramite il modulo contatti www.cbbettonagli.it
      `,
    };

    // ✅ Invia l'email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email inviata correttamente:", info.messageId);

    return new Response("Messaggio inviato con successo", { status: 200 });
  } catch (error: any) {
    console.error("❌ Errore nel backend /api/contact:", error);
    return new Response("Errore interno nel server", { status: 500 });
  }
}