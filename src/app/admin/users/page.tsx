'use client';

import React, { useState, useEffect } from 'react';
// API calls are now routed through the internal /api proxy
import { UserRecord } from '@/lib/mockData';
import { 
  Plus,
  Users,
  Search, 
  Trash2, 
  Edit,
  CheckCircle,
  XCircle,
  Shield,
  UserPlus
} from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  // Form states for new user
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRecord['role']>('student');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.reverse()); // Newest first
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary stats
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalEducators = users.filter(u => u.role === 'educator').length;
  const totalStudents = users.filter(u => u.role === 'student').length;

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: '#3b82f6' },
    { label: 'Total Admin', value: totalAdmins, icon: Shield, color: '#ef4444' },
    { label: 'Total Educators', value: totalEducators, icon: CheckCircle, color: '#10b981' },
    { label: 'Total Students', value: totalStudents, icon: UserPlus, color: '#8b5cf6' },
  ];

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    return user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           user.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDelete = async (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.role === 'admin') {
      alert('Admin accounts cannot be deleted for security reasons.');
      return;
    }

    if (confirm('Are you sure you want to remove this user?')) {
      try {
        const response = await fetch(`/api/users/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const toggleStatus = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    const updatedUser = { ...user, status: user.status === 'active' ? 'inactive' : 'active' };

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleEdit = (user: UserRecord) => {
    setEditingUser(user);
    setNewName(user.name);
    setNewEmail(user.email);
    setNewRole(user.role);
    setShowModal(true);
  };

  const handleAddUser = async () => {
    if (!newName || !newEmail) {
      alert('Please fill in all required fields.');
      return;
    }

    if (editingUser) {
      // Update existing user
      const updatedUser = {
        ...editingUser,
        name: newName,
        email: newEmail,
        role: newRole,
      };

      try {
        const response = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser)
        });
        if (response.ok) {
          fetchUsers();
          setEditingUser(null);
          setNewName('');
          setNewEmail('');
          setNewRole('student');
          setShowModal(false);
        }
      } catch (error) {
        console.error('Error updating user:', error);
      }
    } else {
      // Create new user
      const newUser = {
        name: newName,
        email: newEmail,
        role: newRole,
        status: 'active',
        lastLogin: 'Never'
      };

      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
        if (response.ok) {
          fetchUsers();
          setNewName('');
          setNewEmail('');
          setNewRole('student');
          setShowModal(false);
        }
      } catch (error) {
        console.error('Error adding user:', error);
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>User Management</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Manage member accounts and their roles here.</p>
        </div>
        <button 
          onClick={() => { 
            setEditingUser(null);
            setNewName('');
            setNewEmail('');
            setNewRole('student');
            setShowModal(true); 
          }}
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      {/* Summary Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ 
                background: `${stat.color}15`, 
                color: stat.color, 
                padding: '1rem', 
                borderRadius: '1rem' 
              }}>
                <Icon size={28} />
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>{stat.label}</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--card-border)', display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input 
              placeholder="Filter by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--accent)', fontSize: '0.85rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem' }}>User</th>
                <th style={{ padding: '1rem 1.5rem' }}>Role</th>
                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem' }}>Last Login</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '0.95rem' }}>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--card-border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        background: user.role === 'admin' ? '#dbeafe' : user.role === 'educator' ? '#d1fae5' : '#ede9fe',
                        color: user.role === 'admin' ? '#1e40af' : user.role === 'educator' ? '#065f46' : '#5b21b6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600 }}>{user.name}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.8rem', 
                      fontWeight: 500,
                      background: 'var(--accent)',
                      textTransform: 'capitalize'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: user.status === 'active' ? 'var(--success)' : 'var(--muted)' 
                      }}></span>
                      <span style={{ fontSize: '0.9rem', color: user.status === 'active' ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                    {user.lastLogin}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button 
                        onClick={() => toggleStatus(user.id)}
                        style={{ padding: '0.4rem', borderRadius: '0.5rem', color: 'var(--muted-foreground)' }} title="Toggle Status">
                        {user.status === 'active' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      </button>
                      <button 
                        onClick={() => handleEdit(user)}
                        style={{ padding: '0.4rem', borderRadius: '0.5rem', color: 'var(--muted-foreground)' }} title="Edit User">
                        <Edit size={18} />
                      </button>
                      {user.role !== 'admin' && (
                        <button 
                          onClick={() => handleDelete(user.id)}
                          style={{ padding: '0.4rem', borderRadius: '0.5rem', color: 'var(--destructive)' }} title="Delete User">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Placeholder */}
      {showModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="card" style={{ width: '500px', animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingUser ? 'Edit User' : 'Add New User'}</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Full Name</label>
              <input 
                placeholder="Ex. Alexander Pierce" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Email Address</label>
              <input 
                type="email" 
                placeholder="alex@example.com" 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Assign Role</label>
              <select 
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRecord['role'])}
              >
                <option value="student">Student</option>
                <option value="educator">Educator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >Cancel</button>
              <button 
                onClick={handleAddUser}
                className="btn-primary"
              >{editingUser ? 'Update User' : 'Create User'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
