import React, { useState } from 'react';
import { Contract, parseEther, BrowserProvider, BaseContract, ContractInterface, InterfaceAbi } from 'ethers';
import { useWallet } from '../context';
import MarketPlaceSaleABI from '../contracts/MarketPlaceSale.json';
import NFTABI from '../contracts/NFT.json';

interface ListingData {
  tokenId: string;
  price: string;
  startDate: string;
}

interface SaleInfo {
  seller: string;
  price: bigint;
  startTime: bigint;
  active: boolean;
}

interface MarketplaceSaleContract extends BaseContract {
  'listNFTSale(uint256,uint256,uint256)': (tokenId: bigint, price: bigint, startDate: bigint) => Promise<any>;
  'unlistNFTSale(uint256)': (tokenId: bigint) => Promise<any>;
  'buyNFT(uint256)': {
    (tokenId: bigint, options: { value: bigint }): Promise<any>;
    (tokenId: bigint): Promise<any>;
  };
  'sales(uint256)': (tokenId: bigint) => Promise<SaleInfo>;
}

const MarketPlaceSalePage: React.FC = () => {
  const [listingData, setListingData] = useState<ListingData>({ tokenId: '', price: '', startDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [txStatus, setTxStatus] = useState<string>('');
  const { provider, account } = useWallet();

  const getSignerAndContract = async <T extends BaseContract>(
    contractAddress: string, 
    abi: any[]
  ): Promise<T> => {
    if (!provider) {
      throw new Error('Provider is not initialized');
    }
    const signer = await (provider as BrowserProvider).getSigner();
    const contract = new Contract(contractAddress, abi as InterfaceAbi, signer);
    return contract as unknown as T;
  };

  // Add utility function for AVAX to Gwei conversion
  const convertAvaxToGwei = (avaxAmount: string): bigint => {
    try {
      // 1 AVAX = 10^9 Gwei
      const avaxValue = parseFloat(avaxAmount);
      if (isNaN(avaxValue)) throw new Error('Invalid amount');
      const gweiValue = Math.floor(avaxValue * 1e9); // Convert to Gwei (1 AVAX = 10^9 Gwei)
      return BigInt(gweiValue);
    } catch (error) {
      throw new Error('Invalid AVAX amount');
    }
  };

  // Add token ID utility functions
  const normalizeTokenId = (tokenId: string): bigint => {
    try {
      // Remove '0x' prefix if present and convert to number
      const cleanTokenId = tokenId.toLowerCase().replace('0x', '');
      return BigInt(parseInt(cleanTokenId, 10)); // Force base 10 parsing
    } catch (error) {
      throw new Error('Invalid token ID format');
    }
  };

  const handleUnlist = async (tokenId: string) => {
    if (!provider || !account) {
      setError('Please connect your wallet first');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_SALE_ADDRESS;
      if (!marketplaceAddress) {
        throw new Error('Marketplace contract address not configured');
      }

      const contract = await getSignerAndContract<MarketplaceSaleContract>(
        marketplaceAddress,
        MarketPlaceSaleABI.abi as any[]
      );

      const tx = await contract['unlistNFTSale(uint256)'](BigInt(tokenId));
      await tx.wait();
      
      setSuccess(`NFT #${tokenId} unlisted successfully!`);
    } catch (err: any) {
      console.error('Error unlisting NFT:', err);
      setError(err.message || 'Error unlisting NFT');
    } finally {
      setLoading(false);
    }
  };

  const handleList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !account) {
      setError('Please connect your wallet first');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);
    setTxStatus('Initiating transaction...');

    try {
      // Validate and normalize token ID
      if (!listingData.tokenId) {
        throw new Error('Token ID is required');
      }

      const normalizedTokenId = normalizeTokenId(listingData.tokenId);
      console.log(`Normalized Token ID: ${normalizedTokenId} (Original: ${listingData.tokenId})`);

      // Validate price input
      if (!listingData.price || isNaN(Number(listingData.price))) {
        throw new Error('Invalid price value');
      }

      const priceInGwei = convertAvaxToGwei(listingData.price);
      console.log(`Listing price: ${listingData.price} AVAX (${priceInGwei.toString()} Gwei)`);

      // ...rest of the listing logic...
      const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_SALE_ADDRESS;
      if (!marketplaceAddress) {
        throw new Error('Marketplace contract address not configured');
      }

      const contract = await getSignerAndContract<MarketplaceSaleContract>(
        marketplaceAddress,
        MarketPlaceSaleABI.abi as any[]
      );

      const startTimestamp = listingData.startDate 
        ? BigInt(Math.floor(new Date(listingData.startDate).getTime() / 1000))
        : BigInt(0);

      setTxStatus('Waiting for wallet confirmation...');
      
      // Use normalized token ID in contract call
      const tx = await contract['listNFTSale(uint256,uint256,uint256)'](
        normalizedTokenId,
        priceInGwei,
        startTimestamp
      );

      setTxStatus('Transaction submitted. Waiting for confirmation...');
      
      const receipt = await tx.wait(2);

      if (receipt.status === 1) {
        setSuccess(`NFT #${listingData.tokenId} listed successfully! Transaction hash: ${receipt.hash}`);
        setListingData({ tokenId: '', price: '', startDate: '' });
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      console.error('Error listing NFT:', err);
      if (err.message.includes('Invalid token ID')) {
        setError('Invalid token ID format. Please use a simple number.');
      } else if (err.code === 'ACTION_REJECTED') {
        setError('Transaction was rejected by user');
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        setError('Insufficient funds to complete transaction');
      } else if (err.message.includes('user rejected')) {
        setError('Transaction was rejected in wallet');
      } else {
        setError(`Error listing NFT: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
      setTxStatus('');
    }
  };

  const handleBuy = async (tokenId: string) => {
    if (!provider || !account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!tokenId) {
      setError('Please enter a token ID');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_SALE_ADDRESS;
      if (!marketplaceAddress) {
        throw new Error('Marketplace contract address not configured');
      }

      const contract = await getSignerAndContract<MarketplaceSaleContract>(
        marketplaceAddress,
        MarketPlaceSaleABI.abi as any[]
      );

      const sale = await contract['sales(uint256)'](BigInt(tokenId));
      if (!sale || !sale.seller) {
        throw new Error('NFT is not listed for sale');
      }

      const tx = await contract['buyNFT(uint256)'](BigInt(tokenId), {
        value: sale.price
      });

      await tx.wait();
      setSuccess(`Successfully purchased NFT #${tokenId}!`);
    } catch (err: any) {
      console.error('Error buying NFT:', err);
      setError(err.message || 'Error buying NFT');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">NFT Marketplace</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {txStatus && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {txStatus}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">List NFT for Sale</h2>
        <form onSubmit={handleList} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Token ID (enter as simple number)</label>
            <input
              type="text"
              pattern="[0-9]*" // Only allow numbers
              value={listingData.tokenId}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                setListingData(prev => ({...prev, tokenId: value}));
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              disabled={loading}
            />
            <small className="text-gray-500">Enter token ID as a number (e.g., 12)</small>
          </div>
          <div>
            <label className="block text-sm font-medium">Price (in AVAX)</label>
            <input
              type="number"
              step="0.000000001" // Allow for 9 decimal places (Gwei)
              min="0"
              value={listingData.price}
              onChange={(e) => setListingData(prev => ({...prev, price: e.target.value}))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              disabled={loading}
            />
            {listingData.price && (
              <small className="text-gray-500">
                {`≈ ${convertAvaxToGwei(listingData.price).toString()} Gwei`}
              </small>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Start Date (optional)</label>
            <input
              type="datetime-local"
              value={listingData.startDate}
              onChange={(e) => setListingData(prev => ({...prev, startDate: e.target.value}))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading || isApproving}
          >
            {isApproving ? 'Approving...' : loading ? 'Processing...' : 'List NFT'}
          </button>
        </form>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Unlist NFT</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Token ID to unlist"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            onChange={(e) => setListingData(prev => ({...prev, tokenId: e.target.value}))}
            disabled={loading}
          />
          <button 
            onClick={() => handleUnlist(listingData.tokenId)}
            className="bg-red-500 text-white px-4 py-2 rounded mt-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Unlist NFT'}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Buy NFT</h2>
        <input
          type="text"
          placeholder="Token ID"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          onChange={(e) => setListingData(prev => ({...prev, tokenId: e.target.value}))}
          disabled={loading}
        />
        <button 
          onClick={() => handleBuy(listingData.tokenId)}
          className="bg-green-500 text-white px-4 py-2 rounded mt-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Buy NFT'}
        </button>
      </div>
    </div>
  );
};

export default MarketPlaceSalePage;
