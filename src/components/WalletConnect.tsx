import React from 'react';
import { Button } from '@mui/material';
import { useWallet } from '../context/WalletContext';

interface WalletConnectProps {
  onConnect: () => void;
  onDisconnect: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect, onDisconnect }) => {
  const { connect, disconnect, account, isConnected } = useWallet();

  const handleConnect = async () => {
    await connect();
    onConnect();
  };

  const handleDisconnect = () => {
    disconnect();
    onDisconnect();
  };

  return (
    <div>
      {!isConnected ? (
        <Button variant="contained" color="primary" onClick={handleConnect}>
          Connect Wallet
        </Button>
      ) : (
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </span>
          <Button variant="outlined" color="secondary" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
