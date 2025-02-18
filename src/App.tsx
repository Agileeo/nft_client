import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WalletConnect from './components/WalletConnect';
import Navigation from './components/Navigation';
import NFTCorePage from './pages/NFTCore';
import MarketPlaceSalePage from './pages/MarketPlaceSale';
import HomePage from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import MonitoringPage from './pages/Monitoring';

function App() {
  const [isConnected, setIsConnected] = useState(false);

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  return (
    <Router>
      <div className="App">
        <header className="bg-gray-900 text-white p-4">
          <h1 className="text-3xl font-bold">2Crypto Marketplace</h1>
          <WalletConnect 
            onConnect={() => setIsConnected(true)} 
            onDisconnect={handleDisconnect}
          />
        </header>
        <Navigation isConnected={isConnected} />
        <main className="p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/mint" 
              element={
                <ProtectedRoute isConnected={isConnected}>
                  <NFTCorePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/marketplace" 
              element={
                <ProtectedRoute isConnected={isConnected}>
                  <MarketPlaceSalePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/monitor" 
              element={
                <ProtectedRoute isConnected={isConnected}>
                  <MonitoringPage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
