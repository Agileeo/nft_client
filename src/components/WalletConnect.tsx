import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { AVALANCHE_MAINNET, AVALANCHE_TESTNET, getNetworkConfig, getProviderOptions } from '../constants/networks';

interface WalletConnectProps {
  onConnect: () => void;
  onDisconnect: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect, onDisconnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [isTestnet, setIsTestnet] = useState(true);

  useEffect(() => {
    checkConnection();

    // Setup event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }

    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      handleDisconnect();
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAccount('');
    onDisconnect();
  };

  const checkConnection = async () => {
    if (window?.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setIsConnected(true);
          setAccount(accounts[0]);
          onConnect();
        } else {
          handleDisconnect();
        }
      } catch (error) {
        console.error('Error checking connection:', error);
        handleDisconnect();
      }
    }
  };

  const connectWallet = async () => {
    if (window?.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const network = isTestnet ? AVALANCHE_TESTNET : AVALANCHE_MAINNET;
        await switchNetwork(network.chainId);
        
        const provider = new BrowserProvider(
          window.ethereum, 
          getProviderOptions(network.chainId)
        );
        
        await provider.getNetwork(); // Verify network connection
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setIsConnected(true);
        setAccount(accounts[0]);
        onConnect();
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const switchNetwork = async (chainId: number) => {
    try {
      await window?.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        const network = isTestnet ? AVALANCHE_TESTNET : AVALANCHE_MAINNET;
        await window?.ethereum?.request({
          method: 'wallet_addEthereumChain',
          params: [network],
        });
      }
    }
  };

  return (
    <div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={isTestnet}
            onChange={(e) => setIsTestnet(e.target.checked)}
          />
          Use Testnet (Fuji)
        </label>
      </div>
      <button
        onClick={connectWallet}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {isConnected ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
      </button>
    </div>
  );
};

export default WalletConnect;
