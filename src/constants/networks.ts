import { Network } from 'ethers';

export const AVALANCHE_MAINNET = {
  chainId: 43114,
  chainName: 'Avalanche Mainnet C-Chain',
  name: 'Avalanche Mainnet',
  symbol: 'AVAX',
  decimals: 18,
  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://snowtrace.io/'],
  ensAddress: undefined,
  networkNameForDisplay: 'Avalanche Mainnet'
};

export const AVALANCHE_TESTNET = {
  chainId: 43113,
  chainName: 'Avalanche Fuji Testnet',
  name: 'Avalanche Testnet',
  symbol: 'AVAX',
  decimals: 18,
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/'],
  ensAddress: undefined,
  networkNameForDisplay: 'Avalanche Testnet'
};

export const getNetworkConfig = (chainId: number): Network => {
  const network = chainId === 43113 ? AVALANCHE_TESTNET : AVALANCHE_MAINNET;
  return {
    chainId: network.chainId,
    name: network.networkNameForDisplay,
    ensNetwork: undefined,
    ensAddress: null,
    getNetwork: async () => network.chainId
  };
};

export const getProviderOptions = (chainId: number) => ({
  networks: [getNetworkConfig(chainId)],
  enableCaching: false,
  staticNetwork: getNetworkConfig(chainId)
});
