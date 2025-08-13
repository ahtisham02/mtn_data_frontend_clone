import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Intercom from '@intercom/messenger-js-sdk';

import Header from '../ui-components/AdminPage/Header';
import MainSidebar from '../ui-components/AdminPage/MainSidebar';
import UpgradeModal from '../ui-components/UpgradeModal';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const intercomAppId = import.meta.env.VITE_INTERCOM_APP_ID;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const remainingCredits = useSelector((state) => state.user.creditsInfo?.remainingCredits);
  const status = useSelector((state) => state.user.status);
  
  useEffect(() => {
    if (status !== 'succeeded' || typeof remainingCredits !== 'number') {
      return;
    }

    const isOutOfCredits = remainingCredits <= 0;
    const isLowOnCredits = remainingCredits > 0 && remainingCredits <= 70;
    const hasEnoughCredits = remainingCredits > 70;

    if (hasEnoughCredits) {
      setHasBeenDismissed(false);
    }
    
    let shouldShow = false;

    if (isOutOfCredits) {
      setModalContent({
        title: "You're Out of Credits",
        message: `Your account has no credits left. Your API services are now disabled. Please add more credits to continue.`,
      });
      shouldShow = true;
    } else if (isLowOnCredits && !hasBeenDismissed) {
      setModalContent({
        title: "Your Credits are Low",
        message: `You have only ${remainingCredits} credits remaining. Add more now to avoid any disruption to your service.`,
      });
      shouldShow = true;
    }
    
    setIsModalOpen(shouldShow);

  }, [remainingCredits, status, hasBeenDismissed]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (remainingCredits > 0) {
      setHasBeenDismissed(true);
    }
  };

  useEffect(() => {
    if (intercomAppId) {
      Intercom({ app_id: intercomAppId });
    }
  }, [intercomAppId]);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex flex-col h-screen bg-background font-plus-jakarta">
      <UpgradeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalContent.title}
        message={modalContent.message}
        buttonText="Add More Credits"
      />
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