import { Routes, Route } from 'react-router-dom';

import OperationsDashboard from '../pages/OperationsDashboard';
import GuestList from '../pages/GuestList';
import GuestProfile from '../pages/GuestProfile';
import CancellationRisk from '../pages/CancellationRisk';
import OperationsStaffing from '../pages/OperationsStaffing';
import OperationsRequests from '../pages/OperationsRequests';

export default function OperationsRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<OperationsDashboard />} />
      <Route path="guests" element={<GuestList />} />
      <Route path="guests/:guestId" element={<GuestProfile />} />
      <Route path="cancellations" element={<CancellationRisk />} />
      <Route path="staffing" element={<OperationsStaffing />} />
      <Route path="requests" element={<OperationsRequests />} />
    </Routes>
  );
}
