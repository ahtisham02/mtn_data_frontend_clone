import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../ui-components/AdminPage/Header';
import MainSidebar from '../ui-components/AdminPage/MainSidebar';
import Intercom from '@intercom/messenger-js-sdk';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const intercomAppId = import.meta.env.VITE_INTERCOM_APP_ID;

  useEffect(() => {
    Intercom({
      app_id: intercomAppId,
    });
  }, [intercomAppId]);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex flex-col h-screen bg-background font-plus-jakarta">
      <Header 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen} 
        closeSidebar={closeSidebar} 
      />
      <div className="flex flex-1 overflow-hidden">
        <MainSidebar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
        <main className="flex-1 p-4 overflow-y-auto md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}