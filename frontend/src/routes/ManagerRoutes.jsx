import { Routes, Route } from 'react-router-dom';

import ManagerDashboard from '../pages/ManagerDashboard';
import ManagerForecast from '../pages/ManagerForecast';
import ManagerRecommendations from '../pages/ManagerRecommendations';
import ManagerPricing from '../pages/ManagerPricing';
import ManagerSentiment from '../pages/ManagerSentiment';
import ManagerDigitalTwin from '../pages/ManagerDigitalTwin';

export default function ManagerRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<ManagerDashboard />} />
      <Route path="forecast" element={<ManagerForecast />} />
      <Route path="recommendations" element={<ManagerRecommendations />} />
      <Route path="pricing" element={<ManagerPricing />} />
      <Route path="sentiment" element={<ManagerSentiment />} />
      <Route path="digital-twin" element={<ManagerDigitalTwin />} />
    </Routes>
  );
}
