'use client';

import React, { useState, useEffect } from 'react';
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
  UserPlus,
  LayoutGrid,
  List,
  Mail,
  Calendar,
  Filter
} from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'educator' | 'student'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  // Form states for user modal
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRecord['role']>('student');
  const [newStatus, setNewStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/users');
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
    { label: 'Total Users', value: totalUsers, icon: Users, color: '#3b82f6', filterKey: 'all' as const },
    { label: 'Total Admin', value: totalAdmins, icon: Shield, color: '#ef4444', filterKey: 'admin' as const },
    { label: 'Total Educators', value: totalEducators, icon: CheckCircle, color: '#10b981', filterKey: 'educator' as const },
    { label: 'Total Students', value: totalStudents, icon: UserPlus, color: '#8b5cf6', filterKey: 'student' as const },
  ];

  // Filter users based on search & role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const displayedUsers = showAllUsers ? filteredUsers : filteredUsers.slice(0, 3);

  const handleDelete = async (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.role === 'admin') {
      alert('Admin accounts cannot be deleted for security reasons.');
      return;
    }

    if (confirm('Are you sure you want to remove this user?')) {
      try {
        const response = await fetch(`http://localhost:3001/users/${id}`, {
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

    if (user.role === 'admin') {
      alert('Admin accounts cannot be set to inactive.');
      return;
    }

    const updatedUser = { ...user, status: user.status === 'active' ? 'inactive' : 'active' };

    try {
      const response = await fetch(`http://localhost:3001/users/${id}`, {
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
    setNewStatus(user.status);
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
        status: newStatus
      };

      try {
        const response = await fetch(`http://localhost:3001/users/${editingUser.id}`, {
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
          setNewStatus('active');
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
        status: newStatus,
        lastLogin: 'Never'
      };

      try {
        const response = await fetch('http://localhost:3001/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
        if (response.ok) {
          fetchUsers();
          setNewName('');
          setNewEmail('');
          setNewRole('student');
          setNewStatus('active');
          setShowModal(false);
        }
      } catch (error) {
        console.error('Error adding user:', error);
      }
    }
  };

  const getRoleBadgeClass = (role: UserRecord['role']) => {
    switch (role) {
      case 'admin': return 'role-badge role-badge-admin';
      case 'educator': return 'role-badge role-badge-educator';
      case 'student': default: return 'role-badge role-badge-student';
    }
  };

  return (
    <div className="animate-premium">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ padding: '0.25rem 0.6rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--admin-primary)', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              ADMIN DASHBOARD
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>User Management</h1>
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
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.55rem 1.1rem',
            fontSize: '0.85rem',
            background: 'var(--admin-primary)',
            boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)'
          }}
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Summary Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isSelected = roleFilter === stat.filterKey;
          return (
            <div 
              key={stat.label} 
              onClick={() => setRoleFilter(stat.filterKey)}
              className="premium-card stat-hover-card" 
              style={{ 
                padding: '0.85rem 1rem',
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                border: isSelected ? `2px solid ${stat.color}` : '1px solid var(--card-border)',
                background: isSelected ? `${stat.color}08` : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div 
                style={{ 
                  background: `${stat.color}15`, 
                  color: stat.color, 
                  padding: '0.65rem', 
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon size={20} />
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginBottom: '0.1rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.label}</p>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.2 }}>{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unified Table Container (matching assessment report table format) */}
      <div className="premium-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.15rem' }}>Active Accounts</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Manage member accounts, roles, and status with real-time updates.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Showing {displayedUsers.length} of {filteredUsers.length}</span>
            <button
              onClick={() => setShowAllUsers(!showAllUsers)}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', color: 'var(--admin-primary)', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}
            >
              {showAllUsers ? 'Minimize' : 'See All'}
            </button>
          </div>
        </div>

        {/* Embedded Controls Bar (Search + Role Filter + View Switcher) */}
        <div style={{ padding: '0.65rem 1.25rem', background: '#f8fafc', display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.75rem',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                background: 'white',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* View Mode Switcher */}
            <div style={{ display: 'flex', background: 'white', padding: '0.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <button
                onClick={() => setViewMode('table')}
                title="Table View"
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: '0.5rem',
                  background: viewMode === 'table' ? '#f1f5f9' : 'transparent',
                  color: viewMode === 'table' ? 'var(--admin-primary)' : 'var(--muted-foreground)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid Card View"
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: '0.5rem',
                  background: viewMode === 'grid' ? '#f1f5f9' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--admin-primary)' : 'var(--muted-foreground)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* User Content */}
        <div style={{ padding: '0 1.5rem 1.5rem', overflowX: 'auto' }}>
          {viewMode === 'table' ? (
            loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No users matching criteria.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0 0.75rem' }}>User</th>
                    <th style={{ padding: '0 0.75rem' }}>Role</th>
                    <th style={{ padding: '0 0.75rem' }}>Status</th>
                    <th style={{ padding: '0 0.75rem' }}>Last Login</th>
                    <th style={{ padding: '0 0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className="report-row-premium"
                      style={{ background: '#f8fafc', borderRadius: '0.75rem', transition: 'all 0.2s' }}
                    >
                      <td style={{ padding: '1rem 0.75rem', borderRadius: '0.75rem 0 0 0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div 
                            style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '50%', 
                              background: user.role === 'admin' ? '#dbeafe' : user.role === 'educator' ? '#d1fae5' : '#ede9fe',
                              color: user.role === 'admin' ? '#1e40af' : user.role === 'educator' ? '#065f46' : '#5b21b6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              flexShrink: 0
                            }}
                          >
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{user.name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', margin: 0 }}>
                              <Mail size={12} style={{ opacity: 0.7 }} /> {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <span className={getRoleBadgeClass(user.role)}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            background: user.status === 'active' ? 'var(--success)' : 'var(--muted)',
                            boxShadow: user.status === 'active' ? '0 0 6px rgba(16, 185, 129, 0.4)' : 'none'
                          }}></span>
                          <span style={{ 
                            fontSize: '0.85rem', 
                            fontWeight: 600,
                            color: user.status === 'active' ? 'var(--foreground)' : 'var(--muted-foreground)',
                            textTransform: 'capitalize' 
                          }}>
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', color: 'var(--muted-foreground)', fontSize: '0.82rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={13} style={{ opacity: 0.6 }} />
                          {user.lastLogin}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', borderRadius: '0 0.75rem 0.75rem 0', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {user.role !== 'admin' && (
                            <button 
                              onClick={() => toggleStatus(user.id)}
                              className="user-action-btn toggle"
                              title={`Toggle Status (Currently ${user.status})`}
                            >
                              {user.status === 'active' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            </button>
                          )}
                          <button 
                            onClick={() => handleEdit(user)}
                            className="user-action-btn edit"
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>
                          {user.role !== 'admin' && (
                            <button 
                              onClick={() => handleDelete(user.id)}
                              className="user-action-btn delete"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            /* User Content: Grid Card View */
            <div style={{ padding: '1rem 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {loading ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>No users matching criteria.</div>
              ) : (
                displayedUsers.map((user) => (
                  <div key={user.id} className="user-card-item" style={{ padding: '1.1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div 
                        style={{ 
                          width: '42px', 
                          height: '42px', 
                          borderRadius: '50%', 
                          background: user.role === 'admin' ? '#dbeafe' : user.role === 'educator' ? '#d1fae5' : '#ede9fe',
                          color: user.role === 'admin' ? '#1e40af' : user.role === 'educator' ? '#065f46' : '#5b21b6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem'
                        }}
                      >
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className={getRoleBadgeClass(user.role)}>
                        {user.role}
                      </span>
                    </div>

                    <h3 className="user-name" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.2rem' }}>{user.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Mail size={13} style={{ opacity: 0.7 }} /> {user.email}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ 
                          width: '7px', 
                          height: '7px', 
                          borderRadius: '50%', 
                          background: user.status === 'active' ? 'var(--success)' : 'var(--muted)',
                          boxShadow: user.status === 'active' ? '0 0 6px rgba(16, 185, 129, 0.4)' : 'none'
                        }}></span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: user.status === 'active' ? 'var(--foreground)' : 'var(--muted-foreground)', textTransform: 'capitalize' }}>
                          {user.status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        {user.role !== 'admin' && (
                          <button 
                            onClick={() => toggleStatus(user.id)}
                            className="user-action-btn toggle"
                            title="Toggle Status"
                          >
                            {user.status === 'active' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          </button>
                        )}
                        <button 
                          onClick={() => handleEdit(user)}
                          className="user-action-btn edit"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        {user.role !== 'admin' && (
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="user-action-btn delete"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>


      {/* Add / Edit User Modal */}
      {showModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', animation: 'fadeInSlide 0.3s ease' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.35rem' }}>{editingUser ? 'Edit User' : 'Add New User'}</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 500, marginBottom: '0.4rem' }}>Full Name</label>
              <input 
                placeholder="Ex. Alexander Pierce" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 500, marginBottom: '0.4rem' }}>Email Address</label>
              <input 
                type="email" 
                placeholder="alex@example.com" 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 500, marginBottom: '0.4rem' }}>Assign Role</label>
              <select 
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRecord['role'])}
              >
                <option value="student">Student</option>
                <option value="educator">Educator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {editingUser?.role !== 'admin' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 500, marginBottom: '0.4rem' }}>Account Status</label>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as 'active' | 'inactive')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}
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
      <style jsx>{`
        .report-row-premium:hover {
          background-color: #f8fafc;
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}
