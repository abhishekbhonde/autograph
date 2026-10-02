import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import HeroStudio from './components/HeroStudio';
import HallOfFame from './components/HallOfFame';
import ShareModal from './components/ShareModal';
import Toast from './components/Toast';
import Footer from './components/Footer';
import { getSignatureById } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('showcase');
  const [toast, setToast] = useState(null);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
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
          showToast('Signature not found or invalid link', 'error');
        });
    }
  }, []);

  const handleSignaturePublished = (newId) => {
    setRefreshKey((prev) => prev + 1);
    getSignatureById(newId)
      .then((data) => {
        setSelectedSignature(data);
        setActiveTab('showcase');
      })
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col font-sans selection:bg-white/20 selection:text-white">
      {/* Header Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Page Content */}
      <main className="flex-1 relative z-10">
        {activeTab === 'showcase' ? (
          <>
            <HeroBanner onCreateClick={() => setActiveTab('create')} />
            <HallOfFame
              onSelectSignature={setSelectedSignature}
              showToast={showToast}
              refreshTrigger={refreshKey}
            />
          </>
        ) : (
          <HeroStudio
            onSignaturePublished={handleSignaturePublished}
            showToast={showToast}
          />
        )}
      </main>

      {/* Share / Spotlight Modal */}
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

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
