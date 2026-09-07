import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './Dashboard';
import WargaPage from './WargaPage';
import TagihanPage from './TagihanPage';
import MarketplacePage from './MarketplacePage';
import KwitansiPage from './KwitansiPage';
import FinancePage from './FinancePage';
import LaporanPage from './LaporanPage';
import JenisIuranPage from './JenisIuranPage';
import WhatsAppPage from './WhatsAppPage';
import PengaturanPage from './PengaturanPage';
import ProfilePage from './ProfilePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import { AuthProvider, useAuth } from './AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold">Memuat...</div>;
    if (!user) return <Navigate to="/login" />;

    // Role Check - Case Insensitive
    if (allowedRoles) {
        const userRole = user.role?.toLowerCase();
        const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

        if (!normalizedAllowed.includes(userRole)) {
            return (
                <Layout>
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
                        <div className="w-24 h-24 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-6">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                        </div>
                        <h2 className="text-2xl font-black text-dark mb-2">Akses Ditolak 🛑</h2>
                        <p className="text-slate-500 font-medium max-w-md">
                            Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini hanya untuk <b>{allowedRoles.join(' / ')}</b>.
                        </p>
                    </div>
                </Layout>
            );
        }
    }

    return <Layout>{children}</Layout>;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* All Roles */}
                    <Route path="/" element={<ProtectedRoute allowedRoles={['Admin', 'Bendahara', 'Warga']}><Dashboard /></ProtectedRoute>} />
                    <Route path="/marketplace" element={<ProtectedRoute allowedRoles={['Admin', 'Bendahara', 'Warga']}><MarketplacePage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute allowedRoles={['Admin', 'Bendahara', 'Warga']}><ProfilePage /></ProtectedRoute>} />
                    <Route path="/tagihan" element={<ProtectedRoute allowedRoles={['Admin', 'Bendahara', 'Warga']}><TagihanPage /></ProtectedRoute>} />
                    <Route path="/kwitansi" element={<ProtectedRoute allowedRoles={['Admin', 'Bendahara', 'Warga']}><KwitansiPage /></ProtectedRoute>} />

                    {/* Admin & Bendahara Only */}
                    <Route path="/warga" element={<ProtectedRoute allowedRoles={['Admin', 'Bendahara']}><WargaPage /></ProtectedRoute>} />
                    <Route path="/iuran" element={<ProtectedRoute allowedRoles={['Admin', 'Bendahara']}><JenisIuranPage /></ProtectedRoute>} />
                    <Route path="/pemasukan" element={<ProtectedRoute allowedRoles={['Admin', 'Bendahara']}><FinancePage title="Pemasukan Kas" type="in" /></ProtectedRoute>} />
                    <Route path="/pengeluaran" element={<ProtectedRoute allowedRoles={['Admin', 'Bendahara']}><FinancePage title="Pengeluaran Kas" type="out" /></ProtectedRoute>} />
                    <Route path="/whatsapp" element={<ProtectedRoute allowedRoles={['Admin', 'Bendahara']}><WhatsAppPage /></ProtectedRoute>} />
                    <Route path="/laporan" element={<ProtectedRoute allowedRoles={['Admin', 'Bendahara']}><LaporanPage /></ProtectedRoute>} />

                    {/* Admin Only */}
                    <Route path="/pengaturan" element={<ProtectedRoute allowedRoles={['Admin']}><PengaturanPage /></ProtectedRoute>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}


export default App;
