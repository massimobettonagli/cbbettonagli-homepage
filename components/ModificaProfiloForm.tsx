'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

export default function ModificaProfiloForm() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        password: '',
      });
    }
  }, [session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Profilo aggiornato con successo!');
        setFormData((prev) => ({ ...prev, password: '' }));
      } else {
        const data = await res.json();
        setError(data.error || 'Errore durante la modifica');
        toast.error(data.error || 'Errore durante la modifica');
      }
    } catch {
      setError('Errore di rete.');
      toast.error('Errore di rete.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-semibold text-[#C73A3A]">Modifica profilo</h2>

      <input
        type="text"
        placeholder="Nome"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full p-3 border rounded"
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="w-full p-3 border rounded"
        required
      />

      <input
        type="password"
        placeholder="Nuova password (opzionale)"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        className="w-full p-3 border rounded"
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        className="bg-[#C73A3A] text-white py-2 px-4 rounded-lg hover:bg-[#a72f2f] transition"
      >
        Salva modifiche
      </button>

      <div className="mt-8 p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
  <h3 className="text-lg font-semibold text-[#C73A3A] mb-4">
    Dati attuali del profilo
  </h3>
  <div className="space-y-3 text-sm text-gray-700">
    <div className="flex justify-between">
      <span className="font-medium">Nome:</span>
      <span>{session?.user?.name || '—'}</span>
    </div>
    <div className="flex justify-between">
      <span className="font-medium">Email:</span>
      <span>{session?.user?.email || '—'}</span>
    </div>
    <div className="flex justify-between">
      <span className="font-medium">Password:</span>
      <span>******</span>
    </div>
  </div>
</div>
    </form>
  );
}
