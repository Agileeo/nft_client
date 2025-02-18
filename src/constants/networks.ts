import { Network } from 'ethers';

export const AVALANCHE_MAINNET = {
  chainId: 43114,
  chainName: 'Avalanche Mainnet C-Chain',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18
  },
  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://snowtrace.io/']
};

export const AVALANCHE_TESTNET = {
  chainId: 43113,
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/']
};

export const getNetworkConfig = (chainId: number) => {
  return chainId === 43113 ? AVALANCHE_TESTNET : AVALANCHE_MAINNET;
};

export const getProviderOptions = (chainId: number) => {
  const network = getNetworkConfig(chainId);
  return {
    name: network.chainName,
    chainId: network.chainId
  };
};
