import React, { useState, useContext } from 'react'
import { AuthContext } from "../../context/AuthContext";
import '../topbar.css'

function UserRegister({ notFirst = false, companyName = '' }) {
    const { authregister } = useContext(AuthContext);
    const [newAuth, setAuth] = useState({ user: '', pwd: '', company: companyName, first: '', last: '', role: 'Admin' })

    async function register() {
        await authregister(newAuth);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        register();
    }

    return (
        <div className='center_div'>
            <h3>Create Account</h3>
            <form className={notFirst ? "registerform" : "loginform"} onSubmit={handleSubmit}>
                <input
                    placeholder="username"
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={newAuth.user}
                    onChange={e => setAuth(s => ({ ...s, user: e.target.value }))}
                    required
                />
                <input
                    placeholder="password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    minLength={6}
                    value={newAuth.pwd}
                    onChange={e => setAuth(s => ({ ...s, pwd: e.target.value }))}
                    required
                />
                <input
                    placeholder="first"
                    type="text"
                    name="first"
                    value={newAuth.first}
                    onChange={e => setAuth(s => ({ ...s, first: e.target.value }))}
                    required
                />
                <input
                    placeholder="last"
                    type="text"
                    name="last"
                    value={newAuth.last}
                    onChange={e => setAuth(s => ({ ...s, last: e.target.value }))}
                    required
                />
                {notFirst &&
                    <select
                        value={newAuth.role}
                        onChange={e => setAuth(s => ({ ...s, role: e.target.value }))}
                    >
                        <option value="Employee">Employee</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                    </select>
                }
                <input
                    placeholder="company"
                    type="text"
                    name="company"
                    value={newAuth.company}
                    onChange={e => setAuth(s => ({ ...s, company: e.target.value }))}
                    required
                    disabled={notFirst}
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
}
export default UserRegister;