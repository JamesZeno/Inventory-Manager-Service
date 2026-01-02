import React, { createContext, useState, useEffect } from "react";
import axios from 'axios'

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const API = import.meta.env.VITE_API_URL;
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [username, setUser] = useState(localStorage.getItem('username') || '')
    const [company, setCompany] = useState(localStorage.getItem('company') || 'Inventory Management Service')
    const [role, setRole] = useState(localStorage.getItem('role') || '')
    const [isAuthed, setAuthState] = useState(token !== '');

    async function authlogin(auth) {
        try {
            const res = await axios.post(`${API}/api/auth/login`, { username: auth.user, password: auth.pwd });
            const newtoken = res.data.token;
            if (newtoken === '') {
                return;
            }
            localStorage.setItem('token', newtoken);
            localStorage.setItem('username', auth.user);
            setUser(auth.user);
            setToken(newtoken);
            setAuthState(true);
            fetchUserInfo();
        } catch (error) {
            console.warn(error);
        }
    }

    async function authlogout() {
        try {
            if (token !== '') {
                await axios.post(`${API}/api/auth/logout`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (e) {
            console.warn('server logout failed or token already invalid', e);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('company');
            localStorage.removeItem('role');
            setUser('');
            setCompany('Inventory Management Service');
            setRole('');
            setToken('');
            setAuthState(false);
        }
    }

    async function authregister(newauth) {
        try {
            const res = await axios.post(`${API}/api/auth/register`, {
                username: newauth.user,
                password: newauth.pwd, 
                companyName: newauth.company, 
                firstName: newauth.first, 
                lastName: newauth.last
            });
            alert(`registered; role: ${res.data.role}`);
        } catch (error) {
            console.warn(error);
            alert(`Registration failed: ${error.response?.data}`);
        }
    }

    async function fetchUserInfo() {
        try {
            if (token !== '') {
                const res = await axios.get(`${API}/api/auth/userinfo`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCompany(res.data.company);
                setRole(res.data.role);
                localStorage.setItem('company', res.data.company);
                localStorage.setItem('role', res.data.role);
            }
        } catch (e) {
            console.warn('Failed to fetch user info', e);
        }
    }

    useEffect(() => {
        if (token !== '') {
            fetchUserInfo();
        }
    }, [token]);

    const value = { username, company, role, API, token, isAuthed, authlogin, authlogout, authregister };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
