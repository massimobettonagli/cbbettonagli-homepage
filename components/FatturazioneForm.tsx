'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function FatturazioneForm() {
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    civicNumber: '',
    cap: '',
    city: '',
    codiceFiscale: '',
    partitaIva: '',
    email: '',
    pec: '',
    codiceSDI: ''
  });
  const [savedData, setSavedData] = useState<typeof formData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();

        if (res.ok && data.user) {
          const {
            companyName = '',
            billingAddress = '',
            civicNumber = '',
            cap = '',
            city = '',
            codiceFiscale = '',
            partitaIva = '',
            billingEmail = '',
            pec = '',
            codiceSDI = ''
          } = data.user;

          const loadedData = {
            companyName,
            address: billingAddress,
            civicNumber,
            cap,
            city,
            codiceFiscale,
            partitaIva,
            email: billingEmail,
            pec,
            codiceSDI
          };

          setFormData(loadedData);
          setSavedData(loadedData);
        }
      } catch (err) {
        console.error("Errore caricamento dati utente", err);
      }
    }

    fetchUserData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/user/update-billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Dati di fatturazione aggiornati con successo!');
        setSavedData(formData);
      } else {
        const data = await res.json();
        setError(data.error || 'Errore durante il salvataggio');
        toast.error(data.error || 'Errore durante il salvataggio');
      }
    } catch {
      setError('Errore di rete.');
      toast.error('Errore di rete.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-semibold text-[#C73A3A]">Indirizzo di fatturazione</h2>

      <input
        type="text"
        placeholder="Nome società"
        value={formData.companyName}
        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
        className="w-full p-3 border rounded"
        required
      />

      <input
        type="text"
        placeholder="Indirizzo"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        className="w-full p-3 border rounded"
        required
      />

      <input
        type="text"
        placeholder="Numero civico"
        value={formData.civicNumber}
        onChange={(e) => setFormData({ ...formData, civicNumber: e.target.value })}
        className="w-full p-3 border rounded"
      />

      <input
        type="text"
        placeholder="CAP"
        value={formData.cap}
        onChange={(e) => setFormData({ ...formData, cap: e.target.value })}
        className="w-full p-3 border rounded"
      />

      <input
        type="text"
        placeholder="Città"
        value={formData.city}
        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        className="w-full p-3 border rounded"
      />

      <input
        type="text"
        placeholder="Codice Fiscale"
        value={formData.codiceFiscale}
        onChange={(e) => setFormData({ ...formData, codiceFiscale: e.target.value })}
        className="w-full p-3 border rounded"
        required
      />

      <input
        type="text"
        placeholder="Partita IVA"
        value={formData.partitaIva}
        onChange={(e) => setFormData({ ...formData, partitaIva: e.target.value })}
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
        type="email"
        placeholder="PEC"
        value={formData.pec}
        onChange={(e) => setFormData({ ...formData, pec: e.target.value })}
        className="w-full p-3 border rounded"
      />

      <input
        type="text"
        placeholder="Codice SDI"
        value={formData.codiceSDI}
        onChange={(e) => setFormData({ ...formData, codiceSDI: e.target.value })}
        className="w-full p-3 border rounded"
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        className="bg-[#C73A3A] text-white py-2 px-4 rounded-lg hover:bg-[#a72f2f] transition"
      >
        Salva
      </button>

      {savedData && (
        <div className="mt-8 p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <h3 className="text-lg font-semibold text-[#C73A3A] mb-4">Dati attuali di fatturazione</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Nome società:</strong> {savedData.companyName}</p>
            <p><strong>Indirizzo:</strong> {savedData.address}</p>
            <p><strong>Numero civico:</strong> {savedData.civicNumber}</p>
            <p><strong>CAP:</strong> {savedData.cap}</p>
            <p><strong>Città:</strong> {savedData.city}</p>
            <p><strong>Codice Fiscale:</strong> {savedData.codiceFiscale}</p>
            <p><strong>Partita IVA:</strong> {savedData.partitaIva}</p>
            <p><strong>Email:</strong> {savedData.email}</p>
            <p><strong>PEC:</strong> {savedData.pec || '—'}</p>
            <p><strong>Codice SDI:</strong> {savedData.codiceSDI || '—'}</p>
          </div>
        </div>
      )}
    </form>
  );
}

