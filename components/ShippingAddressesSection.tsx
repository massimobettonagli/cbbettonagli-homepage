'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { PlusCircle, Copy, Pencil, Trash2 } from 'lucide-react';

export default function ShippingAddressesSection() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    id: '',
    label: '',
    address: '',
    civicNumber: '',
    cap: '',
    city: '',
    companyName: '',
    codiceFiscale: '',
    partitaIva: '',
    email: '',
    pec: '',
    codiceSDI: ''
  });

  useEffect(() => {
    fetch('/api/user/shipping')
      .then(res => res.json())
      .then(data => setAddresses(data.addresses || []));
  }, []);

  async function handleSave() {
  const isEditing = !!form.id;

  const res = await fetch('/api/user/shipping', {
    method: isEditing ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });

  if (res.ok) {
    const data = await res.json();

    if (isEditing) {
      setAddresses(prev =>
        prev.map(addr => addr.id === form.id ? data.address : addr)
      );
    } else {
      setAddresses(prev => [...prev, data.address]);
    }

    setOpen(false);
    setForm({
      id: '',
      label: '', address: '', civicNumber: '', cap: '', city: '',
      companyName: '', codiceFiscale: '', partitaIva: '',
      email: '', pec: '', codiceSDI: ''
    });
  } else {
    alert('Errore durante il salvataggio');
  }
}

  async function handleDelete(id: string) {
    if (!confirm('Vuoi eliminare questo indirizzo?')) return;

    const res = await fetch(`/api/user/shipping?id=${id}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      setAddresses(prev => prev.filter(a => a.id !== id));
    }
  }

  async function copiaDaFatturazione() {
    const res = await fetch('/api/user/get-billing');
    if (!res.ok) {
      alert('Errore nel recupero dei dati di fatturazione');
      return;
    }
    const fatt = await res.json();
    const payload = {
      label: 'Copia da fatturazione',
      address: fatt.billingAddress || '',
      civicNumber: fatt.civicNumber || '',
      cap: fatt.cap || '',
      city: fatt.city || '',
      companyName: fatt.companyName || '',
      codiceFiscale: fatt.codiceFiscale || '',
      partitaIva: fatt.partitaIva || '',
      email: fatt.billingEmail || '',
      pec: fatt.pec || '',
      codiceSDI: fatt.codiceSDI || ''
    };

    const salva = await fetch('/api/user/shipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (salva.ok) {
      const data = await salva.json();
      setAddresses(prev => [...prev, data.address]);
    } else {
      alert('Errore durante il salvataggio dell’indirizzo di spedizione');
    }
  }

  function resetForm() {
    setForm({
      id: '', label: '', address: '', civicNumber: '', cap: '', city: '',
      companyName: '', codiceFiscale: '', partitaIva: '',
      email: '', pec: '', codiceSDI: ''
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-12">
      <h2 className="text-xl font-semibold text-[#C73A3A]">Indirizzi di spedizione</h2>

      <div className="flex gap-4">
        <button
          onClick={() => { resetForm(); setOpen(true); }}
          className="flex items-center gap-2 bg-[#C73A3A] text-white px-4 py-2 rounded-lg hover:bg-[#a72f2f]"
        >
          <PlusCircle className="w-5 h-5" /> Aggiungi indirizzo di spedizione
        </button>

        <button
          onClick={copiaDaFatturazione}
          className="flex items-center gap-2 border border-[#C73A3A] text-[#C73A3A] px-4 py-2 rounded-lg hover:bg-[#f5e8e8]"
        >
          <Copy className="w-5 h-5" /> Usa indirizzo di fatturazione
        </button>
      </div>

      {addresses.length === 0 ? (
        <p className="text-sm text-gray-600 mt-4">Nessun indirizzo salvato.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((a, i) => (
            <div key={i} className="relative p-4 border rounded-lg shadow-sm bg-white">
              <div className="absolute top-2 right-2 flex gap-2">
                <button
  onClick={() => {
    setForm(a); // incluso a.id
    setOpen(true);
  }}
  className="text-gray-600 hover:text-[#C73A3A]"
  title="Modifica"
>
  <Pencil className="w-4 h-4" />
</button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-gray-600 hover:text-red-600"
                  title="Elimina"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-semibold text-[#C73A3A]">{a.label}</h3>
              <p className="text-sm text-gray-700">
                {a.address}, {a.civicNumber}, {a.cap} {a.city}<br />
                {a.companyName && <>Azienda: {a.companyName}<br /></>}
                {a.codiceFiscale && <>CF: {a.codiceFiscale}<br /></>}
                {a.partitaIva && <>P.IVA: {a.partitaIva}<br /></>}
                {a.email && <>Email: {a.email}<br /></>}
                {a.pec && <>PEC: {a.pec}<br /></>}
                {a.codiceSDI && <>SDI: {a.codiceSDI}</>}
              </p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-6 shadow-xl w-full max-w-lg">
            <Dialog.Title className="text-lg font-bold mb-4">
              {form.id ? 'Modifica indirizzo' : 'Nuovo indirizzo di spedizione'}
            </Dialog.Title>
            <div className="space-y-3">
              <input type="text" placeholder="Nome indirizzo" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className="w-full p-2 border rounded" />
              <input type="text" placeholder="Indirizzo" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full p-2 border rounded" />
              <input type="text" placeholder="Numero civico" value={form.civicNumber} onChange={e => setForm({ ...form, civicNumber: e.target.value })} className="w-full p-2 border rounded" />
              <input type="text" placeholder="CAP" value={form.cap} onChange={e => setForm({ ...form, cap: e.target.value })} className="w-full p-2 border rounded" />
              <input type="text" placeholder="Città" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full p-2 border rounded" />
              <input type="text" placeholder="Nome società" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} className="w-full p-2 border rounded" />
              <input type="text" placeholder="Codice Fiscale" value={form.codiceFiscale} onChange={e => setForm({ ...form, codiceFiscale: e.target.value })} className="w-full p-2 border rounded" />
              <input type="text" placeholder="Partita IVA" value={form.partitaIva} onChange={e => setForm({ ...form, partitaIva: e.target.value })} className="w-full p-2 border rounded" />
              <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full p-2 border rounded" />
              <input type="email" placeholder="PEC" value={form.pec} onChange={e => setForm({ ...form, pec: e.target.value })} className="w-full p-2 border rounded" />
              <input type="text" placeholder="Codice SDI" value={form.codiceSDI} onChange={e => setForm({ ...form, codiceSDI: e.target.value })} className="w-full p-2 border rounded" />
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={handleSave} className="bg-[#C73A3A] text-white px-4 py-2 rounded hover:bg-[#a72f2f]">
                Salva
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
