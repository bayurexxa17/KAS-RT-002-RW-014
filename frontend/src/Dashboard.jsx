import React, { useState, useEffect } from 'react';
import api from './api';
import {
    BarChart3,
    Users,
    Wallet,
    Activity,
    Clock,
    TrendingUp,
    ArrowRight,
    User,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

import { Link } from 'react-router-dom';
import DashboardChart from './components/DashboardChart';


const Dashboard = () => {
    const [stats, setStats] = useState({
        totalKas: 0,
        totalWarga: 0,
        pendingTagihan: 0,
        pemasukanBulanIni: 0
    });
    const [recentTagihan, setRecentTagihan] = useState([]);
    const [wargaMap, setWargaMap] = useState({});
    const [transactions, setTransactions] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [error, setError] = useState(null);




    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [wargaResp, tagihanResp, transResp] = await Promise.all([
                api.get('/api/warga'),
                api.get('/api/tagihan'),
                api.get('/api/transaksi')
            ]);

            const wMap = {};
            wargaResp.data.forEach(w => { wMap[w.id] = w; });

            setWargaMap(wMap);
            setTransactions(transResp.data);

            const totalKas = transResp.data.reduce((acc, curr) =>

                curr.tipe === 'Pemasukan' ? acc + curr.jumlah : acc - curr.jumlah, 0);

            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const pemasukanBulanIni = transResp.data
                .filter(t => t.tipe === 'Pemasukan' && new Date(t.tanggal) >= startOfMonth)
                .reduce((acc, curr) => acc + curr.jumlah, 0);

            setStats({
                totalKas,
                totalWarga: wargaResp.data.length,
                pendingTagihan: tagihanResp.data.filter(t => t.status_lunas === 0).length,
                pemasukanBulanIni
            });

            setRecentTagihan(tagihanResp.data.slice(-5).reverse());
            setRecentTagihan(tagihanResp.data.slice(-5).reverse());
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message || 'Gagal mengambil data dari server');
        }
    };


    const statCards = [
        { title: 'Total Kas RT', value: `Rp ${stats.totalKas.toLocaleString('id-ID')}`, icon: <Wallet size={24} />, color: 'bg-primary', shadow: 'shadow-primary/20' },
        { title: 'Jumlah Warga', value: stats.totalWarga, icon: <Users size={24} />, color: 'bg-success', shadow: 'shadow-success/20' },
        { title: 'Tagihan Pending', value: stats.pendingTagihan, icon: <Clock size={24} />, color: 'bg-warning', shadow: 'shadow-warning/20' },
        { title: 'Kas Masuk Bulan Ini', value: `Rp ${stats.pemasukanBulanIni.toLocaleString('id-ID')}`, icon: <TrendingUp size={24} />, color: 'bg-info', shadow: 'shadow-info/20' },
    ];

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h2 className="text-2xl font-black text-dark tracking-tight">Ringkasan Sistem</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Statistik vital rukun tetangga hari ini</p>
            </div>

            {error && (
                <div className="bg-danger/10 text-danger p-4 rounded-xl border border-danger/20 text-sm font-bold flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>Error: {error}. Pastikan backend berjalan di port 8000.</span>
                </div>
            )}


            {/* Stats Cards - Grid Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-soft-xl border border-slate-50 flex items-center justify-between group hover:translate-y-[-4px] transition-all duration-300">
                        <div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-2">{s.title}</p>
                            <h3 className="text-xl font-black text-dark leading-tight">{s.value}</h3>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center text-white shadow-lg ${s.shadow} transform group-hover:rotate-12 transition-transform`}>
                            {s.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Placeholder / Main Activity */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-soft-xl border border-slate-100 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="font-black text-dark text-lg flex items-center gap-2">
                            <Activity size={20} className="text-primary" /> Visualisasi Arus Kas
                        </h4>
                        <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1">
                            <button
                                onClick={() => setSelectedYear(selectedYear - 1)}
                                className="p-1 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-primary"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-black text-dark min-w-[3rem] text-center">{selectedYear}</span>
                            <button
                                onClick={() => setSelectedYear(selectedYear + 1)}
                                className="p-1 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-primary"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                    </div>
                    <div className="bg-white p-6 rounded-[2rem] h-full flex flex-col justify-center">
                        <DashboardChart data={transactions} year={selectedYear} />
                    </div>

                </div>

                {/* Recent Billing */}
                <div className="bg-white p-8 rounded-[3rem] shadow-soft-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="font-black text-dark text-lg">Tagihan Terbaru</h4>
                        <Link to="/tagihan" className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-colors">
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="space-y-5">
                        {recentTagihan.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-50 rounded-2xl hover:bg-white hover:shadow-soft transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-soft flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-dark leading-tight">{wargaMap[t.warga_id]?.nama || 'Warga RT'}</p>
                                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Jan 2026 • RT {wargaMap[t.warga_id]?.no_rumah}</p>
                                    </div>
                                </div>
                                {t.status_lunas === 1 ? (
                                    <div className="w-6 h-6 rounded-lg bg-success/10 text-success flex items-center justify-center">
                                        <CheckCircle size={14} />
                                    </div>
                                ) : (
                                    <div className="w-6 h-6 rounded-lg bg-warning/10 text-warning flex items-center justify-center animate-pulse">
                                        <AlertCircle size={14} />
                                    </div>
                                )}
                            </div>
                        ))}
                        {recentTagihan.length === 0 && (
                            <div className="py-10 text-center text-slate-300 italic text-xs font-bold uppercase tracking-widest">
                                Tidak ada aktivitas tagihan
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions / Info for Mobile */}
            <div className="lg:hidden grid grid-cols-2 gap-4">
                <Link to="/warga" className="p-6 bg-primary text-white rounded-[2rem] shadow-lg shadow-primary/20 flex flex-col items-center justify-center gap-2">
                    <Users size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center">Data Warga</span>
                </Link>
                <Link to="/iuran" className="p-6 bg-success text-white rounded-[2rem] shadow-lg shadow-success/20 flex flex-col items-center justify-center gap-2">
                    <Wallet size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center">Jenis Iuran</span>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
