import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

import Sidebar from './components/Sidebar';
import { Menu, User, LogOut } from 'lucide-react';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);


    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    return (
        <div className="min-h-screen bg-secondary">
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                isCollapsed={isCollapsed}
                toggleCollapse={toggleCollapse}
            />

            <main className={`min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
                <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white/70 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl lg:hidden transition-all active:scale-95 shadow-soft border border-slate-100"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400">
                            <span className="uppercase tracking-widest">Admin</span>
                            <span>/</span>
                            <span className="font-black text-dark tracking-normal">DASHBOARD</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-100 shadow-inner cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                            <div className="hidden sm:block text-right">
                                <p className="text-[10px] font-black text-dark leading-tight">{user?.username || 'User'}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{user?.role || 'Guest'}</p>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                <User size={16} />
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-danger hover:text-white transition-all shadow-soft border border-slate-100 active:scale-95"
                            title="Keluar"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>


                </header>

                <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
