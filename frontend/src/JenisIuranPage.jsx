import React, { useState, useEffect } from 'react';
import api from './api';
import {
    Plus,
    Edit2,
    Trash2,
    X,
    CreditCard,
    DollarSign,
    Info,
    ChevronRight,
    Search
} from 'lucide-react';

const JenisIuranPage = () => {
    const [iurans, setIurans] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        nama: '',
        nominal: 0,
        deskripsi: ''
    });

    useEffect(() => {
        fetchIurans();
    }, []);

    const fetchIurans = async () => {
        try {
            const resp = await api.get('/api/jenis-iuran');
            setIurans(resp.data);
        } catch (err) {
            console.error('Error fetching iurans:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/api/jenis-iuran/${editingId}`, formData);
            } else {
                await api.post('/api/jenis-iuran', formData);
            }
            setIsModalOpen(false);
            resetForm();
            fetchIurans();
        } catch (err) {
            console.error('Error saving iuran:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus jenis iuran ini?')) {
            try {
                await api.delete(`/api/jenis-iuran/${id}`);
                fetchIurans();
            } catch (err) {
                console.error('Error deleting iuran:', err);
            }
        }
    };

    const handleEdit = (iuran) => {
        setEditingId(iuran.id);
        setFormData({
            nama: iuran.nama,
            nominal: iuran.nominal,
            deskripsi: iuran.deskripsi || ''
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ nama: '', nominal: 0, deskripsi: '' });
        setEditingId(null);
    };

    const filteredIurans = iurans.filter(i =>
        i.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-dark tracking-tight">Kategori Iuran Kas</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest underline decoration-primary decoration-4 underline-offset-8">Konfigurasi jenis penarikan dana warga</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                            type="text"
                            placeholder="Cari jenis iuran..."
                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300 shadow-soft bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-2xl font-black hover:bg-dark shadow-xl shadow-primary/30 hover:shadow-dark/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Plus size={20} />
                        TAMBAH KATEGORI
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredIurans.map((iuran) => (
                    <div key={iuran.id} className="bg-white p-8 rounded-[3rem] shadow-soft-xl border border-slate-50 group hover:border-primary/20 transition-all duration-300 relative overflow-hidden flex flex-col h-full">
                        <div className="absolute top-6 right-8 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex gap-2">
                            <button
                                onClick={() => handleEdit(iuran)}
                                className="p-2.5 bg-white shadow-soft rounded-xl text-primary hover:bg-primary hover:text-white transition-all border border-slate-50"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(iuran.id)}
                                className="p-2.5 bg-white shadow-soft rounded-xl text-danger hover:bg-danger hover:text-white transition-all border border-slate-50"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="flex items-start gap-5">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-primary/5 flex items-center justify-center text-primary shrink-0 shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                <CreditCard size={32} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-black text-dark text-xl leading-tight group-hover:text-primary transition-colors">{iuran.nama}</h3>
                                <p className="text-2xl font-black text-dark">
                                    <span className="text-xs font-black text-slate-300 mr-1 italic">Rp</span>
                                    {iuran.nominal.toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex-1">
                            <p className="text-xs text-slate-400 font-medium leading-relaxed italic border-l-4 border-slate-100 pl-4 py-1">
                                {iuran.deskripsi || 'Tidak ada deskripsi rincian untuk iuran ini.'}
                            </p>
                        </div>

                        <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-success uppercase tracking-widest bg-success/5 px-4 py-2 rounded-2xl">
                                <DollarSign size={10} /> STATUS: AKTIF
                            </div>
                            <div className="text-slate-200 group-hover:text-primary transition-colors transform group-hover:translate-x-1 duration-300">
                                <ChevronRight size={24} />
                            </div>
                        </div>
                    </div>
                ))}

                {filteredIurans.length === 0 && (
                    <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center gap-4">
                        <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-soft flex items-center justify-center text-slate-200 animate-bounce">
                            <Info size={40} />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-400 font-black tracking-widest uppercase text-sm">Jenis Iuran Kosong</p>
                            <p className="text-slate-300 text-xs font-bold mt-1">Gunakan tombol "Tambah Kategori" untuk memulai.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[3rem] shadow-soft-xl w-full max-w-md overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between px-10 py-8 bg-slate-50/50 border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-black text-dark">{editingId ? 'Edit Kategori' : 'Kategori Baru'}</h3>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Setelan Parameter Iuran</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white shadow-soft rounded-2xl text-slate-400 hover:text-dark transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-10 py-8 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Label Iuran</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Dana Kebersihan Bulanan..."
                                    className="w-full px-6 py-4 border-2 border-slate-100 rounded-[1.5rem] text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-slate-200"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nominal Fix (Rp)</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black italic">Rp</div>
                                    <input
                                        type="number"
                                        required
                                        placeholder="0"
                                        className="w-full pl-14 pr-6 py-4 border-2 border-slate-100 rounded-[1.5rem] text-2xl font-black text-dark focus:border-primary outline-none transition-all"
                                        value={formData.nominal}
                                        onChange={(e) => setFormData({ ...formData, nominal: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keterangan / Rincian</label>
                                <textarea
                                    className="w-full px-6 py-4 border-2 border-slate-100 rounded-[1.5rem] text-sm font-bold focus:border-primary outline-none transition-all h-28 resize-none placeholder:text-slate-200"
                                    placeholder="Apa saja yang termasuk dalam iuran ini?"
                                    value={formData.deskripsi}
                                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-primary/30 hover:shadow-dark/40 hover:bg-dark transition-all active:scale-95"
                            >
                                {editingId ? 'SIMPAN PERUBAHAN' : 'WES! BUAT IURAN'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JenisIuranPage;
