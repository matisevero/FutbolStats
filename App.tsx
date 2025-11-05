import React, { useEffect } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { useData } from './contexts/DataContext';

import Header from './components/Header';
import RecorderPage from './pages/RecorderPage';
import StatsPage from './pages/StatsPage';
import ProgressPage from './pages/ProgressPage';
import DuelsPage from './pages/DuelsPage';
import CoachPage from './pages/CoachPage';
import SettingsPage from './pages/SettingsPage';
import TablePage from './pages/TablePage';
import SocialPage from './pages/SocialPage';
import OnboardingPage from './pages/OnboardingPage';
import WorldCupPage from './pages/WorldCupPage';
import { InfoIcon } from './components/icons/InfoIcon';
// FIX: Import 'Page' type from the centralized types file to break circular dependency.
import type { Page } from './types';

const App: React.FC = () => {
  const { theme } = useTheme();
  const { currentPage, isShareMode, setCurrentPage, isOnboardingComplete, completeOnboarding } = useData();

  useEffect(() => {
    if (isShareMode) {
        const urlParams = new URLSearchParams(window.location.search);
        const view = urlParams.get('view') as Page | null;
        const restrictedPages: Page[] = ['recorder', 'settings'];

        if (view && !restrictedPages.includes(view)) {
            setCurrentPage(view);
        } else if (restrictedPages.includes(currentPage)) {
            setCurrentPage('stats');
        } else {
            setCurrentPage(currentPage || 'stats');
        }
    } else {
        if (currentPage === 'recorder' || currentPage === undefined) {
            setCurrentPage('recorder');
        }
    }
}, [isShareMode, currentPage, setCurrentPage]);


  const styles: { [key: string]: React.CSSProperties } = {
    appContainer: {
      minHeight: '100vh',
      background: theme.colors.backgroundGradient,
      color: theme.colors.primaryText,
      fontFamily: theme.typography.fontFamily,
      transition: 'background 0.3s, color 0.3s',
    },
    shareBanner: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: theme.colors.surface,
      color: theme.colors.secondaryText,
      padding: '0.5rem 1rem',
      textAlign: 'center',
      zIndex: 2000,
      borderTop: `1px solid ${theme.colors.border}`,
      boxShadow: `0 -2px 10px rgba(0,0,0,0.1)`,
      fontSize: '0.8rem',
    },
    shareBannerText: {
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'stats':
        return <StatsPage />;
      case 'table':
        return <TablePage />;
      case 'duels':
        return <DuelsPage />;
      case 'worldcup':
        return <WorldCupPage />;
      case 'progress':
        return <ProgressPage />;
      case 'social':
        return <SocialPage />;
      case 'coach':
        return <CoachPage />;
      case 'settings':
        return isShareMode ? <StatsPage /> : <SettingsPage />;
      case 'recorder':
      default:
        return isShareMode ? <StatsPage /> : <RecorderPage />;
    }
  };

  if (!isOnboardingComplete && !isShareMode) {
    return <OnboardingPage onComplete={completeOnboarding} />;
  }

  return (
    <div style={styles.appContainer}>
      <style>{`
        @keyframes pageFadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .page-transition-container {
          animation: pageFadeInUp 0.4s ease-out forwards;
        }
      `}</style>
      <Header />
      <div key={currentPage} style={{ paddingTop: '65px', paddingBottom: isShareMode ? '50px' : '0' }} className="page-transition-container">
        {renderPage()}
      </div>
       {isShareMode && (
        <div style={styles.shareBanner}>
            <p style={styles.shareBannerText}>
                <InfoIcon size={16} /> Modo de solo lectura.
            </p>
        </div>
      )}
    </div>
  );
};

export default App;