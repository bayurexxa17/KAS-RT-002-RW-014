import React, { useState, useEffect, useMemo } from 'react';
import api from './api';
import { BarChart3, PieChart, TrendingUp, TrendingDown, FileText, Download, Wallet, Info, FileSpreadsheet } from 'lucide-react';
import DashboardChart from './components/DashboardChart';
import ExpensePieChart from './components/ExpensePieChart';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const LaporanPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [tagihan, setTagihan] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' or 1-12
    const [appSettings, setAppSettings] = useState({ app_name: 'Kas RT', logo_url: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/api/settings');
            setAppSettings(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [transResp, tagihanResp] = await Promise.all([
                api.get('/api/transaksi'),
                api.get('/api/tagihan')
            ]);
            setTransactions(transResp.data);
            setTagihan(tagihanResp.data);
        } catch (err) {
            console.error('Error fetching report data:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = new Date(t.tanggal);
            const yearMatch = date.getFullYear() === parseInt(selectedYear);
            const monthMatch = selectedMonth === 'all' || (date.getMonth() + 1) === parseInt(selectedMonth);
            return yearMatch && monthMatch;
        });
    }, [transactions, selectedYear, selectedMonth]);

    const stats = useMemo(() => {
        const pemasukan = filteredTransactions
            .filter(t => t.tipe === 'Pemasukan')
            .reduce((acc, curr) => acc + curr.jumlah, 0);

        const pengeluaran = filteredTransactions
            .filter(t => t.tipe === 'Pengeluaran')
            .reduce((acc, curr) => acc + curr.jumlah, 0);

        // Piutang logic: filter tagihan by selected year/month if not 'all'
        const pendingTagihan = tagihan
            .filter(t => {
                if (t.status_lunas === 1) return false;
                // Basic filtering for piutang if needed, but usually piutang is current
                return true;
            })
            .length * 25000;

        return {
            pemasukan,
            pengeluaran,
            saldo: pemasukan - pengeluaran,
            pendingTagihan
        };
    }, [filteredTransactions, tagihan]);

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        const periodStr = `${selectedMonth === 'all' ? 'Semua Bulan' : `Bulan ${selectedMonth}`} Tahun ${selectedYear}`;

        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(appSettings.app_name || 'Laporan Kas RT', 14, 22);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text('Laporan Transparansi Keuangan Digital', 14, 28);
        doc.text(`Periode: ${periodStr}`, 14, 33);
        doc.text(`Dicetak pada: ${dateStr}`, 14, 38);

        doc.setDrawColor(230);
        doc.line(14, 42, 196, 42);

        // Summary
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text('Ringkasan Keuangan', 14, 52);

        autoTable(doc, {
            startY: 57,
            head: [['Kategori', 'Jumlah']],
            body: [
                ['Total Pemasukan', `Rp ${stats.pemasukan.toLocaleString('id-ID')}`],
                ['Total Pengeluaran', `Rp ${stats.pengeluaran.toLocaleString('id-ID')}`],
                ['Saldo Periode Ini', `Rp ${stats.saldo.toLocaleString('id-ID')}`],
            ],
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] },
        });

        // Details
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Detail Transaksi', 14, doc.lastAutoTable.finalY + 15);

        const tableData = filteredTransactions.map(t => [
            new Date(t.tanggal).toLocaleDateString('id-ID'),
            t.kategori,
            t.tipe,
            `Rp ${t.jumlah.toLocaleString('id-ID')}`,
            t.keterangan || '-'
        ]);

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Tanggal', 'Kategori', 'Tipe', 'Jumlah', 'Keterangan']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [51, 65, 85] },
        });

        doc.save(`Laporan_${periodStr.replace(/ /g, '_')}.pdf`);
    };

    const handleExportCSV = () => {
        if (filteredTransactions.length === 0) return alert('Tidak ada data untuk periode ini');

        const headers = ['Tanggal', 'Kategori', 'Tipe', 'Jumlah', 'Keterangan'];
        const rows = filteredTransactions.map(t => [
            new Date(t.tanggal).toLocaleDateString('id-ID'),
            t.kategori,
            t.tipe,
            t.jumlah,
            t.keterangan || '-'
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
        link.setAttribute('download', `Laporan_Kas_RT_${periodStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const summaries = [
        { label: 'Total Pemasukan', value: stats.pemasukan, icon: <TrendingUp className="text-success" />, color: 'border-success' },
        { label: 'Total Pengeluaran', value: stats.pengeluaran, icon: <TrendingDown className="text-danger" />, color: 'border-danger' },
        { label: 'Saldo Periode', value: stats.saldo, icon: <Wallet className="text-primary" />, color: 'border-primary' },
        { label: 'Estimasi Piutang', value: stats.pendingTagihan, icon: <Info className="text-warning" />, color: 'border-warning' },
    ];

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
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-dark tracking-tight">Laporan Keuangan RT</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider underline decoration-primary decoration-2 underline-offset-4">Rekapitulasi transparansi dana warga</p>
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

                    <button
                        onClick={handleExportCSV}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white text-dark border-2 border-slate-100 px-5 py-3 rounded-2xl text-[10px] font-black shadow-soft hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <FileSpreadsheet size={16} /> EXPORT CSV
                    </button>

                    <button
                        onClick={handleDownloadPDF}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-dark text-white px-5 py-3 rounded-2xl text-[10px] font-black shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                    >
                        <Download size={16} /> DOWNLOAD PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {summaries.map((s, idx) => (
                    <div key={idx} className={`bg-white p-5 rounded-[2rem] shadow-soft-xl border-l-[6px] ${s.color} hover:translate-y-[-4px] transition-all duration-300`}>
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-3 shadow-inner">
                            {s.icon}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{s.label}</p>
                        <p className="text-sm md:text-lg font-black text-dark leading-tight truncate">
                            Rp {s.value.toLocaleString('id-ID')}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                <div className="bg-white p-8 rounded-[3rem] shadow-soft-xl border border-slate-100 min-h-[400px] flex flex-col">
                    <h4 className="font-black text-dark mb-8 flex items-center gap-2 text-lg">
                        <BarChart3 size={20} className="text-primary" /> Aliran Kas Bulanan
                    </h4>
                    <div className="flex-1 bg-white rounded-[2rem] flex flex-col items-center justify-center p-4">
                        <DashboardChart data={filteredTransactions} year={selectedYear} />
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[3rem] shadow-soft-xl border border-slate-100 min-h-[400px] flex flex-col">
                    <h4 className="font-black text-dark mb-8 flex items-center gap-2 text-lg">
                        <PieChart size={20} className="text-warning" /> Alokasi Pengeluaran
                    </h4>
                    <div className="flex-1 bg-white rounded-[2rem] flex flex-col items-center justify-center p-4">
                        <ExpensePieChart data={filteredTransactions} year={selectedYear} />
                    </div>
                </div>
            </div>

            <div className="bg-primary/5 p-8 rounded-[3rem] border border-primary/10 flex flex-col md:flex-row items-center gap-6 justify-between">
                <div className="flex items-center gap-4 text-center md:text-left">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                        <FileText size={28} />
                    </div>
                    <div>
                        <h4 className="font-black text-dark tracking-tight leading-tight">Laporan Transparansi Digital</h4>
                        <p className="text-xs font-medium text-slate-500 max-w-sm">Dibuat otomatis oleh sistem Kas RT untuk memastikan kejujuran dan kepercayaan seluruh warga.</p>
                    </div>
                </div>
                <button className="text-primary font-black text-xs uppercase tracking-widest hover:underline">Lihat Struktur Organisasi</button>
            </div>
        </div>
    );
};

export default LaporanPage;
