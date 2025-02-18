import React, { useState, useEffect } from 'react';
import { ethers, BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import NFTCoreABI from '../contracts/NFTCore.json';
import { getNetworkConfig, getProviderOptions } from '../constants/networks';

const MonitoringPage: React.FC = () => {
  const [contractInfo, setContractInfo] = useState({
    name: '',
    symbol: '',
    totalSupply: '0',
    owner: '',
    contractAddress: process.env.REACT_APP_NFTCORE_CONTRACT_ADDRESS || ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContractInfo();
  }, []);

  const formatError = (error: any): string => {
    if (error.code === 'CALL_EXCEPTION') {
      return 'Failed to connect to the contract. Please verify the contract address and network.';
    }
    if (error.message && error.message.includes('sending a transaction requires a signer')) {
      return 'Provider connection error. Please connect your wallet.';
    }
    return error instanceof Error ? error.message : 'An unknown error occurred';
  };

  const getProvider = async () => {
    const chainId = 43113; // Testnet
    const networkConfig = getNetworkConfig(chainId);

    if (window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
        return provider;
      } catch (error) {
        console.warn('Wallet connection failed, falling back to RPC:', error);
      }
    }

    return new JsonRpcProvider(networkConfig.rpcUrls[0]);
  };

  const fetchContractInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      const contractAddress = process.env.REACT_APP_NFTCORE_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('Contract address is not configured');
      }

      const provider = await getProvider();
      const contract = new Contract(contractAddress, NFTCoreABI.abi, provider);

      const results = await Promise.allSettled([
        contract.name(),
        contract.symbol(),
        contract.totalSupply(),
        contract.owner()
      ]);

      const [name, symbol, totalSupply, owner] = results.map((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Failed to fetch data for index ${index}:`, result.reason);
          return '';
        }
        return result.value;
      });

      setContractInfo(prev => ({
        ...prev,
        name: name || 'N/A',
        symbol: symbol || 'N/A',
        totalSupply: totalSupply ? totalSupply.toString() : 'N/A',
        owner: owner || 'N/A'
      }));
    } catch (err) {
      console.error('Error fetching contract info:', err);
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading contract information...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">NFT Contract Monitor</h1>
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-4">Contract Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium">Contract Address:</label>
              <p className="text-gray-600 break-all">{contractInfo.contractAddress}</p>
            </div>
            <div>
              <label className="font-medium">Name:</label>
              <p className="text-gray-600">{contractInfo.name}</p>
            </div>
            <div>
              <label className="font-medium">Symbol:</label>
              <p className="text-gray-600">{contractInfo.symbol}</p>
            </div>
            <div>
              <label className="font-medium">Total Supply:</label>
              <p className="text-gray-600">{contractInfo.totalSupply}</p>
            </div>
            <div>
              <label className="font-medium">Owner:</label>
              <p className="text-gray-600 break-all">{contractInfo.owner}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchContractInfo}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default MonitoringPage;
