interface Ethereum {
  request: (args: {
    method: string;
    params?: any[];
  }) => Promise<any>;
  on?: (event: string, callback: (...args: any[]) => void) => void;
  removeListener?: (event: string, callback: (...args: any[]) => void) => void;
  selectedAddress?: string | null;
  networkVersion?: string;
  chainId?: string;
}

declare global {
  interface Window {
    ethereum?: Ethereum;
  }
}

// Need this to make TypeScript treat this as a module
export {};
