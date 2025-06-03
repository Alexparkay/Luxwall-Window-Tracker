import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import AnalyticsPage from '@/components/analytics/AnalyticsPage';
import CalendarPage from '@/components/calendar/CalendarPage';
import MapViewer from '@/components/MapViewer';
import SettingsPage from '@/components/settings/SettingsPage';

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'map':
        return <MapViewer />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <Layout
      activeItem={activeView}
      onNavigate={setActiveView}
    >
      {renderContent()}
    </Layout>
  );
};

export default Dashboard; 