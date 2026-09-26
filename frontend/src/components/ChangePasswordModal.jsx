import { useState } from 'react';
import { X, Lock, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../lib/api';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(23, 32, 28, 0.6)' }} onClick={onClose} />
      
      <div style={{
        position: 'relative', background: '#FFF', borderRadius: 12, padding: 32, width: '100%', maxWidth: 400,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#66716C' }}>
          <X size={20} />
        </button>

        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#17201C', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock size={20} color="#167A65" />
          Change Password
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#66716C' }}>
          Update your account password securely.
        </p>

        {success ? (
          <div style={{ padding: 16, backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle2 color="#16A34A" size={24} />
            <div style={{ color: '#166534', fontSize: 14, fontWeight: 600 }}>Password updated successfully!</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div style={{ padding: 12, backgroundColor: '#FEF2F2', color: '#C95C5C', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
                {error}
              </div>
            )}
            
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#66716C', marginBottom: 6 }}>Current Password</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5EAE7', fontSize: 14 }}
              />
            </div>
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
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#66716C', marginBottom: 6 }}>Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5EAE7', fontSize: 14 }}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8, padding: '12px', background: '#167A65', color: '#FFF', border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
