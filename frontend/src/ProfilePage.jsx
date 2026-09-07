import React, { useState, useEffect } from 'react';
import api from './api';
import { useAuth } from './AuthContext';
import { User, Shield, Save, Lock, MapPin, Phone, CreditCard, Info } from 'lucide-react';
import ImageUpload from './components/ImageUpload';

const ProfilePage = () => {
    const { user: authUser } = useAuth();
    // Use the logged-in user's ID
    const CURRENT_USER_ID = authUser?.id;


    const [user, setUser] = useState(null);
    const [warga, setWarga] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        password: '',
        whatsapp: '',
        alamat: '',
        no_rumah: '',
        foto_url: ''
    });


    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            // 1. Get User Data
            const userRes = await api.get(`/api/users/${CURRENT_USER_ID}`); // Note: In real app, this would be /api/users/me
            const userData = userRes.data;
            setUser(userData);

            // Set initial foto_url
            setFormData(prev => ({ ...prev, foto_url: userData.foto_url || '' }));

            // 2. Get Warga Data if linked
            if (userData.warga_id) {
                const wargaRes = await api.get(`/api/warga/${userData.warga_id}`);
                const wargaData = wargaRes.data;
                setWarga(wargaData);

                // Initialize Form
                setFormData(prev => ({
                    ...prev,
                    whatsapp: wargaData.whatsapp || '',
                    alamat: wargaData.alamat || '',
                    no_rumah: wargaData.no_rumah || ''
                }));
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
            // Fallback
            alert("Gagal memuat profil. Silakan coba lagi atau hubungi admin.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // 1. Update User (Password and Foto)
            const userUpdateData = { foto_url: formData.foto_url };
            if (formData.password) userUpdateData.password = formData.password;

            await api.put(`/api/users/${CURRENT_USER_ID}`, userUpdateData);

            // 2. Update Warga (Contact Info)
            if (user?.warga_id) {
                await api.put(`/api/warga/${user.warga_id}`, {
                    whatsapp: formData.whatsapp
                });
            }

            alert('Profil berhasil diperbarui!');

            fetchProfile(); // Refresh data
        } catch (err) {
            console.error("Error saving profile:", err);
            alert('Gagal menyimpan perubahan.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading profile...</div>;

    return (
        <div className="space-y-6 pb-12 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-black text-dark tracking-tight">Profil Saya</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kelola akun dan data pribadi anda</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Avatar & Account Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card bg-white p-6 rounded-[2.5rem] shadow-soft border border-slate-100 flex flex-col items-center text-center">
                        <div className="mb-4">
                            <ImageUpload
                                label=""
                                value={formData.foto_url}
                                onChange={(url) => setFormData(prev => ({ ...prev, foto_url: url }))}
                                className="w-40 mx-auto"
                            />
                        </div>

                        <h3 className="text-xl font-black text-dark">{warga?.nama || user?.username}</h3>
                        <div className="flex items-center gap-1 mt-1">
                            <Shield size={12} className="text-primary" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{user?.role || 'Guest'}</p>
                        </div>

                        <div className="mt-6 w-full space-y-3">
                            <div className="p-3 bg-slate-50 rounded-2xl flex flex-col items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase">NIK (Permanen)</span>
                                <span className="font-bold text-dark font-mono text-sm tracking-widest">{warga?.nik || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="lg:col-span-2">
                    <div className="card bg-white p-8 rounded-[2.5rem] shadow-soft border border-slate-100 h-full">
                        <h4 className="text-lg font-black text-dark mb-6 flex items-center gap-2">
                            <EditIcon /> Edit Profil
                        </h4>

                        <div className="space-y-6">
                            {/* Account Section */}
                            <div className="space-y-4 pb-6 border-b border-slate-100">
                                <h5 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Lock size={14} /> Akun Login
                                </h5>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Username</label>
                                        <input
                                            type="text"
                                            value={user?.username || ''}
                                            disabled
                                            className="w-full p-3 bg-slate-100 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed"
                                        />
                                        <p className="text-[9px] text-slate-400 mt-1 italic">*Username tidak dapat diubah</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Password Baru</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Isi untuk ganti password"
                                            className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-dark outline-none focus:border-primary transition-colors placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Personal Data Section */}
                            <div className="space-y-4">
                                <h5 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Info size={14} /> Data Warga
                                </h5>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={warga?.nama || ''}
                                        disabled
                                        className="w-full p-3 bg-slate-100 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">WhatsApp / HP</label>
                                        <div className="relative">
                                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <input
                                                type="text"
                                                value={formData.whatsapp}
                                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                                placeholder="Contoh: 62812345678"
                                                className="w-full pl-9 pr-3 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-dark outline-none focus:border-primary transition-colors placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">No. Rumah / Blok</label>
                                        <input
                                            type="text"
                                            value={formData.no_rumah}
                                            disabled
                                            className="w-full p-3 bg-slate-100 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Alamat Lengkap</label>
                                    <textarea
                                        value={formData.alamat}
                                        disabled
                                        className="w-full p-3 bg-slate-100 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed resize-none h-24"
                                    />
                                    <p className="text-[9px] text-slate-400 mt-2 italic">*Data warga dikelola oleh Admin. Hubungi pengurus RT untuk perubahan data.</p>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
                                >
                                    <Save size={18} /> {saving ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EditIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
);

export default ProfilePage;
