import React, { useState, useEffect } from 'react';
import api from './api';
import { ShoppingBag, MessageCircle, Plus, Search, Filter, User, X, Edit3, Trash2 } from 'lucide-react';
import ImageUpload from './components/ImageUpload';



import { useAuth } from './AuthContext';

const MarketplacePage = () => {
    const { user } = useAuth(); // Get current user
    const [products, setProducts] = useState([]);
    const [warga, setWarga] = useState({});
    const [wargaList, setWargaList] = useState([]); // Array for dropdown
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        whatsapp_link: '',
        owner_id: ''
    });


    useEffect(() => {
        fetchData();
    }, []);

    // Effect to auto-select owner when modal opens if user is Warga
    useEffect(() => {
        if (isModalOpen && user?.role === 'Warga' && user?.warga_id && !editingId) {
            // Auto-fill logic
            const ownerId = user.warga_id;
            const selectedWarga = warga[ownerId];
            let waLink = '';

            if (selectedWarga && selectedWarga.whatsapp) {
                let phone = selectedWarga.whatsapp.replace(/\D/g, '');
                if (phone.startsWith('0')) phone = '62' + phone.substring(1);
                waLink = `https://wa.me/${phone}`;
            }

            setFormData(prev => ({
                ...prev,
                owner_id: ownerId,
                whatsapp_link: waLink
            }));
        }
    }, [isModalOpen, user, warga, editingId]);

    const fetchData = async () => {
        // Fetch Warga (Independent)
        try {
            console.log('Fetching Warga data...');
            const wargaResp = await api.get('/api/warga');
            console.log('Warga Data:', wargaResp.data);

            const wargaMap = {};
            if (Array.isArray(wargaResp.data)) {
                wargaResp.data.forEach(w => { wargaMap[w.id] = w; });
                setWargaList(wargaResp.data);
            }
            setWarga(wargaMap);
        } catch (err) {
            console.error('Error fetching warga:', err);
        }

        // Fetch Products (Independent)
        try {
            console.log('Fetching Marketplace data...');
            const prodResp = await api.get('/api/marketplace');
            setProducts(prodResp.data);
        } catch (err) {
            console.error('Error fetching marketplace products:', err);
            // Optional: Set empty products or show error state
        }
    };



    const handleOwnerChange = (e) => {
        const ownerId = parseInt(e.target.value);
        if (isNaN(ownerId)) {
            setFormData({ ...formData, owner_id: '', whatsapp_link: '' });
            return;
        }

        const selectedWarga = warga[ownerId];
        let waLink = '';

        if (selectedWarga && selectedWarga.whatsapp) {
            let phone = selectedWarga.whatsapp.replace(/\D/g, '');
            if (phone.startsWith('0')) {
                phone = '62' + phone.substring(1);
            }
            waLink = `https://wa.me/${phone}`;
        }

        setFormData({
            ...formData,
            owner_id: ownerId,
            whatsapp_link: waLink
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/api/marketplace/${editingId}`, formData);
            } else {
                await api.post('/api/marketplace', formData);
            }
            setIsModalOpen(false);
            resetForm();
            fetchData();
        } catch (err) {
            console.error('Error saving product:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus produk ini?')) {
            try {
                await api.delete(`/api/marketplace/${id}`);
                fetchData();
            } catch (err) {
                console.error('Error deleting product:', err);
            }
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            image_url: getCleanImageUrl(product.image_url) || '',
            whatsapp_link: product.whatsapp_link,
            owner_id: product.owner_id
        });
        setEditingId(product.id);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', price: 0, image_url: '', whatsapp_link: '', owner_id: '' });
        setEditingId(null);
    };



    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCleanImageUrl = (url) => {
        if (!url) return '';
        // Fix for mixed content: strip localhost:8000 if present in DB data
        if (url.includes('localhost:8000')) {
            return url.replace('http://localhost:8000', '').replace('https://localhost:8000', '');
        }
        return url;
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-dark tracking-tight">Marketplace Warga</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mendukung UMKM & Ekonomi lokal antar warga</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300 shadow-soft bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-primary/30 hover:shadow-xl transition-all active:scale-95"
                    >
                        <Plus size={20} /> Jual Produk
                    </button>

                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {filteredProducts.map((p) => (
                    <div key={p.id} className="group bg-white rounded-[2.5rem] shadow-soft-xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                        <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center relative overflow-hidden shrink-0">
                            {p.image_url ? (
                                <img src={getCleanImageUrl(p.image_url)} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <ShoppingBag size={64} className="text-slate-100 group-hover:text-primary/20 transition-colors" />
                            )}
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-xs font-black text-primary shadow-soft border border-white/50">
                                Rp {p.price.toLocaleString('id-ID')}
                            </div>
                            <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {(['Admin', 'admin', 'Bendahara', 'bendahara'].includes(user?.role) || user?.warga_id === p.owner_id) && (
                                    <>
                                        <button onClick={() => handleEdit(p)} className="p-2 bg-white rounded-xl shadow-sm text-warning hover:scale-110 transition-transform">
                                            <Edit3 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(p.id)} className="p-2 bg-white rounded-xl shadow-sm text-danger hover:scale-110 transition-transform">
                                            <Trash2 size={14} />
                                        </button>
                                    </>
                                )}
                            </div>


                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Tersedia</span>
                            </div>
                            <h4 className="font-black text-dark text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-1">{p.name}</h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2 mb-6 h-8">{p.description}</p>

                            <div className="mt-auto space-y-4">
                                <div className="flex items-center gap-2 py-3 border-t border-slate-50">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <User size={12} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{warga[p.owner_id]?.nama || 'Penjual RT'}</p>
                                </div>
                                <a
                                    href={p.whatsapp_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full flex items-center justify-center gap-2 bg-success text-white py-4 rounded-2xl text-xs font-black shadow-lg shadow-success/20 hover:shadow-success/40 transition-all active:scale-95"
                                >
                                    <MessageCircle size={16} /> HUBUNGI PENJUAL
                                </a>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredProducts.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center gap-4">
                        <div className="w-20 h-20 rounded-[2rem] bg-white shadow-soft flex items-center justify-center text-slate-200">
                            <ShoppingBag size={48} />
                        </div>
                        <div>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Produk belum tersedia</p>
                            <p className="text-slate-300 text-xs font-medium">Jadilah yang pertama berjualan di RT ini!</p>
                        </div>
                    </div>
                )}
            </div>


            {/* Modal Form */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-[2.5rem] shadow-soft-xl w-full max-w-md overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
                            <div className={`p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/50 backdrop-blur z-10`}>
                                <div>
                                    <h3 className="text-xl font-black text-dark">{editingId ? 'Edit' : 'Jual'} Produk</h3>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Marketplace Warga</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                    <X size={24} className="text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Penjual (Warga) {wargaList.length === 0 && '(Loading...)'}
                                    </label>

                                    {user?.role === 'Warga' ? (
                                        <div className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl text-sm font-bold bg-slate-50 text-slate-500">
                                            {warga[user.warga_id]?.nama || user.username} (Saya)
                                        </div>
                                    ) : (
                                        <select
                                            className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-primary outline-none transition-all bg-white"
                                            value={formData.owner_id}
                                            onChange={handleOwnerChange}
                                            required
                                        >
                                            <option value="">Pilih Warga...</option>
                                            {wargaList.length > 0 ? (
                                                wargaList.map(w => (
                                                    <option key={w.id} value={w.id}>{w.nama} - {w.no_rumah}</option>
                                                ))
                                            ) : (
                                                <option value="" disabled>Data kosong ({wargaList.length})</option>
                                            )}
                                        </select>
                                    )}



                                    {formData.whatsapp_link && (
                                        <p className="text-[10px] font-bold text-success ml-1">✓ WhatsApp Link tergenerate otomatis</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Produk</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Nasi Uduk Spesial"
                                        className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>


                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga (Rp)</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="0"
                                        className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl text-xl font-black text-primary focus:border-primary outline-none transition-all"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi</label>
                                    <textarea
                                        required
                                        className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-primary outline-none transition-all h-24 resize-none placeholder:text-slate-300"
                                        placeholder="Jelaskan produk anda..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>


                                <div className="space-y-2">
                                    <ImageUpload
                                        label="Foto Produk"
                                        value={formData.image_url}
                                        onChange={(url) => setFormData({ ...formData, image_url: url })}
                                    />
                                </div>


                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
                                >
                                    SIMPAN PRODUK
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div>

    );
};

export default MarketplacePage;
