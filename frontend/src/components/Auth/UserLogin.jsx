import React, { useState, useContext } from 'react'
import '../topbar.css'
import { AuthContext } from "../../context/AuthContext";
import UserRegister from "./UserRegister";

function UserLogin() {
    const { authlogin } = useContext(AuthContext);
    const [auth, setAuth] = useState({ user: '', pwd: '' })
    const [showRegister, setShowRegister] = useState(false)

    async function login() {
        await authlogin(auth);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        login();
    }

    if (showRegister) {
        return (
            <div className='center_div'>
                <UserRegister notFirst={false} companyName='' />
                <button
                    onClick={() => setShowRegister(false)}
                    className="loginform"
                >
                    Back to Login
                </button>
            </div>
        );
    }

    return (
        <div className='center_div'>
            <h3>Sign In</h3>
            <form className="loginform" onSubmit={handleSubmit}>
                <input
                    placeholder="username"
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={auth.user}
                    onChange={e => setAuth(s => ({ ...s, user: e.target.value }))}
                    required
                />
                <input
                    placeholder="password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    minLength={6}
                    value={auth.pwd}
                    onChange={e => setAuth(s => ({ ...s, pwd: e.target.value }))}
                    required
                />
                <button type="submit">
                    Sign In
                </button>
            </form>
            <button
                onClick={() => setShowRegister(true)}
            >
                New Account
            </button>
        </div>
    );
}
export default UserLogin;