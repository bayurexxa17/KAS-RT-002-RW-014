import React, { useState, useEffect, useMemo } from 'react';
import api from './api';
import {
    Plus,
    ArrowDownCircle,
    ArrowUpCircle,
    Filter,
    Search,
    MoreVertical,
    Calendar,
    X,
    PlusCircle,
    FileText,
    Info,
    Edit3,
    Trash2,
    FileSpreadsheet,
    Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


const FinancePage = ({ title, type }) => {
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' or 1-12
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        kategori: '',
        jumlah: 0,
        keterangan: '',
        tipe: type === 'in' ? 'Pemasukan' : 'Pengeluaran'
    });
    const [editingId, setEditingId] = useState(null);


    useEffect(() => {
        fetchTransactions();
    }, [type]);

    const fetchTransactions = async () => {
        try {
            const resp = await api.get(`/api/transaksi?tipe=${type === 'in' ? 'Pemasukan' : 'Pengeluaran'}`);
            setItems(resp.data);
        } catch (err) {
            console.error('Error fetching transactions:', err);
        }
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        const periodStr = `${selectedMonth === 'all' ? 'Semua Bulan' : `Bulan ${selectedMonth}`} Tahun ${selectedYear}`;

        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(`${title}`, 14, 22);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Kategori: ${type === 'in' ? 'Pemasukan' : 'Pengeluaran'}`, 14, 28);
        doc.text(`Periode: ${periodStr}`, 14, 33);
        doc.text(`Dicetak pada: ${dateStr}`, 14, 38);

        doc.setDrawColor(230);
        doc.line(14, 42, 196, 42);

        // Transactions Table
        const tableData = filteredItems.map(item => [
            new Date(item.tanggal).toLocaleDateString('id-ID'),
            item.kategori,
            `Rp ${item.jumlah.toLocaleString('id-ID')}`,
            item.keterangan || '-'
        ]);

        autoTable(doc, {
            startY: 48,
            head: [['Tanggal', 'Kategori', 'Jumlah', 'Keterangan']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: type === 'in' ? [34, 197, 94] : [239, 68, 68] },
        });

        const total = filteredItems.reduce((acc, curr) => acc + curr.jumlah, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text(`Total: Rp ${total.toLocaleString('id-ID')}`, 14, doc.lastAutoTable.finalY + 15);

        doc.save(`${title.replace(/ /g, '_')}_${periodStr.replace(/ /g, '_')}.pdf`);
    };

    const handleExportCSV = () => {
        if (filteredItems.length === 0) return alert('Tidak ada data untuk periode ini');

        const headers = ['Tanggal', 'Kategori', 'Jumlah', 'Keterangan'];
        const rows = filteredItems.map(item => [
            new Date(item.tanggal).toLocaleDateString('id-ID'),
            item.kategori,
            item.jumlah,
            item.keterangan || '-'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const periodStr = `${selectedMonth === 'all' ? 'Semua_Bulan' : `Bulan_${selectedMonth}`}_${selectedYear}`;
        link.setAttribute('href', url);
        link.setAttribute('download', `${title.replace(/ /g, '_')}_${periodStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/api/transaksi/${editingId}`, formData);
            } else {
                await api.post('/api/transaksi', formData);
            }
            setIsModalOpen(false);
            resetForm();
            fetchTransactions();
        } catch (err) {
            console.error('Error saving transaction:', err);
        }
    };

    const resetForm = () => {
        setFormData({ kategori: '', jumlah: 0, keterangan: '', tipe: type === 'in' ? 'Pemasukan' : 'Pengeluaran' });
        setEditingId(null);
    };

    const handleEdit = (item) => {
        setFormData({
            kategori: item.kategori,
            jumlah: item.jumlah,
            keterangan: item.keterangan || '',
            tipe: item.tipe
        });
        setEditingId(item.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            try {
                await api.delete(`/api/transaksi/${id}`);
                fetchTransactions();
            } catch (err) {
                console.error('Error deleting transaction:', err);
            }
        }
    };


    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const date = new Date(item.tanggal);
            const yearMatch = date.getFullYear() === parseInt(selectedYear);
            const monthMatch = selectedMonth === 'all' || (date.getMonth() + 1) === parseInt(selectedMonth);
            const searchMatch = item.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.keterangan?.toLowerCase().includes(searchTerm.toLowerCase());

            return yearMatch && monthMatch && searchMatch;
        }).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    }, [items, searchTerm, selectedYear, selectedMonth]);

    const months = [
        { val: 'all', label: 'Semua Bulan' },
        { val: '1', label: 'Januari' }, { val: '2', label: 'Februari' }, { val: '3', label: 'Maret' },
        { val: '4', label: 'April' }, { val: '5', label: 'Mei' }, { val: '6', label: 'Juni' },
        { val: '7', label: 'Juli' }, { val: '8', label: 'Agustus' }, { val: '9', label: 'September' },
        { val: '10', label: 'Oktober' }, { val: '11', label: 'November' }, { val: '12', label: 'Desember' }
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-dark tracking-tight">{title}</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Arus kas {type === 'in' ? 'masuk' : 'keluar'} lingkungan RT</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Filter UI */}
                    <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-soft border border-slate-100 italic">
                        <select
                            className="bg-transparent text-xs font-black p-2 outline-none cursor-pointer"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                        </select>
                        <select
                            className="bg-transparent text-xs font-black p-2 outline-none cursor-pointer border-l border-slate-100"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    <div className="relative flex-1 sm:flex-none sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                            type="text"
                            placeholder="Cari transaksi..."
                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300 shadow-soft bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleExportCSV}
                        className="flex items-center justify-center gap-2 bg-white text-dark border-2 border-slate-100 px-5 py-3 rounded-2xl text-[10px] font-black shadow-soft hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <FileSpreadsheet size={16} /> EXPORT CSV
                    </button>

                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center justify-center gap-2 bg-dark text-white px-5 py-3 rounded-2xl text-[10px] font-black shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                    >
                        <Download size={16} /> DOWNLOAD PDF
                    </button>

                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className={`flex items-center justify-center gap-2 ${type === 'in' ? 'bg-success' : 'bg-danger'} text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg ${type === 'in' ? 'shadow-success/30' : 'shadow-danger/30'} hover:shadow-xl transition-all active:scale-95`}
                    >

                        <PlusCircle size={20} /> Tambah {type === 'in' ? 'Masuk' : 'Keluar'}
                    </button>
                </div>
            </div>

            <div className="card !p-0 overflow-hidden shadow-soft-xl border border-slate-100 bg-white rounded-[2.5rem]">
                {/* Mobile View */}
                <div className="block lg:hidden divide-y divide-slate-50">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl ${type === 'in' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'} flex items-center justify-center shadow-inner`}>
                                    {type === 'in' ? <ArrowDownCircle size={24} /> : <ArrowUpCircle size={24} />}
                                </div>
                                <div>
                                    <h5 className="text-sm font-black text-dark leading-tight">{item.kategori}</h5>
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-black ${type === 'in' ? 'text-success' : 'text-danger'}`}>
                                    {type === 'in' ? '+' : '-'} Rp {item.jumlah.toLocaleString('id-ID')}
                                </p>
                                <p className="text-[9px] font-bold text-slate-300 italic">{item.keterangan || '-'}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori / Keterangan</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Jumlah</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 shadow-soft-inner transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs font-black text-dark">
                                            <Calendar size={14} className="text-slate-300" />
                                            {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-dark tracking-tight">{item.kategori}</p>
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{item.keterangan || 'Tidak ada keterangan tambahan'}</p>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-black text-sm ${type === 'in' ? 'text-success' : 'text-danger'}`}>
                                        {type === 'in' ? '+' : '-'} Rp {item.jumlah.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <div className="flex justify-center gap-1">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 text-slate-300 hover:text-warning hover:bg-warning/10 rounded-xl transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-slate-300 hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-200">
                                                <FileText size={32} />
                                            </div>
                                            <p className="text-slate-300 font-black uppercase tracking-widest text-xs italic">Belum ada transaksi {type === 'in' ? 'pemasukan' : 'pengeluaran'}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transition Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] shadow-soft-xl w-full max-w-md overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
                        <div className={`p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between`}>
                            <div>
                                <h3 className="text-xl font-black text-dark">{editingId ? 'Edit' : 'Tambah'} {type === 'in' ? 'Pemasukan' : 'Pengeluaran'}</h3>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Input data finansial RT</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">

                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori / Jenis</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Iuran Keamanan, Alat Kebersihan..."
                                    className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300"
                                    value={formData.kategori}
                                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nominal (Rp)</label>
                                <input
                                    type="number"
                                    required
                                    placeholder="0"
                                    className={`w-full px-5 py-4 border-2 border-slate-100 rounded-2xl text-2xl font-black ${type === 'in' ? 'text-success' : 'text-xl text-danger'} focus:border-primary outline-none transition-all`}
                                    value={formData.jumlah}
                                    onChange={(e) => setFormData({ ...formData, jumlah: parseFloat(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keterangan Tambahan</label>
                                <textarea
                                    className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-primary outline-none transition-all h-24 resize-none placeholder:text-slate-300"
                                    placeholder="Catatan kecil untuk transaksi ini..."
                                    value={formData.keterangan}
                                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className={`w-full ${type === 'in' ? 'bg-success' : 'bg-danger'} text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all active:scale-95`}
                            >
                                SUBMIT TRANSAKSI
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancePage;
