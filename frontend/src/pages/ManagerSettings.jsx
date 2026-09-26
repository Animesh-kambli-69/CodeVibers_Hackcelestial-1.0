import { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import { Users, Wrench, Plus, X, Lock, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../lib/api';

export default function ManagerSettings() {
  const [activeTab, setActiveTab] = useState('users');
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [newPassword, setNewPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/manager/users/operations');
      setUsers(res.users || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setNewPassword('');
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setUpdateError('Password must be at least 6 characters');
      return;
    }
    
    setUpdating(true);
    setUpdateError(null);
    try {
      await apiRequest(`/manager/users/${editingUser.id}/password`, {
        method: 'PUT',
        body: JSON.stringify({ newPassword })
      });
      setUpdateSuccess(true);
      setTimeout(() => {
        setEditingUser(null);
      }, 2000);
    } catch (err) {
      setUpdateError(err.message || 'Failed to update password');
    } finally {
      setUpdating(false);
    }
  };

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
          {activeTab === 'users' && (
            <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E5EAE7', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5EAE7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#17201C' }}>Manage Operational Managers</h2>
                    <p style={{ margin: 0, fontSize: 14, color: '#66716C', marginTop: 4 }}>
                      Create and manage system access for Operations Managers.
                    </p>
                  </div>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: '#167A65', color: 'white', border: 'none',
                    padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', opacity: 0.5
                  }} disabled>
                    <Plus size={16} /> Add Manager
                  </button>
                </div>
              </div>
              <div style={{ padding: 24 }}>
                {loading ? (
                  <p style={{ color: '#66716C' }}>Loading users...</p>
                ) : users.length === 0 ? (
                  <p style={{ color: '#66716C' }}>No operations managers found.</p>
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
                      {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #F0F7F4' }}>
                          <td style={{ padding: '16px 0', fontWeight: 500, textTransform: 'capitalize' }}>{u.name}</td>
                          <td style={{ padding: '16px 0', color: '#66716C' }}>{u.email}</td>
                          <td style={{ padding: '16px 0' }}>
                            <span style={{ background: '#DDEBE5', color: '#167A65', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>Active</span>
                          </td>
                          <td style={{ padding: '16px 0', textAlign: 'right' }}>
                            <button 
                              onClick={() => handleEditClick(u)}
                              style={{ background: 'none', border: 'none', color: '#167A65', cursor: 'pointer', fontWeight: 500 }}
                            >
                              Edit Password
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E5EAE7', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5EAE7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#17201C' }}>IoT Device Logs & Failure Prediction</h2>
                    <p style={{ margin: 0, fontSize: 14, color: '#66716C', marginTop: 4 }}>
                      Monitor smart thermostats, locks, and sensors across the resort.
                    </p>
                  </div>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'white', color: '#167A65', border: '1px solid #167A65',
                    padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer'
                  }}>
                    Export Logs
                  </button>
                </div>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                  <div style={{ background: '#F0F7F4', padding: 16, borderRadius: 8, border: '1px solid #DDEBE5' }}>
                    <div style={{ fontSize: 12, color: '#66716C', fontWeight: 600, textTransform: 'uppercase' }}>Healthy Devices</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#167A65', marginTop: 8 }}>412</div>
                  </div>
                  <div style={{ background: '#FEF2F2', padding: 16, borderRadius: 8, border: '1px solid #FEE2E2' }}>
                    <div style={{ fontSize: 12, color: '#C95C5C', fontWeight: 600, textTransform: 'uppercase' }}>Predicted Failures</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#C95C5C', marginTop: 8 }}>3</div>
                  </div>
                  <div style={{ background: '#FFFBEB', padding: 16, borderRadius: 8, border: '1px solid #FEF3C7' }}>
                    <div style={{ fontSize: 12, color: '#B45309', fontWeight: 600, textTransform: 'uppercase' }}>Maintenance Required</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#B45309', marginTop: 8 }}>8</div>
                  </div>
                </div>

                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Critical Alerts</h3>
                <div style={{ border: '1px solid #E5EAE7', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', padding: 16, borderBottom: '1px solid #E5EAE7', background: '#FEF2F2' }}>
                    <Wrench size={20} color="#C95C5C" style={{ marginRight: 12, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#17201C' }}>HVAC Unit - Room 402</div>
                      <div style={{ fontSize: 13, color: '#66716C', marginTop: 4 }}>Anomaly detected in power consumption. 87% probability of compressor failure within 48 hours.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', padding: 16, borderBottom: '1px solid #E5EAE7', background: '#FFFBEB' }}>
                    <Wrench size={20} color="#B45309" style={{ marginRight: 12, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#17201C' }}>Smart Lock - Room 105</div>
                      <div style={{ fontSize: 13, color: '#66716C', marginTop: 4 }}>Battery level critical (4%). Requires immediate replacement before next guest check-in.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', padding: 16 }}>
                    <Wrench size={20} color="#66716C" style={{ marginRight: 12, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#17201C' }}>Pool Temperature Sensor</div>
                      <div style={{ fontSize: 13, color: '#66716C', marginTop: 4 }}>Offline for 12 hours. Last known status: Normal.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Password Modal */}
      {editingUser && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(23, 32, 28, 0.6)' }} onClick={() => setEditingUser(null)} />
          <div style={{ position: 'relative', background: '#FFF', borderRadius: 12, padding: 32, width: '100%', maxWidth: 400 }}>
            <button onClick={() => setEditingUser(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#66716C' }}>
              <X size={20} />
            </button>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#17201C', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={20} color="#167A65" />
              Reset User Password
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#66716C' }}>
              Enter a new password for <strong style={{textTransform: 'capitalize'}}>{editingUser.name}</strong> ({editingUser.email}).
            </p>

            {updateSuccess ? (
              <div style={{ padding: 16, backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircle2 color="#16A34A" size={24} />
                <div style={{ color: '#166534', fontSize: 14, fontWeight: 600 }}>Password updated successfully!</div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {updateError && (
                  <div style={{ padding: 12, backgroundColor: '#FEF2F2', color: '#C95C5C', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
                    {updateError}
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#66716C', marginBottom: 6 }}>New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5EAE7', fontSize: 14 }}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={updating}
                  style={{
                    marginTop: 8, padding: '12px', background: '#167A65', color: '#FFF', border: 'none', borderRadius: 8,
                    fontSize: 14, fontWeight: 600, cursor: updating ? 'not-allowed' : 'pointer', opacity: updating ? 0.7 : 1
                  }}
                >
                  {updating ? 'Updating...' : 'Force Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
