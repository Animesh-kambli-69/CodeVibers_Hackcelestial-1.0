import { Routes, Route } from 'react-router-dom';

import GuestHome from '../pages/GuestHome';
import GuestConcierge from '../pages/GuestConcierge';
import GuestProfilePage from '../pages/GuestProfilePage';
import GuestRequests from '../pages/GuestRequests';

export default function GuestRoutes() {
  return (
    <Routes>
      <Route path="home" element={<GuestHome />} />
      <Route path="concierge" element={<GuestConcierge />} />
      <Route path="profile" element={<GuestProfilePage />} />
      <Route path="requests" element={<GuestRequests />} />
    </Routes>
  );
}
