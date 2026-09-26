import { useAuth } from '../AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  
  return children;
}

export function ManagerDashboard() {
  return (
    <ProtectedRoute role="manager">
      <div className="flex-1 flex flex-col p-8 w-full max-w-6xl mx-auto z-10 relative mt-10">
        <h2 className="text-4xl font-bold text-white mb-8 font-[family-name:var(--font-headline)]">Manager Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
            <h3 className="text-white/70 text-sm font-medium mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-white">$124,500</p>
            <span className="text-green-400 text-xs mt-2 block">+12% from last month</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
            <h3 className="text-white/70 text-sm font-medium mb-2">Active Bookings</h3>
            <p className="text-3xl font-bold text-white">42</p>
            <span className="text-green-400 text-xs mt-2 block">+5 this week</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
            <h3 className="text-white/70 text-sm font-medium mb-2">Staff Online</h3>
            <p className="text-3xl font-bold text-white">8</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
            <h3 className="text-white/70 text-sm font-medium mb-2">Occupancy Rate</h3>
            <p className="text-3xl font-bold text-white">87%</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-md w-full">
          <h3 className="text-xl font-bold text-white mb-6">Recent Alerts</h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200">
              Low inventory on premium toiletries in West Wing.
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-200">
              New group booking received for Dec 20th.
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export function DataEntryDashboard() {
  return (
    <ProtectedRoute role="data_entry">
      <div className="flex-1 flex flex-col p-8 w-full max-w-4xl mx-auto z-10 relative mt-10">
        <h2 className="text-4xl font-bold text-white mb-8 font-[family-name:var(--font-headline)]">Operations & Data Entry</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer group">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400">Log New Booking</h3>
            <p className="text-white/50 text-sm">Manually enter a walk-in or phone booking.</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer group">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400">Update Guest Records</h3>
            <p className="text-white/50 text-sm">Modify preferences, phone numbers, or special requests.</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer group">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400">Inventory Check</h3>
            <p className="text-white/50 text-sm">Update stock levels for housekeeping and dining.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer group">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400">Maintenance Request</h3>
            <p className="text-white/50 text-sm">Log a new maintenance ticket for a room.</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export function GuestDashboard() {
  const { user } = useAuth();
  
  return (
    <ProtectedRoute role="guest">
      <div className="flex-1 flex flex-col p-8 w-full max-w-3xl mx-auto z-10 relative mt-10">
        <h2 className="text-4xl font-bold text-white mb-2 font-[family-name:var(--font-headline)]">Welcome Back!</h2>
        <p className="text-white/50 mb-8">Registered Phone: {user?.phone}</p>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-md w-full text-left mb-6">
          <h3 className="text-2xl font-bold text-white mb-6">Your Recent Stays</h3>
          <ul className="space-y-4 m-0 p-0 list-none">
            <li className="flex justify-between items-center bg-black/20 p-4 rounded-lg border border-white/5">
              <div>
                <div className="text-white font-medium text-lg">Ocean View Suite</div>
                <div className="text-white/40 text-sm">Confirmation: #RV-8821A</div>
              </div>
              <div className="text-right">
                <div className="text-white/80">Oct 12, 2025</div>
                <div className="text-green-400 text-sm">Completed</div>
              </div>
            </li>
            <li className="flex justify-between items-center bg-black/20 p-4 rounded-lg border border-white/5">
              <div>
                <div className="text-white font-medium text-lg">Premium Villa</div>
                <div className="text-white/40 text-sm">Confirmation: #RV-4490B</div>
              </div>
              <div className="text-right">
                <div className="text-white/80">Jan 05, 2026</div>
                <div className="text-green-400 text-sm">Completed</div>
              </div>
            </li>
          </ul>
        </div>
        
        <button className="w-full bg-white text-black hover:bg-white/90 rounded-full py-4 text-lg font-bold cursor-pointer transition-colors border-none">
          Book Another Stay
        </button>
      </div>
    </ProtectedRoute>
  );
}
