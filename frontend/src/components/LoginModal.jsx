import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginModal({ isOpen, onClose }) {
  const [loginType, setLoginType] = useState('staff');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginType, username, password, phone })
      });
      const data = await response.json();
      if (data.success) {
        login(data);
        onClose();
        
        // Navigate based on role
        if (data.user.role === 'manager') navigate('/dashboard/manager');
        else if (data.user.role === 'data_entry') navigate('/dashboard/data-entry');
        else if (data.user.role === 'guest') navigate('/dashboard/guest');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-md w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer bg-transparent border-none">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-white text-center font-[family-name:var(--font-headline)]">Welcome Back</h2>
        
        <div className="flex gap-4 mb-6">
          <button 
            type="button"
            onClick={() => setLoginType('staff')}
            className={`flex-1 py-2 text-sm rounded-lg transition-colors cursor-pointer border-none ${loginType === 'staff' ? 'bg-white/20 text-white' : 'bg-transparent text-white/50 hover:bg-white/5'}`}
          >
            Staff Login
          </button>
          <button 
            type="button"
            onClick={() => setLoginType('guest')}
            className={`flex-1 py-2 text-sm rounded-lg transition-colors cursor-pointer border-none ${loginType === 'guest' ? 'bg-white/20 text-white' : 'bg-transparent text-white/50 hover:bg-white/5'}`}
          >
            Guest Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {loginType === 'staff' ? (
            <>
              <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                required
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                required
              />
            </>
          ) : (
            <input 
              type="text" 
              placeholder="Registered Phone Number" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
              required
            />
          )}

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button 
            type="submit"
            className="bg-white text-black font-semibold rounded-lg px-4 py-3 mt-2 hover:bg-white/90 transition-colors cursor-pointer border-none"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
