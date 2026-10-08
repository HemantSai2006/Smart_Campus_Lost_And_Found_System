import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import ReportItemModal from './components/ReportItemModal';
import ItemDetailsModal from './components/ItemDetailsModal';
import ClaimModal from './components/ClaimModal';

import BrowseItems from './pages/BrowseItems';
import PossibleMatches from './pages/PossibleMatches';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MyReports from './pages/MyReports';
import MyClaims from './pages/MyClaims';
import ProfilePage from './pages/ProfilePage';

function MainContent() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState('LOST');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimItem, setClaimItem] = useState(null);

  const handleOpenReport = (type) => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    setReportType(type);
    setReportModalOpen(true);
  };

  const handleOpenClaim = (item) => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    setClaimItem(item);
    setClaimModalOpen(true);
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setLoginModalOpen(true)}
        onOpenRegister={() => setRegisterModalOpen(true)}
        onOpenReportLost={() => handleOpenReport('LOST')}
        onOpenReportFound={() => handleOpenReport('FOUND')}
        isMobileOpen={sidebarOpen}
        setIsMobileOpen={setSidebarOpen}
      />

      {/* Main Content on the right */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 min-h-screen">
        <Header
          activeTab={activeTab}
          onOpenReportLost={() => handleOpenReport('LOST')}
          onOpenReportFound={() => handleOpenReport('FOUND')}
          onToggleMobileSidebar={() => setSidebarOpen(prev => !prev)}
        />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'browse' && (
          <BrowseItems
            refreshTrigger={refreshTrigger}
            onViewDetails={handleViewDetails}
            onClaim={handleOpenClaim}
            onOpenReportLost={() => handleOpenReport('LOST')}
            onOpenReportFound={() => handleOpenReport('FOUND')}
          />
        )}

        {activeTab === 'matches' && (
          <PossibleMatches
            onClaim={handleOpenClaim}
            onViewDetails={handleViewDetails}
          />
        )}

        {activeTab === 'student-dashboard' && (
          <StudentDashboard
            refreshTrigger={refreshTrigger}
            onOpenReportLost={() => handleOpenReport('LOST')}
            onOpenReportFound={() => handleOpenReport('FOUND')}
            onNavigateToTab={setActiveTab}
            onViewDetails={handleViewDetails}
          />
        )}

        {(activeTab === 'admin-dashboard' || activeTab === 'admin-claims') && (
          <AdminDashboard onViewDetails={handleViewDetails} />
        )}

        {activeTab === 'my-reports' && (
          <MyReports
            refreshTrigger={refreshTrigger}
            onOpenReportLost={() => handleOpenReport('LOST')}
            onOpenReportFound={() => handleOpenReport('FOUND')}
            onViewDetails={handleViewDetails}
          />
        )}

        {activeTab === 'my-claims' && (
          <MyClaims />
        )}

        {activeTab === 'profile' && (
          <ProfilePage />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            Smart Campus Lost &amp; Found
          </p>
          <p className="text-slate-500">
            Helping students and staff safely recover and return lost belongings across campus.
          </p>
          <p className="text-[11px] text-slate-400">
            &copy; {new Date().getFullYear()} Smart Campus Portal. All rights reserved.
          </p>
        </div>
      </footer>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToRegister={() => { setLoginModalOpen(false); setRegisterModalOpen(true); }}
      />

      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={() => { setRegisterModalOpen(false); setLoginModalOpen(true); }}
      />

      <ReportItemModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        initialType={reportType}
        onItemReported={() => {
          setRefreshTrigger(prev => prev + 1);
          if (activeTab !== 'student-dashboard' && activeTab !== 'my-reports') {
            setActiveTab('browse');
          }
        }}
      />

      <ItemDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        item={selectedItem}
        onClaim={handleOpenClaim}
        onDelete={() => {
          setDetailsModalOpen(false);
        }}
      />

      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        item={claimItem}
        onClaimSubmitted={() => {
          setActiveTab('my-claims');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
