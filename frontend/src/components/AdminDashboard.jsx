import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from "../context/AuthContext";
import axios from 'axios'
import UserRegister from './Auth/UserRegister';

function AdminDashboard() {
    const { API, token, role, company } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', firstName: '', lastName: '', role: 'Employee' });
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Only admins can access this
    if (role !== 'Admin') {
        return <div className="error">Access Denied: Admin only</div>;
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/api/users/company`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (e) {
            setError(`Failed to fetch users: ${e.response?.data}`);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateUser(e) {
        e.preventDefault();
        try {
            await axios.post(`${API}/api/users/create`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData({ username: '', password: '', firstName: '', lastName: '', role: 'Employee' });
            setShowForm(false);
            await fetchUsers();
            alert('User created successfully');
        } catch (e) {
            setError(`Failed to create user: ${e.response?.data}`);
        }
    }

    async function handleUpdateUser(id) {
        try {
            await axios.put(`${API}/api/users/${id}`, editData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingId(null);
            await fetchUsers();
            alert('User updated successfully');
        } catch (e) {
            setError(`Failed to update user: ${e.response?.data}`);
        }
    }

    async function handleDeleteUser(id) {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`${API}/api/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchUsers();
            alert('User deleted successfully');
        } catch (e) {
            setError(`Failed to delete user: ${e.response?.data}`);
        }
    }

    return (
        <div className="admin-dashboard">
            <h2>{company} User Management</h2>
            {error && <div className="error-banner">{error}</div>}

            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                {showForm ? 'Cancel' : 'Add New User'}
            </button>

            {showForm && (
                <UserRegister
                    notFirst={true}
                    companyName={company}
                />
            )}

            {loading ? (
                <p>Loading users...</p>
            ) : (
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Role</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>
                                    {editingId === user.id ? (
                                        <input
                                            value={editData.firstName || user.firstName}
                                            onChange={e => setEditData({ ...editData, firstName: e.target.value })}
                                        />
                                    ) : (
                                        user.firstName
                                    )}
                                </td>
                                <td>
                                    {editingId === user.id ? (
                                        <input
                                            value={editData.lastName || user.lastName}
                                            onChange={e => setEditData({ ...editData, lastName: e.target.value })}
                                        />
                                    ) : (
                                        user.lastName
                                    )}
                                </td>
                                <td>
                                    {editingId === user.id ? (
                                        <select
                                            value={editData.role || user.role}
                                            onChange={e => setEditData({ ...editData, role: e.target.value })}
                                        >
                                            <option value="Employee">Employee</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    ) : (
                                        user.role
                                    )}
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    {editingId === user.id ? (
                                        <>
                                            <button onClick={() => handleUpdateUser(user.id)} className="btn btn-success">Save</button>
                                            <button onClick={() => setEditingId(null)} className="btn btn-secondary">Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => { setEditingId(user.id); setEditData({}); }} className="btn btn-info">Edit</button>
                                            <button onClick={() => handleDeleteUser(user.id)} className="btn btn-danger">Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AdminDashboard;
