import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import LoginModal from './LoginModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const goToDashboard = () => {
    if (!user) return;
    if (user.role === 'manager') navigate('/dashboard/manager');
    else if (user.role === 'data_entry') navigate('/dashboard/data-entry');
    else if (user.role === 'guest') navigate('/dashboard/guest');
  };

  return (
    <>
      <nav className="w-full py-5 px-8 flex flex-row justify-between items-center relative z-20">
        <Link to="/" className="flex items-center no-underline">
          <img 
            src="/src/assets/logo.png" 
            alt="Logo" 
            className="h-[32px] w-auto" 
            onError={(e) => {
              e.target.style.display='none'; 
              if (e.target.nextSibling) e.target.nextSibling.style.display='block';
            }} 
          />
          <span className="hidden text-xl font-bold font-[family-name:var(--font-headline)] tracking-wide text-foreground ml-2">ResortAI</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <button className="flex items-center gap-1 text-white/90 hover:text-white transition-colors duration-200 cursor-pointer text-sm font-medium bg-transparent border-none">
            Features <ChevronDown className="w-4 h-4" />
          </button>
          <button className="text-white/90 hover:text-white transition-colors duration-200 cursor-pointer text-sm font-medium bg-transparent border-none">
            Solutions
          </button>
          <button className="text-white/90 hover:text-white transition-colors duration-200 cursor-pointer text-sm font-medium bg-transparent border-none">
            Plans
          </button>
        </div>

        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={goToDashboard}
                className="text-sm font-medium text-white/90 flex items-center gap-2 cursor-pointer bg-transparent border-none hover:text-white"
              >
                {user.role === 'guest' ? 'Guest' : (user.username || 'Staff')}
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-white/10 rounded-full">{user.role.replace('_', ' ')}</span>
              </button>
              <button onClick={handleLogout} className="text-white/50 hover:text-white text-sm cursor-pointer bg-transparent border-none">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => setIsLoginOpen(true)} className="btn-heroSecondary rounded-full px-6 py-2 text-sm font-medium cursor-pointer border-none">
              Login
            </button>
          )}
        </div>
      </nav>
      <div className="w-full h-[1px] mt-[3px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20 relative" />
      
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
