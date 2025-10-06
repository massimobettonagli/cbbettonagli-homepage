'use client';

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      const isAdmin = (session?.user as any)?.isAdmin;
      router.push(isAdmin ? "/dashboard-admin" : "/dashboard");
    }
  }, [session, status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const res = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    if (!res?.ok) {
      setError("Credenziali non valide.");
      setIsSubmitting(false);
    }
    // Se va a buon fine, verrà gestito dall'useEffect
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Box login */}
        <div className="bg-white p-8 rounded-xl shadow-xl">
          <h1 className="text-3xl font-bold text-center mb-6 text-[#C73A3A]">Accedi</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              required
              className="w-full p-3 border rounded"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full p-3 border rounded"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-[#C73A3A] text-white py-3 rounded-lg hover:bg-[#a72f2f] transition"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Accesso in corso..." : "Accedi"}
            </button>
          </form>
        </div>

        {/* Box registrazione */}
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <p className="text-gray-700 mb-4">Non hai un account?</p>
          <Link
            href="/registrati"
            className="inline-block bg-[#C73A3A] text-white py-2 px-6 rounded-lg hover:bg-[#a72f2f] transition"
          >
            Registrati
          </Link>
        </div>
      </div>
    </main>
  );
}
