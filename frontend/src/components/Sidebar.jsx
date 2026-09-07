import React, { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../api';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Wallet,
    ArrowDownCircle,
    ArrowUpCircle,
    FileText,
    Send,
    Receipt,
    BarChart3,
    Settings,
    ShoppingBag,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react';

import { useAuth } from '../AuthContext';

const Sidebar = ({ isOpen, toggleSidebar, isCollapsed, toggleCollapse }) => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({ app_name: 'Kas RT', logo_url: null, description: '' });

    useEffect(() => {
        api.get('/api/settings')
            .then(res => setSettings(res.data))
            .catch(err => console.error(err));
    }, []);

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/', roles: ['Admin', 'Bendahara', 'Warga'] },
        { name: 'Data Warga', icon: <Users size={20} />, path: '/warga', roles: ['Admin', 'Bendahara'] },
        { name: 'Jenis Iuran', icon: <Wallet size={20} />, path: '/iuran', roles: ['Admin', 'Bendahara'] },
        { name: 'Pemasukan', icon: <ArrowDownCircle size={20} />, path: '/pemasukan', roles: ['Admin', 'Bendahara'] },
        { name: 'Pengeluaran', icon: <ArrowUpCircle size={20} />, path: '/pengeluaran', roles: ['Admin', 'Bendahara'] },
        { name: 'Tagihan', icon: <FileText size={20} />, path: '/tagihan', roles: ['Admin', 'Bendahara', 'Warga'] },
        { name: 'Kirim WhatsApp', icon: <Send size={20} />, path: '/whatsapp', roles: ['Admin', 'Bendahara'] },
        { name: 'Kwitansi', icon: <Receipt size={20} />, path: '/kwitansi', roles: ['Admin', 'Bendahara', 'Warga'] },
        { name: 'Laporan', icon: <BarChart3 size={20} />, path: '/laporan', roles: ['Admin', 'Bendahara'] },
        { name: 'Marketplace', icon: <ShoppingBag size={20} />, path: '/marketplace', roles: ['Admin', 'Bendahara', 'Warga'] },
        { name: 'Pengaturan', icon: <Settings size={20} />, path: '/pengaturan', roles: ['Admin'] },
    ];

    const filteredMenuItems = menuItems.filter(item => {
        const userRole = user?.role?.toLowerCase();
        const allowedRoles = item.roles.map(r => r.toLowerCase());
        return allowedRoles.includes(userRole);
    });

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-dark/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <div className={`fixed left-0 top-0 h-full bg-white shadow-xl z-50 flex flex-col transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                } ${isCollapsed ? 'w-20' : 'w-64'}`}>

                {/* Header */}
                <div className={`p-6 flex items-center justify-between ${isCollapsed ? 'justify-center p-4' : ''}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="min-w-10 w-10 h-10 bg-success rounded-lg flex items-center justify-center text-white shadow-lg shadow-success/20 overflow-hidden">
                            {settings.logo_url ? (
                                <img
                                    src={settings.logo_url.includes('localhost:8000')
                                        ? settings.logo_url.replace('http://localhost:8000', '').replace('https://localhost:8000', '')
                                        : (settings.logo_url.startsWith('http') ? settings.logo_url : `${API_BASE_URL}${settings.logo_url}`)
                                    }
                                    alt="Logo"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Wallet size={24} />
                            )}
                        </div>
                        <div className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                            <h1 className="font-bold text-dark leading-tight whitespace-nowrap">{settings.app_name}</h1>
                            <p className="text-[10px] text-slate-400 whitespace-nowrap leading-tight max-w-[120px] truncate" title={settings.description}>{settings.description || user?.role}</p>
                        </div>
                    </div>
                    <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                        <X size={20} />
                    </button>

                </div>

                {/* Navigation */}
                <nav className="flex-1 mt-4 overflow-y-auto overflow-x-hidden px-3 custom-scrollbar">
                    {filteredMenuItems.map((item) => (
                        <NavLink

                            key={item.name}
                            to={item.path}
                            onClick={() => {
                                if (window.innerWidth < 1024) toggleSidebar();
                            }}
                            className={({ isActive }) =>
                                `flex items-center p-3 mb-2 rounded-xl text-sm font-bold transition-all relative group ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-dark'
                                } ${isCollapsed ? 'justify-center' : ''}`
                            }
                            title={isCollapsed ? item.name : ''}
                        >
                            <span className={`${isCollapsed ? '' : 'mr-3'}`}>{item.icon}</span>
                            <span className={`transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'hidden' : 'block'}`}>
                                {item.name}
                            </span>

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 bg-dark text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl">
                                    {item.name}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer / Toggle Button */}
                <div className="p-4 border-t border-slate-100 mt-auto">
                    {/* Collapsible Info Box */}
                    {!isCollapsed && (
                        <div className="bg-primary/10 p-4 rounded-xl mb-4 animate-in fade-in zoom-in duration-300">
                            <p className="text-xs font-bold text-primary mb-1">Butuh Bantuan?</p>
                            <p className="text-[10px] text-slate-500 line-clamp-2">Hubungi pengembang.</p>
                        </div>
                    )}

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={toggleCollapse}
                        className="hidden lg:flex w-full items-center justify-center p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-primary transition-all active:scale-95"
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
