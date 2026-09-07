import React, { useState, useRef } from 'react';
import api, { API_BASE_URL } from '../api';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

const ImageUpload = ({ label = "Upload Gambar", value, onChange, className }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(value);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log("Upload success:", res.data.url);
            setPreview(res.data.url);
            onChange(res.data.url);
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Gagal mengupload gambar. Pastikan format JPG/PNG/WEBP.");
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview('');
        onChange('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>

            <div className="relative group">
                {preview ? (
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50">
                        <img
                            src={preview.startsWith('http') ? preview : `${API_BASE_URL}${preview}`}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-dark/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-white rounded-xl text-primary hover:scale-110 transition-transform shadow-lg"
                                title="Ganti Gambar"
                            >
                                <Upload size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="p-2 bg-white rounded-xl text-danger hover:scale-110 transition-transform shadow-lg"
                                title="Hapus Gambar"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group ${uploading ? 'pointer-events-none opacity-50' : ''}`}
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:scale-110 transition-all">
                            {uploading ? <Loader2 className="animate-spin" /> : <ImageIcon size={20} />}
                        </div>
                        <p className="text-xs font-bold text-slate-400 group-hover:text-primary">
                            {uploading ? 'Mengupload...' : 'Klik untuk upload gambar'}
                        </p>
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
};

export default ImageUpload;
