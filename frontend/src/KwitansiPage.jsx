import React from 'react';
import { Download, Printer, CheckCircle, ArrowLeft, Receipt, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const KwitansiPage = () => {
    const location = useLocation();
    const data = location.state || {
        nama: "NONAME",
        nominal: 0,
        terbilang: "Nol Rupiah",
        keperluan: "Tidak ada data tagihan yang dipilih.",
        bulan: 1,
        tahun: 2026,
        status: 0,
        noKwitansi: "DRAFT"
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-8 pb-12 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-4">
                    <Link to="/tagihan" className="p-3 bg-white shadow-soft rounded-2xl text-slate-400 hover:text-dark transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-black text-dark tracking-tight">Pratinjau Kwitansi</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Dokumen bukti pembayaran sah</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={handlePrint} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-dark text-white px-6 py-3 rounded-2xl text-xs font-black shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                        <Printer size={16} /> CETAK
                    </button>
                </div>
            </div>

            <div className="relative group print:shadow-none print:border-none">
                {/* Decorative Elements - Hidden on Print */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-success opacity-20 blur-xl group-hover:opacity-30 transition-opacity rounded-[3rem] print:hidden" />

                <div className="relative bg-white shadow-2xl !p-6 md:p-16 rounded-[3rem] border border-slate-100 overflow-hidden print:p-0 print:border-none print:shadow-none">
                    {/* Watermark */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none rotate-[-30deg]">
                        <ShieldCheck size={400} className="text-primary" />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-success rounded-3xl flex items-center justify-center text-white shadow-lg shadow-success/20 print:shadow-none">
                                <Receipt size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-dark tracking-tighter">KWITANSI RESMI</h1>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Sistem Kas Digital RT</p>
                            </div>
                        </div>
                        <div className="text-left md:text-right space-y-1">
                            <p className="text-xl font-black text-dark">RT 05 / RW 02</p>
                            <p className="text-sm font-bold text-slate-400">Perumahan Harmoni Indah, Jakarta</p>
                            <div className="inline-block px-4 py-1 bg-slate-50 rounded-full border border-slate-100 text-[10px] font-black text-slate-400 mt-2 print:bg-transparent print:border-slate-800 print:text-slate-800">
                                NO: {data.noKwitansi}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 mb-16 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-8 items-center border-b border-slate-50 pb-6 print:grid-cols-4">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Diterima Dari</span>
                            <span className="md:col-span-3 text-lg font-black text-dark border-b-2 border-dotted border-slate-100 pb-1">{data.nama}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-8 items-center border-b border-slate-100 pb-6 print:grid-cols-4">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Uang Sejumlah</span>
                            <span className="md:col-span-3 text-lg font-black text-dark italic border-b-2 border-dotted border-slate-100 pb-1">{data.terbilang || 'Rp ' + data.nominal.toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-8 items-start border-b border-slate-100 pb-6 print:grid-cols-4">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest pt-1">Keperluan</span>
                            <span className="md:col-span-3 text-sm font-bold text-slate-600 leading-relaxed">
                                {data.keperluan}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-end gap-12 relative z-10 print:flex-row">
                        <div className="w-full md:w-auto p-8 md:p-10 bg-gradient-to-br from-slate-50 to-white border-2 border-primary/10 rounded-[2.5rem] shadow-inner flex flex-col items-center md:items-start shrink-0 print:border-slate-800 print:bg-none print:shadow-none print:p-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Terbayar</p>
                            <h2 className="text-4xl font-black text-primary tracking-tighter print:text-black">Rp {data.nominal.toLocaleString()}</h2>
                            {data.status === 1 ? (
                                <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full print:border print:border-black print:text-black print:bg-transparent">
                                    <CheckCircle size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-wider">LUNAS & TERVERIFIKASI</span>
                                </div>
                            ) : (
                                <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-warning/10 text-warning rounded-full print:border print:border-black print:text-black print:bg-transparent">
                                    <span className="text-[10px] font-black uppercase tracking-wider">BELUM LUNAS</span>
                                </div>
                            )}
                        </div>
                        <div className="text-center w-full md:w-64 space-y-16">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div className="relative inline-block pb-2 border-b-4 border-dark/10 print:border-black">
                                <p className="text-lg font-black text-dark leading-none">JESSICA JONES</p>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest absolute -bottom-6 left-0 right-0">Bendahara RT</p>
                                {/* Digital Stamp Placeholder */}
                                <div className="absolute -top-12 -right-12 w-24 h-24 border-4 border-success/20 rounded-full flex items-center justify-center rotate-12 pointer-events-none print:border-black/20">
                                    <div className="text-[10px] font-black text-success/20 text-center uppercase tracking-tighter print:text-black/20">DIGITAL<br />STAMP</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
                <p className="text-[10px] font-bold text-slate-400 italic">Kwitansi ini dihasilkan secara otomatis oleh Sistem Kas RT Digital dan merupakan bukti pembayaran yang sah.</p>
                <button className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline">Butuh Bantuan?</button>
            </div>
        </div>
    );
};

export default KwitansiPage;
