"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerificaEmailInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams?.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Token mancante o non valido.");
      return;
    }

    fetch(`/api/auth/verify?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage("Email verificata con successo!");
        } else {
          setStatus("error");
          setMessage(data.error || "Errore nella verifica dell'email.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Errore durante la verifica.");
      });
  }, [searchParams]);

  return (
    <div className="max-w-md mx-auto py-10 text-center">
      {status === "loading" && <p>Verifica in corso...</p>}
      {status === "success" && <p className="text-green-600">{message}</p>}
      {status === "error" && <p className="text-red-600">{message}</p>}
    </div>
  );
}
