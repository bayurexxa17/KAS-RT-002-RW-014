import React, { useState, useEffect } from 'react';
import api from './api';
import { Save, UserPlus, Settings, Users, Shield, RefreshCw, Edit, Trash2, X } from 'lucide-react';
import ImageUpload from './components/ImageUpload';


const PengaturanPage = () => {
    const [activeTab, setActiveTab] = useState('aplikasi'); // 'aplikasi' or 'users'
    const [loading, setLoading] = useState(false);

    // Settings State
    const [appSettings, setAppSettings] = useState({
        app_name: 'Kas RT',
        rt: '',
        rw: '',
        qris_url: '',
        no_rekening: ''
    });

    // User Management State
    const [users, setUsers] = useState([]);
    const [wargaList, setWargaList] = useState([]);
    const [newUser, setNewUser] = useState({
        warga_id: '',
        username: '',
        password: '',
        role: 'Warga'
    });
    const [editingUserId, setEditingUserId] = useState(null);

    // Fetch Data
    useEffect(() => {
        fetchSettings();
        fetchUsers();
        fetchWarga();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/api/settings');
            if (res.data) {
                if (res.data.logo_url && res.data.logo_url.includes('localhost:8000')) {
                    res.data.logo_url = res.data.logo_url.replace('http://localhost:8000', '').replace('https://localhost:8000', '');
                }
                if (res.data.qris_url && res.data.qris_url.includes('localhost:8000')) {
                    res.data.qris_url = res.data.qris_url.replace('http://localhost:8000', '').replace('https://localhost:8000', '');
                }
                setAppSettings(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchWarga = async () => {
        try {
            const res = await api.get('/api/warga');
            setWargaList(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            await api.put('/api/settings', appSettings);
            alert('Pengaturan berhasil disimpan! Halaman akan dimuat ulang.');
            window.location.reload();
        } catch (err) {
            alert('Gagal menyimpan pengaturan.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleWargaSelect = (e) => {
        const wargaId = e.target.value;
        const selectedWarga = wargaList.find(w => w.id === parseInt(wargaId));

        if (selectedWarga) {
            // Only auto-generate if NOT editing or if username is empty
            if (!editingUserId || !newUser.username) {
                const firstName = selectedWarga.nama.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
                const nikSuffix = selectedWarga.nik ? selectedWarga.nik.slice(-2) : '00';
                const generatedUsername = `${firstName}${nikSuffix}`;

                setNewUser(prev => ({
                    ...prev,
                    warga_id: wargaId,
                    username: generatedUsername
                }));
            } else {
                setNewUser(prev => ({ ...prev, warga_id: wargaId }));
            }
        } else {
            setNewUser(prev => ({ ...prev, warga_id: wargaId }));
        }
    };

    const handleSaveUser = async () => {
        if (!newUser.username) {
            alert('Username wajib diisi.');
            return;
        }
        if (!editingUserId && !newUser.password) {
            alert('Password wajib diisi untuk user baru.');
            return;
        }

        setLoading(true);
        try {
            if (editingUserId) {
                await api.put(`/api/users/${editingUserId}`, {
                    ...newUser,
                    warga_id: newUser.warga_id ? parseInt(newUser.warga_id) : null,
                    password: newUser.password || undefined // Only send if not empty
                });
                alert('User berhasil diperbarui!');
            } else {
                await api.post('/api/users', {
                    ...newUser,
                    warga_id: newUser.warga_id ? parseInt(newUser.warga_id) : null
                });
                alert('User berhasil dibuat!');
            }

            handleCancelEdit();
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.detail || 'Gagal menyimpan user.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user) => {
        setEditingUserId(user.id);
        setNewUser({
            warga_id: user.warga_id || '',
            username: user.username,
            password: '', // Keep empty, only fill if changing
            role: user.role
        });
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;

        try {
            await api.delete(`/api/users/${userId}`);
            fetchUsers();
        } catch (err) {
            alert('Gagal menghapus user.');
            console.error(err);
        }
    };

    const handleCancelEdit = () => {
        setEditingUserId(null);
        setNewUser({ warga_id: '', username: '', password: '', role: 'Warga' });
    }

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h2 className="text-2xl font-black text-dark tracking-tight">Pengaturan</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Konfigurasi Aplikasi & Pengguna</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-100">
                <button
                    onClick={() => setActiveTab('aplikasi')}
                    className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'aplikasi'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-slate-400 hover:text-dark'
                        }`}
                >
                    <div className="flex items-center gap-2"><Settings size={16} /> Aplikasi</div>
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'users'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-slate-400 hover:text-dark'
                        }`}
                >
                    <div className="flex items-center gap-2"><Users size={16} /> User Management</div>
                </button>
            </div>

            {/* Content */}
            {activeTab === 'aplikasi' && (
                <div className="card bg-white p-6 rounded-[2rem] shadow-soft border border-slate-100 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-lg font-black text-dark mb-6">Identitas Aplikasi</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Nama Aplikasi</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-dark outline-none focus:border-primary transition-colors"
                                value={appSettings.app_name}
                                onChange={(e) => setAppSettings({ ...appSettings, app_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Keterangan Aplikasi</label>
                            <textarea
                                className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-dark outline-none focus:border-primary transition-colors"
                                value={appSettings.description || ''}
                                onChange={(e) => setAppSettings({ ...appSettings, description: e.target.value })}
                                rows="3"
                                placeholder="Contoh: Aplikasi Manajemen Kas RT 05 RW 03"
                            />
                        </div>
                        <div>
                            <ImageUpload
                                label="Logo Aplikasi"
                                value={appSettings.logo_url}
                                onChange={(url) => setAppSettings({ ...appSettings, logo_url: url })}
                            />
                        </div>
                        <div>
                            <ImageUpload
                                label="QRIS Pembayaran (Gambar)"
                                value={appSettings.qris_url}
                                onChange={(url) => setAppSettings({ ...appSettings, qris_url: url })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Nomor Rekening Lengkap</label>
                            <textarea
                                className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-dark outline-none focus:border-primary transition-colors"
                                value={appSettings.no_rekening || ''}
                                onChange={(e) => setAppSettings({ ...appSettings, no_rekening: e.target.value })}
                                rows="3"
                                placeholder="Contoh: Bank BCA - 1234567890 a/n Ahmad"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">RT</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-dark outline-none focus:border-primary transition-colors"
                                    value={appSettings.rt}
                                    onChange={(e) => setAppSettings({ ...appSettings, rt: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">RW</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-dark outline-none focus:border-primary transition-colors"
                                    value={appSettings.rw}
                                    onChange={(e) => setAppSettings({ ...appSettings, rw: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={handleSaveSettings}
                                disabled={loading}
                                className="px-6 py-3 bg-dark text-white rounded-xl font-black text-xs shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
                            >
                                <Save size={16} /> SIMPAN PENGATURAN
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Create/Edit User Form */}
                    <div className="lg:col-span-1">
                        <div className="card bg-white p-6 rounded-[2rem] shadow-soft border border-slate-100 sticky top-24">
                            <h3 className="text-lg font-black text-dark mb-6 flex items-center gap-2">
                                <UserPlus size={20} className="text-primary" />
                                {editingUserId ? 'Edit User' : 'Buat User Baru'}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">1. Pilih Warga (Opsional)</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-dark outline-none focus:border-primary transition-colors"
                                        value={newUser.warga_id}
                                        onChange={handleWargaSelect}
                                    >
                                        <option value="">-- Pilih Warga --</option>
                                        {wargaList.map(w => (
                                            <option key={w.id} value={w.id}>{w.nama} (Blok {w.no_rumah})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">2. Username</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-dark outline-none focus:border-primary transition-colors"
                                            value={newUser.username}
                                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                            placeholder="Auto-generate / Manual"
                                        />
                                        {newUser.warga_id && !editingUserId && (
                                            <button
                                                onClick={() => handleWargaSelect({ target: { value: newUser.warga_id } })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
                                                title="Regenerate Username"
                                            >
                                                <RefreshCw size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">3. Password</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-dark outline-none focus:border-primary transition-colors"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        placeholder={editingUserId ? "Kosongkan jika tidak diubah" : "Ketik password..."}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">4. Role</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-dark outline-none focus:border-primary transition-colors"
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="Warga">Warga</option>
                                        <option value="Bendahara">Bendahara</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    {editingUserId && (
                                        <button
                                            onClick={handleCancelEdit}
                                            className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
                                        >
                                            BATAL
                                        </button>
                                    )}
                                    <button
                                        onClick={handleSaveUser}
                                        disabled={loading}
                                        className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-xs shadow-lg hover:bg-primary-dark transition-all"
                                    >
                                        {editingUserId ? 'UPDATE USER' : 'BUAT USER'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User List */}
                    <div className="lg:col-span-2">
                        <div className="card bg-white p-6 rounded-[2rem] shadow-soft border border-slate-100">
                            <h3 className="text-lg font-black text-dark mb-6 flex items-center gap-2">
                                <Users size={20} className="text-slate-400" /> Daftar User
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="p-3 text-[10px] font-black text-slate-400 uppercase">Username</th>
                                            <th className="p-3 text-[10px] font-black text-slate-400 uppercase">Role</th>
                                            <th className="p-3 text-[10px] font-black text-slate-400 uppercase">Terhubung Ke</th>
                                            <th className="p-3 text-[10px] font-black text-slate-400 uppercase text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {users.map(u => (
                                            <tr key={u.id} className="hover:bg-slate-50">
                                                <td className="p-3 text-sm font-bold text-dark">{u.username}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${u.role === 'Admin' ? 'bg-danger/10 text-danger' :
                                                        u.role === 'Bendahara' ? 'bg-primary/10 text-primary' :
                                                            'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-xs text-slate-500">
                                                    {u.warga_id ? (
                                                        <span className="flex items-center gap-1">
                                                            <Shield size={12} className="text-success" />
                                                            {wargaList.find(w => w.id === u.warga_id)?.nama || 'Warga ID ' + u.warga_id}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="p-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditUser(u)}
                                                            className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            className="p-1.5 bg-danger/10 text-danger rounded-lg hover:bg-danger hover:text-white transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="p-8 text-center text-slate-400 text-xs italic">Belum ada user.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PengaturanPage;
