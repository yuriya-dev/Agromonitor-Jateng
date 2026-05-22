'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Search, Edit2, Trash2, Loader2, X, AlertCircle } from "lucide-react";

type UserRole = 'ADMIN' | 'EDITOR' | 'PETUGAS' | 'VIEWER';
type UserStatus = 'ACTIVE' | 'INACTIVE';

type UserItem = {
  id: string;
  fullId: string;
  name: string | null;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
};

type UserFormData = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  
  // Form State
  const initialForm: UserFormData = { name: '', email: '', password: '', role: 'VIEWER', status: 'ACTIVE' };
  const [formData, setFormData] = useState<UserFormData>(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5001/api/admin/users?search=${search}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data as UserItem[]);
      }
    } catch {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showMessage = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 5000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:5001/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        showMessage('Pengguna berhasil ditambahkan!');
        setIsAddModalOpen(false);
        setFormData(initialForm);
        fetchUsers();
      } else {
        setErrorMsg(json.message || 'Gagal menambahkan pengguna');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan server');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setErrorMsg('Pengguna belum dipilih');
      return;
    }
    setFormLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`http://localhost:5001/api/admin/users/${selectedUser.fullId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        showMessage('Pengguna berhasil diperbarui!');
        setIsEditModalOpen(false);
        fetchUsers();
      } else {
        setErrorMsg(json.message || 'Gagal memperbarui pengguna');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan server');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) {
      showMessage('Pengguna belum dipilih', true);
      return;
    }
    setFormLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`http://localhost:5001/api/admin/users/${selectedUser.fullId}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        showMessage('Pengguna berhasil dihapus!');
        setIsDeleteModalOpen(false);
        fetchUsers();
      } else {
        showMessage(json.message || 'Gagal menghapus pengguna', true);
        setIsDeleteModalOpen(false);
      }
    } catch {
      showMessage('Terjadi kesalahan server', true);
      setIsDeleteModalOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (user: UserItem) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // Leave empty unless changing
      role: user.role || 'VIEWER',
      status: user.status || 'ACTIVE'
    });
    setErrorMsg('');
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: UserItem) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold uppercase tracking-tight text-xl">Manajemen Pengguna & Akses</h3>
          <p className="text-sm font-mono text-accent-grey">Atur role dan hak akses pengguna sistem.</p>
        </div>
        <button 
          onClick={() => { setFormData(initialForm); setErrorMsg(''); setIsAddModalOpen(true); }}
          className="bg-foreground text-background font-mono font-bold uppercase px-4 py-3 flex items-center hover:bg-accent-red transition-colors shadow-brutal active:translate-y-1 active:shadow-none"
        >
          <UserPlus size={18} className="mr-2" />
          Tambah Pengguna Baru
        </button>
      </div>

      {errorMsg && !isAddModalOpen && !isEditModalOpen && (
        <div className="bg-red-100 border-2 border-accent-red text-accent-red p-4 mb-4 font-mono font-bold flex items-center shadow-brutal">
          <AlertCircle size={20} className="mr-2" /> {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-100 border-2 border-accent-green text-accent-green p-4 mb-4 font-mono font-bold flex items-center shadow-brutal">
          {successMsg}
        </div>
      )}

      {/* Main Table Content */}
      <div className="bg-white border-2 border-border-color shadow-brutal mb-8">
        <div className="p-4 border-b-2 border-border-color flex justify-between items-center bg-surface">
          <div className="flex border-2 border-border-color bg-white px-3 py-2 items-center w-72">
            <Search size={16} className="text-accent-grey mr-2" />
            <input 
              type="text" 
              placeholder="CARI NAMA / ROLE" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none text-sm font-mono w-full uppercase placeholder-accent-grey" 
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px] relative">
          {loading && (
             <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
               <Loader2 className="animate-spin text-foreground" size={32} />
             </div>
          )}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface font-mono text-xs uppercase text-accent-grey border-b-2 border-border-color">
                <th className="p-4 font-bold">ID User</th>
                <th className="p-4 font-bold">Nama Pengguna</th>
                <th className="p-4 font-bold">Role Akses</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Login Terakhir</th>
                <th className="p-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {users.length === 0 && !loading ? (
                 <tr>
                   <td colSpan={6} className="p-8 text-center text-accent-grey">Tidak ada pengguna yang ditemukan.</td>
                 </tr>
              ) : (
                users.map((user, idx) => (
                  <tr 
                    key={user.id} 
                    className={`border-b border-border-color group hover:bg-surface transition-colors relative ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                    }`}
                  >
                    <td className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-foreground transition-colors"></td>
                    
                    <td className="p-4 font-bold">{user.id}</td>
                    <td className="p-4 font-bold">{user.name}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 text-xs font-bold border ${
                        user.role === "ADMIN" ? "bg-red-100 border-accent-red text-accent-red" :
                        user.role === "EDITOR" ? "bg-green-100 border-accent-green text-accent-green" :
                        user.role === "PETUGAS" ? "bg-blue-100 border-blue-600 text-blue-700" :
                        "bg-gray-100 border-foreground text-foreground"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center text-xs font-bold ${user.status === "ACTIVE" ? "text-accent-green" : "text-accent-grey"}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${user.status === "ACTIVE" ? "bg-accent-green" : "bg-accent-grey"}`}></div>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-accent-grey">{user.lastLogin}</td>
                    <td className="p-4 text-right flex justify-end space-x-2">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="p-2 border-2 border-border-color hover:border-foreground hover:bg-foreground hover:text-white transition-colors" title="Edit Pengguna">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(user)}
                        className="p-2 border-2 border-border-color hover:border-accent-red hover:bg-accent-red hover:text-white transition-colors text-accent-red" title="Hapus Pengguna">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-foreground shadow-brutal max-w-md w-full relative">
            <div className="bg-foreground text-white p-4 flex justify-between items-center">
              <h3 className="font-bold font-mono uppercase">Tambah Pengguna</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="hover:text-accent-red transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6">
              {errorMsg && (
                <div className="bg-red-100 border-2 border-accent-red text-accent-red p-3 mb-4 text-sm font-mono font-bold">
                  {errorMsg}
                </div>
              )}
              <div className="space-y-4 font-mono">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Nama Lengkap</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full border-2 border-border-color p-2 outline-none focus:border-foreground" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Email</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full border-2 border-border-color p-2 outline-none focus:border-foreground" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Password</label>
                  <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full border-2 border-border-color p-2 outline-none focus:border-foreground" />
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase mb-1">Role</label>
                    <select name="role" value={formData.role} onChange={handleInputChange} className="w-full border-2 border-border-color p-2 outline-none focus:border-foreground">
                      <option value="ADMIN">ADMIN</option>
                      <option value="EDITOR">EDITOR</option>
                      <option value="PETUGAS">PETUGAS</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border-2 border-border-color p-2 outline-none focus:border-foreground">
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border-2 border-border-color font-mono font-bold hover:bg-surface">BATAL</button>
                <button type="submit" disabled={formLoading} className="px-4 py-2 border-2 border-foreground bg-foreground text-white font-mono font-bold hover:bg-accent-red hover:border-accent-red flex items-center">
                  {formLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : 'SIMPAN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-foreground shadow-brutal max-w-md w-full relative">
            <div className="bg-foreground text-white p-4 flex justify-between items-center">
              <h3 className="font-bold font-mono uppercase">Edit Pengguna</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="hover:text-accent-red transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="p-6">
              {errorMsg && (
                <div className="bg-red-100 border-2 border-accent-red text-accent-red p-3 mb-4 text-sm font-mono font-bold">
                  {errorMsg}
                </div>
              )}
              <div className="space-y-4 font-mono">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Nama Lengkap</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full border-2 border-border-color p-2 outline-none focus:border-foreground" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Email</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full border-2 border-border-color p-2 outline-none focus:border-foreground" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Password Baru (Opsional)</label>
                  <input type="password" name="password" placeholder="Kosongkan jika tidak diubah" value={formData.password} onChange={handleInputChange} className="w-full border-2 border-border-color p-2 outline-none focus:border-foreground" />
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase mb-1">Role</label>
                    <select name="role" value={formData.role} onChange={handleInputChange} className="w-full border-2 border-border-color p-2 outline-none focus:border-foreground">
                      <option value="ADMIN">ADMIN</option>
                      <option value="EDITOR">EDITOR</option>
                      <option value="PETUGAS">PETUGAS</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border-2 border-border-color p-2 outline-none focus:border-foreground">
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border-2 border-border-color font-mono font-bold hover:bg-surface">BATAL</button>
                <button type="submit" disabled={formLoading} className="px-4 py-2 border-2 border-foreground bg-foreground text-white font-mono font-bold hover:bg-accent-red hover:border-accent-red flex items-center">
                  {formLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : 'UPDATE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-accent-red shadow-brutal max-w-sm w-full relative">
            <div className="bg-accent-red text-white p-4 flex justify-between items-center">
              <h3 className="font-bold font-mono uppercase flex items-center">
                <AlertCircle size={18} className="mr-2" /> Hapus Pengguna
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="hover:text-black transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 font-mono text-center">
              <p className="mb-4">Apakah Anda yakin ingin menghapus pengguna <span className="font-bold">{selectedUser?.name}</span>?</p>
              <p className="text-xs text-accent-grey">Tindakan ini tidak dapat dibatalkan.</p>
              <div className="mt-6 flex justify-center space-x-4">
                <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 border-2 border-border-color font-bold hover:bg-surface">BATAL</button>
                <button type="button" onClick={handleDeleteUser} disabled={formLoading} className="px-4 py-2 border-2 border-accent-red bg-accent-red text-white font-bold hover:bg-red-600 flex items-center">
                  {formLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : 'HAPUS'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
