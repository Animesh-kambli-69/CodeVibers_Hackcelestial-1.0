import { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import { Users, Wrench, Plus, X } from 'lucide-react';
import { apiRequest } from '../lib/api';

export default function ManagerSettings() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <AppShell role="RESORT_MANAGER" title="System Settings">
      <div style={{ display: 'flex', gap: 24, minHeight: '80vh' }}>
        {/* Settings Sidebar */}
        <div style={{ width: 250, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
              border: 'none', borderRadius: 8, cursor: 'pointer',
              background: activeTab === 'users' ? '#167A65' : 'transparent',
              color: activeTab === 'users' ? 'white' : '#66716C',
              fontWeight: activeTab === 'users' ? 600 : 500,
              textAlign: 'left', transition: 'all 0.2s ease'
            }}
          >
            <Users size={18} />
            User Management
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            style={{
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
              border: 'none', borderRadius: 8, cursor: 'pointer',
              background: activeTab === 'maintenance' ? '#167A65' : 'transparent',
              color: activeTab === 'maintenance' ? 'white' : '#66716C',
              fontWeight: activeTab === 'maintenance' ? 600 : 500,
              textAlign: 'left', transition: 'all 0.2s ease'
            }}
          >
            <Wrench size={18} />
            Device Maintenance & Logs
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1 }}>
          {activeTab === 'users' && <UserManagementPanel />}
          {activeTab === 'maintenance' && <MaintenanceComingSoon />}
        </div>
      </div>
    </AppShell>
  );
}

function UserManagementPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [generatedCred, setGeneratedCred] = useState(null); // { email, password } shown once

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/manager/users');
      setUsers(res.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load operations managers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!newName.trim() || !newEmail.trim()) {
      setCreateError('Name and email/username are required.');
      return;
    }
    setCreating(true);
    try {
      const res = await apiRequest('/manager/users', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim(), email: newEmail.trim() }),
      });
      setGeneratedCred({ email: res.data.user.email, password: res.data.generatedPassword });
      setNewName('');
      setNewEmail('');
      setShowAddForm(false);
      fetchUsers();
    } catch (err) {
      setCreateError(err.message || 'Failed to create account.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await apiRequest(`/manager/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update account status.');
    }
  };

  return (
    <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E5EAE7', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5EAE7' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#17201C' }}>Manage Operational Managers</h2>
            <p style={{ margin: 0, fontSize: 14, color: '#66716C', marginTop: 4 }}>
              Create and manage system access for Operations Managers.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#167A65', color: 'white', border: 'none',
              padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Add Manager
          </button>
        </div>
      </div>

      {generatedCred && (
        <div style={{ margin: '16px 24px 0', background: '#F0F7F4', border: '1px solid #167A65', borderRadius: 8, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 13.5, color: '#17201C' }}>
            Account created. <strong>Share these credentials now</strong> — the password cannot be recovered afterward.<br />
            Login: <code>{generatedCred.email}</code> &nbsp; Password: <code>{generatedCred.password}</code>
          </div>
          <button onClick={() => setGeneratedCred(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#66716C' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleCreate} style={{ margin: '16px 24px 0', padding: 16, background: '#F7F8F6', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#66716C', marginBottom: 4 }}>Name</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name"
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: '1px solid #E5EAE7', borderRadius: 6, fontSize: 13.5 }} />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#66716C', marginBottom: 4 }}>Email / Username</label>
            <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="e.g. sarah.ops"
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: '1px solid #E5EAE7', borderRadius: 6, fontSize: 13.5 }} />
          </div>
          <button type="submit" disabled={creating} style={{ padding: '9px 18px', background: '#167A65', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: creating ? 'not-allowed' : 'pointer' }}>
            {creating ? 'Creating…' : 'Create'}
          </button>
          {createError && <div style={{ width: '100%', color: '#C95C5C', fontSize: 12.5 }}>{createError}</div>}
        </form>
      )}

      <div style={{ padding: 24 }}>
        {error ? (
          <div style={{ color: '#C95C5C', fontSize: 13.5 }}>{error}</div>
        ) : loading ? (
          <div style={{ color: '#66716C', fontSize: 13.5 }}>Loading…</div>
        ) : users.length === 0 ? (
          <div style={{ color: '#66716C', fontSize: 13.5 }}>No Operations Manager accounts yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5EAE7', textAlign: 'left', color: '#66716C' }}>
                <th style={{ padding: '12px 0', fontWeight: 600, fontSize: 13 }}>Name</th>
                <th style={{ padding: '12px 0', fontWeight: 600, fontSize: 13 }}>Email</th>
                <th style={{ padding: '12px 0', fontWeight: 600, fontSize: 13 }}>Status</th>
                <th style={{ padding: '12px 0', fontWeight: 600, fontSize: 13, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #F0F7F4' }}>
                  <td style={{ padding: '16px 0', fontWeight: 500 }}>{u.name || '—'}</td>
                  <td style={{ padding: '16px 0', color: '#66716C' }}>{u.email}</td>
                  <td style={{ padding: '16px 0' }}>
                    <span style={{
                      background: u.isActive ? '#DDEBE5' : '#FEF2F2',
                      color: u.isActive ? '#167A65' : '#C95C5C',
                      padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600
                    }}>
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 0', textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleActive(u)}
                      style={{ background: 'none', border: 'none', color: u.isActive ? '#C95C5C' : '#167A65', cursor: 'pointer', fontWeight: 500, fontSize: 13.5 }}
                    >
                      {u.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function MaintenanceComingSoon() {
  return (
    <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E5EAE7', padding: 40, textAlign: 'center' }}>
      <Wrench size={28} color="#66716C" style={{ marginBottom: 12 }} />
      <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#17201C' }}>Device Maintenance & Logs</h3>
      <p style={{ margin: 0, fontSize: 13.5, color: '#66716C', maxWidth: 420, marginInline: 'auto' }}>
        Coming soon — no IoT device data is connected yet. Room housekeeping/maintenance
        status is tracked separately under Operations.
      </p>
    </div>
  );
}
