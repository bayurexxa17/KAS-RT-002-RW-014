import React, { useState, useEffect, useMemo } from 'react';
import api from './api';
import {
    Search,
    UserPlus,
    Edit2,
    Trash2,
    X,
    Users,
    Home,
    UserCheck,
    AlertCircle,
    Eye,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    Filter,
    MoreHorizontal,
    FileDown
} from 'lucide-react';

const WargaPage = () => {
    const [warga, setWarga] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedWarga, setSelectedWarga] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'nama', direction: 'asc' });

    const [formData, setFormData] = useState({
        nama: '', nik: '', whatsapp: '', alamat: '', no_rumah: '', status: 'Tetap', catatan: ''
    });

    useEffect(() => {
        fetchWarga();
    }, []);

    const fetchWarga = async () => {
        try {
            const resp = await api.get('/api/warga');
            setWarga(resp.data);
        } catch (err) {
            console.error('Error fetching data warga:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/api/warga/${editingId}`, formData);
            } else {
                await api.post('/api/warga', formData);
            }
            setIsModalOpen(false);
            setEditingId(null);
            fetchWarga();
            resetForm();
        } catch (err) {
            console.error('Error submitting data warga:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data warga ini?')) {
            try {
                await api.delete(`/api/warga/${id}`);
                fetchWarga();
            } catch (err) {
                console.error('Error deleting data warga:', err);
            }
        }
    };

    const handleEdit = (w) => {
        setEditingId(w.id);
        setFormData({
            nama: w.nama,
            nik: w.nik,
            whatsapp: w.whatsapp,
            alamat: w.alamat,
            no_rumah: w.no_rumah,
            status: w.status,
            catatan: w.catatan || ''
        });
        setIsModalOpen(true);
    };

    const handleView = (w) => {
        setSelectedWarga(w);
        setIsViewModalOpen(true);
    };

    const handleExportCSV = () => {
        if (warga.length === 0) return;

        const headers = ['Nama', 'NIK', 'WhatsApp', 'Alamat', 'No Rumah', 'Status', 'Catatan'];
        const rows = warga.map(w => [
            w.nama,
            `'${w.nik}`, // Prefix with ' to prevent Excel from scientific notation
            w.whatsapp,
            w.alamat,
            w.no_rumah,
            w.status,
            w.catatan || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Data_Warga_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const resetForm = () => {
        setFormData({ nama: '', nik: '', whatsapp: '', alamat: '', no_rumah: '', status: 'Tetap', catatan: '' });
        setEditingId(null);
    };

    // NIK Masking helper
    const maskNIK = (nik) => {
        if (!nik || nik.length < 10) return nik;
        return `${nik.substring(0, 6)}*********${nik.substring(nik.length - 1)}`;
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={12} className="ml-1 opacity-30" />;
        return sortConfig.direction === 'asc' ?
            <ChevronUp size={12} className="ml-1 text-primary" /> :
            <ChevronDown size={12} className="ml-1 text-primary" />;
    };

    const stats = useMemo(() => ({
        total: warga.length,
        tetap: warga.filter(w => w.status === 'Tetap').length,
        kontrak: warga.filter(w => w.status === 'Kontrak').length,
        kost: warga.filter(w => w.status === 'Kost').length,
        pindah: warga.filter(w => w.status === 'Pindah').length,
    }), [warga]);

    const filteredWarga = useMemo(() => {
        let result = warga.filter(w =>
            w.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.nik.includes(searchTerm) ||
            w.no_rumah.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.alamat.toLowerCase().includes(searchTerm.toLowerCase())
        );

        result.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [warga, searchTerm, sortConfig]);

    return (
        <div className="space-y-6 pb-12">
            {/* Stats Section - Mobile Grid Improvements */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="card-mini border-l-4 border-primary shadow-soft flex flex-col md:flex-row items-center md:items-start gap-3 p-4 bg-white rounded-2xl">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Users size={20} className="md:size-24" />
                    </div>
                    <div className="text-center md:text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total</p>
                        <h3 className="text-lg md:text-xl font-black text-dark">{stats.total} <span className="text-[10px] font-bold text-slate-300">WA</span></h3>
                    </div>
                </div>
                <div className="card-mini border-l-4 border-success shadow-soft flex flex-col md:flex-row items-center md:items-start gap-3 p-4 bg-white rounded-2xl">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-success/10 flex items-center justify-center text-success shrink-0">
                        <UserCheck size={20} className="md:size-24" />
                    </div>
                    <div className="text-center md:text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Tetap</p>
                        <h3 className="text-lg md:text-xl font-black text-dark">{stats.tetap}</h3>
                    </div>
                </div>
                <div className="card-mini border-l-4 border-info shadow-soft flex flex-col md:flex-row items-center md:items-start gap-3 p-4 bg-white rounded-2xl">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-info/10 flex items-center justify-center text-info shrink-0">
                        <Home size={20} className="md:size-24" />
                    </div>
                    <div className="text-center md:text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Kost</p>
                        <h3 className="text-lg md:text-xl font-black text-dark">{stats.kost}</h3>
                    </div>
                </div>
                <div className="card-mini border-l-4 border-warning shadow-soft flex flex-col md:flex-row items-center md:items-start gap-3 p-4 bg-white rounded-2xl">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning shrink-0">
                        <AlertCircle size={20} className="md:size-24" />
                    </div>
                    <div className="text-center md:text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Kontrak</p>
                        <h3 className="text-lg md:text-xl font-black text-dark">{stats.kontrak}</h3>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-10">
                <div>
                    <h2 className="text-2xl font-black text-dark tracking-tight">Manajemen Data Warga</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kelola data administrasi rukun tetangga</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-dark border-2 border-slate-100 px-6 py-3 rounded-2xl text-xs font-black shadow-soft hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <FileDown size={18} />
                        EXPORT CSV
                    </button>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                            type="text"
                            placeholder="Cari warga (nama/nik/alamat)..."
                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300 shadow-soft"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-primary/30 hover:shadow-xl transition-all active:scale-95"
                    >
                        <UserPlus size={18} />
                        Mendaftarkan Warga
                    </button>
                </div>
            </div>

            {/* Responsive Table/Cards Container */}
            <div className="card overflow-hidden !p-0 shadow-soft-xl border border-slate-100 bg-white rounded-3xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th
                                    className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => requestSort('nama')}
                                >
                                    <div className="flex items-center">Nama / NIK {getSortIcon('nama')}</div>
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</th>
                                <th
                                    className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => requestSort('alamat')}
                                >
                                    <div className="flex items-center">Alamat {getSortIcon('alamat')}</div>
                                </th>
                                <th
                                    className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => requestSort('no_rumah')}
                                >
                                    <div className="flex items-center">Rumah {getSortIcon('no_rumah')}</div>
                                </th>
                                <th
                                    className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => requestSort('status')}
                                >
                                    <div className="flex items-center">Status {getSortIcon('status')}</div>
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-dark">
                            {filteredWarga.map((w) => (
                                <tr key={w.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="font-black text-dark text-sm">{w.nama}</p>
                                        <p className="text-[10px] font-bold text-slate-300 tracking-tight">{maskNIK(w.nik)}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a href={`https://wa.me/${w.whatsapp}`} target="_blank" rel="noreferrer" className="text-xs font-black text-success hover:underline">
                                            +{w.whatsapp}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{w.alamat}</td>
                                    <td className="px-6 py-4 text-xs font-black text-dark">{w.no_rumah}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${w.status === 'Tetap' ? 'bg-success/10 text-success' :
                                            w.status === 'Kontrak' ? 'bg-primary/10 text-primary' :
                                                w.status === 'Kost' ? 'bg-info/10 text-info' : 'bg-danger/10 text-danger'
                                            }`}>
                                            {w.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleView(w)}
                                                className="p-2 text-slate-300 hover:bg-slate-100 hover:text-dark rounded-xl transition-all shadow-soft border border-transparent hover:border-slate-100"
                                                title="Lihat Detail"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(w)}
                                                className="p-2 text-slate-300 hover:bg-primary/10 hover:text-primary rounded-xl transition-all shadow-soft border border-transparent hover:border-slate-100"
                                                title="Edit Data"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(w.id)}
                                                className="p-2 text-slate-300 hover:bg-danger/10 hover:text-danger rounded-xl transition-all shadow-soft border border-transparent hover:border-slate-100"
                                                title="Hapus Data"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredWarga.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
                                                <Users size={32} />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Data Warga Tidak Ditemukan</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form (Create/Edit) - Responsiveness Improved */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] shadow-soft-xl w-full max-w-xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-8 border-b border-slate-50 bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-dark leading-tight">{editingId ? 'Edit Identitas Warga' : 'Pendaftaran Warga Baru'}</h3>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Formulir Administrasi RT</p>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-3 bg-white shadow-soft rounded-2xl hover:bg-slate-50 transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-5 py-4 border-2 border-slate-50 bg-slate-50/50 rounded-2xl text-sm font-bold focus:border-primary focus:bg-white outline-none transition-all placeholder:text-slate-300"
                                        placeholder="Masukkan nama..."
                                        value={formData.nama}
                                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIK (16 Digit)</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={16}
                                        className="w-full px-5 py-4 border-2 border-slate-50 bg-slate-50/50 rounded-2xl text-sm font-bold focus:border-primary focus:bg-white outline-none transition-all placeholder:text-slate-300"
                                        placeholder="Nomor Induk Kependudukan..."
                                        value={formData.nik}
                                        onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">No. WhatsApp</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: 62812345678"
                                        className="w-full px-5 py-4 border-2 border-slate-50 bg-slate-50/50 rounded-2xl text-sm font-bold focus:border-primary focus:bg-white outline-none transition-all placeholder:text-slate-300"
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Domisili</label>
                                    <select
                                        className="w-full px-5 py-4 border-2 border-slate-50 bg-slate-50/50 rounded-2xl text-sm font-bold bg-white focus:border-primary outline-none transition-all"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Tetap">Tetap (Pemilik)</option>
                                        <option value="Kontrak">Kontrak (Sewa)</option>
                                        <option value="Kost">Kost</option>
                                        <option value="Pindah">Pindah / Keluar</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Domisili</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Nama jalan atau komplek..."
                                        className="w-full px-5 py-4 border-2 border-slate-50 bg-slate-50/50 rounded-2xl text-sm font-bold focus:border-primary focus:bg-white outline-none transition-all placeholder:text-slate-300"
                                        value={formData.alamat}
                                        onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">No. Rumah</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="A/12"
                                        className="w-full px-5 py-4 border-2 border-slate-50 bg-slate-50/50 rounded-2xl text-sm font-bold focus:border-primary focus:bg-white outline-none transition-all placeholder:text-slate-300"
                                        value={formData.no_rumah}
                                        onChange={(e) => setFormData({ ...formData, no_rumah: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan</label>
                                <textarea
                                    className="w-full px-5 py-4 border-2 border-slate-50 bg-slate-50/50 rounded-2xl text-sm font-bold focus:border-primary focus:bg-white outline-none transition-all h-24 resize-none placeholder:text-slate-300"
                                    placeholder="Keterangan tambahan jika diperlukan..."
                                    value={formData.catatan}
                                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 mt-4"
                            >
                                {editingId ? 'SIMPAN PERUBAHAN' : 'KONFIRMASI PENDAFTARAN'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Detail Modal - Show FULL NIK here */}
            {isViewModalOpen && selectedWarga && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[3rem] shadow-soft-xl w-full max-w-sm overflow-hidden animate-in scale-in duration-300">
                        <div className="h-28 bg-primary relative">
                            <div className="absolute -bottom-8 left-10 p-2 bg-white rounded-3xl shadow-soft">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Users size={32} />
                                </div>
                            </div>
                            <button onClick={() => setIsViewModalOpen(false)} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-2xl text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="pt-14 p-10 space-y-8">
                            <div>
                                <h3 className="text-2xl font-black text-dark leading-tight">{selectedWarga.nama}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Warga</span>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <span className="text-[10px] font-black text-primary tracking-widest px-2 py-0.5 bg-primary/5 rounded-md uppercase">{selectedWarga.status}</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-50">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5 ml-1">Nomor Induk Kependudukan (Full)</p>
                                    <p className="text-lg font-black text-dark tracking-wide">{selectedWarga.nik}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50 text-center">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">WhatsApp</p>
                                        <p className="text-xs font-black text-success">+{selectedWarga.whatsapp}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50 text-center">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Rumah</p>
                                        <p className="text-xs font-black text-dark">{selectedWarga.no_rumah}</p>
                                    </div>
                                </div>

                                <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-50">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5 ml-1">Alamat Tinggal</p>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed">{selectedWarga.alamat}</p>
                                </div>

                                {selectedWarga.catatan && (
                                    <div className="p-5 bg-danger/5 rounded-3xl border border-danger/5 italic">
                                        <p className="text-[10px] font-black text-danger/40 uppercase tracking-widest mb-1 ml-1 flex items-center gap-1">
                                            <Info size={10} /> Catatan Khusus
                                        </p>
                                        <p className="text-[11px] font-bold text-danger/60">"{selectedWarga.catatan}"</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="w-full py-4 bg-slate-50 hover:bg-slate-100 rounded-[2rem] font-black text-slate-400 transition-all border border-slate-100"
                            >
                                TUTUP DETAIL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WargaPage;
