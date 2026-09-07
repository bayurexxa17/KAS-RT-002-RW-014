import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { API_BASE_URL } from './api';
import { useAuth } from './AuthContext';
import { UserPlus, User, Lock, CreditCard, CheckCircle, Search, Wallet } from 'lucide-react';

const RegisterPage = () => {
    const [nik, setNik] = useState('');
    const [verifiedData, setVerifiedData] = useState(null); // { nama: '', nik: '' }
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [settings, setSettings] = useState({ app_name: 'Kas RT', logo_url: null, description: '' });

    useEffect(() => {
        api.get('/api/settings')
            .then(res => setSettings(res.data))
            .catch(err => console.error(err));
    }, []);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const { register, verifyNIK } = useAuth();
    const navigate = useNavigate();

    const handleCheckNIK = async () => {
        if (!nik || nik.length < 10) {
            setError('Masukkan NIK yang valid.');
            return;
        }
        setError('');
        setVerifying(true);
        const res = await verifyNIK(nik);

        if (res.success) {
            setVerifiedData(res.data);

            // Auto Generate Username
            const firstName = res.data.nama.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            const nikSuffix = res.data.nik.slice(-4);
            const genUsername = `${firstName}${nikSuffix}`;
            setUsername(genUsername);

            setError('');
        } else {
            setError(res.message);
            setVerifiedData(null);
            setUsername('');
        }
        setVerifying(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!verifiedData) {
            setError('Silakan verifikasi NIK terlebih dahulu.');
            return;
        }

        setLoading(true);

        const res = await register(username, password, nik);
        if (res.success) {
            setSuccess('Registrasi berhasil! Silakan login.');
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-soft border border-slate-100">
                <div className="text-center mb-8">
                    {settings.logo_url ? (
                        <img src={`${API_BASE_URL}${settings.logo_url}`} alt="Logo" className="w-16 h-16 mx-auto mb-4 rounded-xl shadow-lg object-cover" />
                    ) : (
                        <div className="w-16 h-16 mx-auto mb-4 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg">
                            <Wallet size={32} />
                        </div>
                    )}
                    <h1 className="text-2xl font-black text-dark mb-1">Daftar Akun 📝</h1>
                    <p className="text-xs font-bold text-primary mb-2">{settings.app_name}</p>
                    <p className="text-slate-400 text-xs font-bold">Verifikasi NIK untuk akses sistem</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-danger/10 text-danger rounded-xl text-xs font-bold text-center border border-danger/20 animate-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-success/10 text-success rounded-xl text-xs font-bold text-center border border-success/20 animate-in slide-in-from-top-2">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Step 1: NIK Verification */}
                    <div className={`${verifiedData ? 'opacity-60 pointer-events-none' : ''} transition-all`}>
                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">1. Cek NIK</label>
                        <div className="relative flex shadow-sm rounded-2xl">
                            <div className="relative flex-grow z-10">
                                <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="text"
                                    value={nik}
                                    onChange={(e) => setNik(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-l-2xl text-sm font-bold text-dark outline-none focus:border-primary transition-colors"
                                    placeholder="Nomor Induk Kependudukan"
                                    disabled={verifiedData}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleCheckNIK}
                                disabled={verifying || verifiedData}
                                className="px-6 bg-dark text-white font-bold text-xs rounded-r-2xl hover:bg-slate-800 transition-colors disabled:bg-slate-300"
                            >
                                {verifying ? '...' : <Search size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Step 2: User details (Normally Validation) */}
                    {verifiedData && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-5">
                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle size={16} className="text-success" />
                                    <span className="text-xs font-black text-dark uppercase">Data Ditemukan</span>
                                </div>
                                <h3 className="text-lg font-black text-dark">{verifiedData.nama}</h3>
                                <p className="text-xs text-slate-500 font-mono mt-1">
                                    NIK: {verifiedData.nik.substring(0, 6)}*********{verifiedData.nik.substring(verifiedData.nik.length - 1)}
                                </p>

                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">2. Username (Otomatis)</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="text"
                                        value={username}
                                        readOnly
                                        className="w-full pl-12 pr-4 py-4 bg-slate-100 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-500 outline-none cursor-not-allowed"
                                        title="Username dibuat otomatis"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">3. Buat Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-dark outline-none focus:border-primary transition-colors"
                                        placeholder="Rahasiakan password anda"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {loading ? 'MEMPROSES...' : <><UserPlus size={18} /> SELESAI PENDAFTARAN</>}
                            </button>
                        </div>
                    )}
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs font-bold text-slate-400">
                        Sudah punya akun? <Link to="/login" className="text-primary hover:underline">Login disini</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
