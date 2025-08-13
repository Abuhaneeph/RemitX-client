import { createConfig, http } from 'wagmi';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

// Define Core Testnet
const coreTestnet = {
  id: 1114, // Chain ID for Core Testnet
  name: 'Core Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Core Testnet Token',
    symbol: 'TCORE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.test2.btcs.network'], // Core Testnet RPC URL
    },
    public: {
      http: ['https://rpc.test2.btcs.network'], // Same public RPC URL
    },
  },
  blockExplorers: {
    default: {
      name: 'Core Testnet Explorer',
      url: 'https://scan.test2.btcs.network', // Core Testnet block explorer
    },
  },
  testnet: true,
} as const;

// Create wagmi config
export const wagmiConfig = createConfig({
  chains: [coreTestnet],
  connectors: [
    injected(),
    metaMask(),
    // walletConnect({ projectId: 'your-project-id' }),
  ],
  transports: {
    [coreTestnet.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
