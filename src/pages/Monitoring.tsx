import React, { useState, useEffect } from 'react';
import { ethers, BrowserProvider, Contract } from 'ethers';
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

  const fetchContractInfo = async () => {
    try {
      const contractAddress = process.env.REACT_APP_NFTCORE_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('Contract address is not configured');
      }

      let provider;
      const chainId = 43113; // Testnet

      if (window.ethereum) {
        provider = new BrowserProvider(window.ethereum, getProviderOptions(chainId));
      } else if (process.env.REACT_APP_RPC_URL) {
        provider = new ethers.JsonRpcProvider(
          process.env.REACT_APP_RPC_URL,
          getNetworkConfig(chainId)
        );
      } else {
        throw new Error('No Web3 Provider detected and RPC URL not configured');
      }

      const contract = new Contract(contractAddress, NFTCoreABI.abi, provider);

      const [name, symbol, totalSupply, owner] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.totalSupply(),
        contract.owner()
      ]);

      setContractInfo(prev => ({
        ...prev,
        name,
        symbol,
        totalSupply: totalSupply.toString(),
        owner
      }));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching contract info:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contract information');
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
