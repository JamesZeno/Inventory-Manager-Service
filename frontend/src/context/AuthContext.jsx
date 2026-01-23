import React, { createContext, useState, useEffect } from "react";
import axios from 'axios'

export const AuthContext = createContext();

// Helper to decode JWT and check expiration
function isTokenExpired(token) {
    if (!token) return true;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return true;
        const decoded = JSON.parse(atob(parts[1]));
        const exp = decoded.exp;
        if (!exp) return true;
        // Check if token expires within next 60 seconds
        return exp * 1000 < Date.now() + 60000;
    } catch (e) {
        return true;
    }
}

export const AuthProvider = ({ children }) => {

    const API = import.meta.env.VITE_API_URL;
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [username, setUser] = useState(localStorage.getItem('username') || '')
    const [company, setCompany] = useState(localStorage.getItem('company') || 'Inventory Management Service')
    const [role, setRole] = useState(localStorage.getItem('role') || '')
    const [isAuthed, setAuthState] = useState(token !== '' && !isTokenExpired(token));

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
            setAuthState(!isTokenExpired(newtoken));
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
            if (!token || isTokenExpired(token)) {
                authlogout();
                return;
            }
            const res = await axios.get(`${API}/api/auth/userinfo`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCompany(res.data.company);
            setRole(res.data.role);
            localStorage.setItem('company', res.data.company);
            localStorage.setItem('role', res.data.role);
        } catch (e) {
            console.warn('Failed to fetch user info', e);
            if (e.response?.status === 401) {
                authlogout();
            }
        }
    }

    useEffect(() => {
        if (token !== '') {
            fetchUserInfo(token);
        }
    }, [token]);

    // Setup axios interceptor for 401 responses
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    authlogout();
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const value = { username, company, role, API, token, isAuthed, authlogin, authlogout, authregister };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
