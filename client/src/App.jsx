import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroStudio from './components/HeroStudio';
import HallOfFame from './components/HallOfFame';
import ShareModal from './components/ShareModal';
import Toast from './components/Toast';
import Footer from './components/Footer';
import { getSignatureById } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [toast, setToast] = useState(null);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Check URL query param ?id=... on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const signatureId = params.get('id');

    if (signatureId) {
      getSignatureById(signatureId)
        .then((data) => {
          setSelectedSignature(data);
        })
        .catch(() => {
          showToast('Signature not found', 'error');
        });
    }
  }, []);

  const handleSignaturePublished = (newId) => {
    setRefreshKey((prev) => prev + 1);
    setActiveTab('home'); // Instantly switch to Showcase view when published/downloaded
    if (newId) {
      getSignatureById(newId)
        .then((data) => {
          setSelectedSignature(data);
        })
        .catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white relative flex flex-col font-ui selection:bg-white/20 selection:text-white">
      {/* GLOBAL NAV WITH INSTANT CREATE ACTION */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative z-10 pb-12">
        {activeTab === 'home' ? (
          /* MINIMAL SHOWCASE DASHBOARD VIEW */
          <HallOfFame
            onSelectSignature={setSelectedSignature}
            onOpenCreate={() => setActiveTab('studio')}
            refreshTrigger={refreshKey}
          />
        ) : (
          /* CREATE STUDIO VIEW */
          <HeroStudio
            onSignaturePublished={handleSignaturePublished}
            showToast={showToast}
          />
        )}
      </main>

      {/* SHOWCASE MODAL */}
      {selectedSignature && (
        <ShareModal
          signature={selectedSignature}
          onClose={() => {
            setSelectedSignature(null);
            if (window.location.search.includes('id=')) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }}
          showToast={showToast}
        />
      )}

      {/* TOAST NOTIFICATION */}
      <Toast toast={toast} />

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
