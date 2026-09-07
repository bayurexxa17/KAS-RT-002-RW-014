import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore session from localStorage
        const storedUser = localStorage.getItem('rtapp_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('rtapp_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            // Backend returns the User object directly
            const resp = await api.post('/api/auth/login', { username, password });
            const userData = resp.data;

            setUser(userData);
            localStorage.setItem('rtapp_user', JSON.stringify(userData));
            return { success: true, data: userData };
        } catch (error) {
            console.error("Login failed", error);
            const message = error.response?.data?.detail || "Terjadi kesalahan saat login";
            return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem('rtapp_user');
        setUser(null);
        window.location.href = '/login';
    };

    const verifyNIK = async (nik) => {
        try {
            const resp = await api.post('/api/auth/verify-nik', { nik });
            return { success: true, data: resp.data };
        } catch (error) {
            console.error("NIK verification failed", error);
            const message = error.response?.data?.detail || "NIK tidak ditemukan atau sudah terdaftar";
            return { success: false, message };
        }
    };

    const register = async (username, password, nik) => {
        try {
            const resp = await api.post('/api/auth/register', { username, password, nik });
            return { success: true, data: resp.data };
        } catch (error) {
            console.error("Registration failed", error);
            const message = error.response?.data?.detail || "Gagal melakukan registrasi";
            return { success: false, message };
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, verifyNIK, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
