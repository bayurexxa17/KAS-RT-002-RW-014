import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';


import api, { API_BASE_URL } from './api';
import { useAuth } from './AuthContext';
import { LogIn, User, Lock, Wallet } from 'lucide-react';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({ app_name: 'Kas RT', logo_url: null, description: 'Masuk untuk mengakses Kas RT' });

    useEffect(() => {
        api.get('/api/settings')
            .then(res => setSettings(res.data))
            .catch(err => console.error(err));
    }, []);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await login(username, password);
        if (res.success) {
            navigate('/');
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
                        <img
                            src={settings.logo_url.startsWith('http') ? settings.logo_url : `${API_BASE_URL}${settings.logo_url}`}
                            alt="Logo"
                            className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-xl object-cover"
                        />
                    ) : (
                        <div className="w-20 h-20 mx-auto mb-4 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl">
                            <Wallet size={40} />
                        </div>
                    )}
                    <h1 className="text-2xl font-black text-dark mb-2">Selamat Datang 👋</h1>
                    <h2 className="text-sm font-bold text-primary mb-1">{settings.app_name}</h2>
                    <p className="text-slate-400 text-xs font-medium">{settings.description}</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-danger/10 text-danger rounded-xl text-xs font-bold text-center border border-danger/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">Username</label>
                        <div className="relative">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-dark outline-none focus:border-primary transition-colors"
                                placeholder="Masukkan username"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">Password</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-dark outline-none focus:border-primary transition-colors"
                                placeholder="Masukkan password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? 'MEMPROSES...' : <><LogIn size={18} /> LOG IN SEKARANG</>}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs font-bold text-slate-400">
                        Belum punya akun? <Link to="/register" className="text-primary hover:underline">Daftar sebagai Warga</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
