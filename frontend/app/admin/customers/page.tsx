"use client";
import React, { useState, useEffect } from 'react';

export default function CustomersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    
    // Modal states
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Form states for Editing
    const [editData, setEditData] = useState({
        full_name: '',
        email: '',
        role: '',
        isActive: true
    });

    const fetchUsers = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('admin_token');
        try {
            const res = await fetch("http://localhost:8000/auth/users", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openEditModal = (user: any) => {
        setSelectedUser(user);
        setEditData({
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            isActive: user.isActive
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (user: any) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const openViewModal = (user: any) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const closeModals = () => {
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsViewModalOpen(false);
        setTimeout(() => setSelectedUser(null), 200);
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        const token = localStorage.getItem('admin_token');
        try {
            const res = await fetch(`http://localhost:8000/auth/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editData)
            });
            if (res.ok) {
                alert("User updated successfully");
                fetchUsers();
                closeModals();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to update user");
            }
        } catch (error) {
            alert("Error updating user");
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        const token = localStorage.getItem('admin_token');
        try {
            const res = await fetch(`http://localhost:8000/auth/users/${selectedUser.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("User deleted successfully");
                fetchUsers();
                closeModals();
            } else {
                alert("Failed to delete user");
            }
        } catch (error) {
            alert("Error deleting user");
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.full_name.toLowerCase().includes(search.toLowerCase()) || 
                             user.email.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' || 
                             (statusFilter === 'Active' && user.isActive) ||
                             (statusFilter === 'Inactive' && !user.isActive) ||
                             (statusFilter === 'Suspended' && user.status === 'Suspended') ||
                             (statusFilter === 'Banned' && user.status === 'Banned');
        return matchesSearch && matchesStatus;
    });

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[600px]">
            {/* Toolbar */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4 bg-white">
                <div className="relative w-full max-w-md">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input 
                        type="text" 
                        placeholder="Search by name or email" 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-gray-200 focus:bg-white transition-colors"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative shrink-0">
                    <select 
                        className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:border-gray-300 cursor-pointer shadow-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                        <option>Suspended</option>
                        <option>Banned</option>
                    </select>
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="p-20 text-center text-gray-500">Loading users...</div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#FCFCFD] border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            <th className="py-4 px-6 font-bold">Name</th>
                            <th className="py-4 px-6 font-bold">Email</th>
                            <th className="py-4 px-6 font-bold">Role</th>
                            <th className="py-4 px-6 font-bold">Status</th>
                            <th className="py-4 px-6 font-bold text-right shrink-0">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold bg-blue-100 text-blue-600`}>
                                            {getInitials(user.full_name)}
                                        </div>
                                        <span className="font-semibold text-gray-900">{user.full_name}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-gray-600 font-medium">
                                    {user.email}
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                            (user.isActive && !user.status) || user.status === 'Active' ? 'bg-[#10B981]' : 
                                            user.status === 'Suspended' ? 'bg-orange-400' :
                                            user.status === 'Banned' ? 'bg-red-500' :
                                            'bg-gray-300'
                                        }`}></div>
                                        <span className={`font-semibold ${
                                            (user.isActive && !user.status) || user.status === 'Active' ? 'text-gray-900' : 
                                            user.status === 'Suspended' ? 'text-orange-600' :
                                            user.status === 'Banned' ? 'text-red-600' :
                                            'text-gray-500'
                                        }`}>{user.status || (user.isActive ? 'Active' : 'Inactive')}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openViewModal(user)} className="text-gray-400 hover:text-blue-600 transition-colors p-1" title="View">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        </button>
                                        <button onClick={() => openEditModal(user)} className="text-gray-400 hover:text-gray-900 transition-colors p-1" title="Edit">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                        {user.role !== 'admin' && (
                                            <button onClick={() => openDeleteModal(user)} className="text-gray-400 hover:text-red-600 transition-colors p-1" title="Delete">
                                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Pagination Placeholder */}
            {!isLoading && (
                <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-white text-sm">
                    <span className="text-gray-500 font-medium">Total <strong className="text-gray-900 font-semibold">{filteredUsers.length}</strong> users found</span>
                </div>
            )}

            {/* Overlays for Modals */}
            {(isEditModalOpen || isDeleteModalOpen || isViewModalOpen) && (
                <div className="fixed inset-0 z-40 bg-[#0F172AC4] backdrop-blur-[2px] transition-opacity" onClick={closeModals}></div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[480px] bg-white rounded-2xl shadow-2xl p-7">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Edit User</h3>
                        <button onClick={closeModals} className="text-gray-400 hover:text-gray-800 transition-colors p-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <p className="text-[13px] font-medium text-gray-500 mb-6">Update user profile and access levels</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Full Name</label>
                            <input 
                                type="text" 
                                value={editData.full_name} 
                                disabled
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed font-medium outline-none shadow-sm" 
                            />
                        </div>
                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Email Address</label>
                            <input 
                                type="email" 
                                value={editData.email} 
                                disabled
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed font-medium outline-none shadow-sm" 
                            />
                        </div>
                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">User Role</label>
                            <div className="relative">
                                <select 
                                    value={editData.role} 
                                    disabled
                                    className="w-full appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 font-medium cursor-not-allowed outline-none shadow-sm"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">User Status</label>
                            <div className="relative">
                                <select 
                                    value={editData.isActive ? 'true' : 'false'} 
                                    onChange={(e) => setEditData({...editData, isActive: e.target.value === 'true'})}
                                    className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none shadow-sm"
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between gap-3 overflow-hidden">
                        <button onClick={closeModals} className="flex-1 py-2.5 text-sm font-semibold border text-gray-700 border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm">Cancel</button>
                        <button onClick={handleUpdateUser} className="flex-1 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                            Save Changes
                        </button>
                    </div>
                </div>
            )}

            {/* View User Modal */}
            {isViewModalOpen && selectedUser && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[460px] bg-white rounded-2xl shadow-2xl p-7 pt-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                        </div>
                        <button onClick={closeModals} className="text-gray-400 hover:text-gray-800 transition-colors p-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-3 text-gray-400 outline outline-[3px] outline-white shadow-sm ring-1 ring-gray-100">
                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                        </div>
                        <h4 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5">{selectedUser.full_name}</h4>
                        <span className="text-sm font-semibold text-blue-600 px-3 py-1 bg-blue-50 rounded-full uppercase">{selectedUser.role}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-[#FAFBFD] p-3 rounded-xl border border-gray-100">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                            <p className="text-sm font-semibold text-gray-900">{selectedUser.full_name}</p>
                        </div>
                        <div className="bg-[#FAFBFD] p-3 rounded-xl border border-gray-100">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                            <p className="text-sm font-bold text-gray-900 truncate" title={selectedUser.email}>{selectedUser.email}</p>
                        </div>
                        <div className="bg-[#FAFBFD] p-3 rounded-xl border border-gray-100">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Role</label>
                            <p className="text-sm font-semibold text-gray-900 uppercase">{selectedUser.role}</p>
                        </div>
                        <div className="bg-[#FAFBFD] p-3 rounded-xl border border-gray-100">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Account Status</label>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${selectedUser.isActive ? 'bg-emerald-500' : 'bg-red-400'}`}></div>
                                <p className="text-[13px] font-bold text-gray-900 leading-tight">
                                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end items-center gap-4">
                        <button onClick={() => { setIsViewModalOpen(false); setTimeout(() => openEditModal(selectedUser), 200); }} className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">Edit Profile</button>
                        <button onClick={closeModals} className="py-2.5 px-6 shrink-0 text-sm font-bold bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow flex items-center justify-center">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Delete User Modal */}
            {isDeleteModalOpen && selectedUser && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-7 text-center">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-[6px] border-red-50/50">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User</h3>
                    <p className="text-[13px] text-gray-600 font-medium mb-6 leading-relaxed">
                        Are you sure you want to delete <strong className="text-gray-900 font-bold">{selectedUser.full_name}</strong>? This action cannot be undone and they will lose all access immediately.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={closeModals} className="flex-1 py-2.5 text-sm font-bold border text-gray-700 border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm">Cancel</button>
                        <button onClick={handleDeleteUser} className="flex-1 py-2.5 text-sm font-bold bg-[#DC2626] text-white rounded-lg hover:bg-red-700 transition-colors shadow">Delete User</button>
                    </div>
                </div>
            )}
        </div>
    );
}
