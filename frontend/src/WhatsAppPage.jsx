import React, { useState, useEffect } from 'react';
import api from './api';
import { Send, Search, User, MessageSquare, Phone } from 'lucide-react';

const WhatsAppPage = () => {
    const [wargaList, setWargaList] = useState([]);
    const [selectedWargaId, setSelectedWargaId] = useState('');
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchWarga = async () => {
            try {
                const res = await api.get('/api/warga');
                // Filter only residents with phone numbers
                const validWarga = res.data.filter(w => w.whatsapp && w.whatsapp.trim() !== '');
                setWargaList(validWarga);
            } catch (err) {
                console.error('Error fetching warga:', err);
            }
        };
        fetchWarga();
    }, []);

    const handleSend = () => {
        if (!selectedWargaId || !message) return;

        const warga = wargaList.find(w => w.id === parseInt(selectedWargaId));
        if (!warga) return;

        // Auto-replace placeholder [Nama]
        const finalMessage = message.replace(/\[Nama\]/g, warga.nama);

        const url = `https://wa.me/${warga.whatsapp}?text=${encodeURIComponent(finalMessage)}`;
        window.open(url, '_blank');
    };

    const filteredWarga = wargaList.filter(w =>
        w.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.no_rumah.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedWarga = wargaList.find(w => w.id === parseInt(selectedWargaId));

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h2 className="text-2xl font-black text-dark tracking-tight">Kirim WhatsApp</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Broadcast pesan ke warga</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Selection Column */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="card bg-white p-6 rounded-[2rem] shadow-soft border border-slate-100 h-full">
                        <h3 className="text-sm font-black text-dark mb-4 flex items-center gap-2">
                            <User size={18} /> Pilih Penerima
                        </h3>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input
                                type="text"
                                placeholder="Cari warga..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:border-primary outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredWarga.map(w => (
                                <button
                                    key={w.id}
                                    onClick={() => setSelectedWargaId(w.id)}
                                    className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${selectedWargaId === w.id
                                        ? 'bg-success text-white shadow-lg shadow-success/20'
                                        : 'bg-white border border-slate-50 hover:bg-slate-50 text-slate-500'
                                        }`}
                                >
                                    <div className="text-left">
                                        <p className={`text-xs font-bold ${selectedWargaId === w.id ? 'text-white' : 'text-dark'}`}>{w.nama}</p>
                                        <p className={`text-[10px] ${selectedWargaId === w.id ? 'text-white/80' : 'text-slate-400'}`}>Blok {w.no_rumah}</p>
                                    </div>
                                    <Phone size={14} className={selectedWargaId === w.id ? 'text-white' : 'text-slate-300'} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Message Input Column */}
                <div className="lg:col-span-2">
                    <div className="card bg-white p-6 rounded-[2rem] shadow-soft border border-slate-100 h-full flex flex-col">
                        <h3 className="text-sm font-black text-dark mb-4 flex items-center gap-2">
                            <MessageSquare size={18} /> Tulis Pesan
                        </h3>

                        <div className="flex-1 flex flex-col gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Penerima</label>
                                <div className="text-sm font-black text-dark">
                                    {selectedWarga ? `${selectedWarga.nama} (${selectedWarga.whatsapp})` : <span className="text-slate-400 italic">Belum dipilih...</span>}
                                </div>
                            </div>

                            <div className="flex-1 relative">
                                <textarea
                                    className="w-full h-full min-h-[200px] p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium text-dark focus:border-success outline-none transition-all resize-none"
                                    placeholder="Tulis pesan Anda di sini... Gunakan [Nama] untuk menyebut nama warga secara otomatis."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-400 bg-white/80 px-2 py-1 rounded-lg backdrop-blur-sm">
                                    {message.length} karakter
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <p className="text-[10px] text-slate-400">
                                    <span className="font-bold text-dark">Tip:</span> Anda akan diarahkan ke WhatsApp Web/App.
                                </p>
                                <button
                                    onClick={handleSend}
                                    disabled={!selectedWargaId || !message}
                                    className="px-6 py-3 bg-success text-white rounded-xl font-black text-xs shadow-lg shadow-success/20 hover:shadow-success/40 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                                >
                                    <Send size={16} /> KIRIM PESAN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppPage;
