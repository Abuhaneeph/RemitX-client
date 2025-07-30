import { createConfig, http } from 'wagmi';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

// Define Morph Holesky Testnet
const morphHolesky = {
  id: 920, // replace with the actual chain ID for Morph Holesky
  name: 'Morph Holesky Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [`https://2810.rpc.thirdweb.com/${import.meta.env.VITE_THIRDWEB_CLIENT_ID}`], // replace with actual Morph Holesky RPC URL
    },
    public: {
      http: [`https://2810.rpc.thirdweb.com/${import.meta.env.VITE_THIRDWEB_CLIENT_ID}`], // same here
    },
  },
  blockExplorers: {
    default: {
      name: 'Morph Holesky Explorer',
      url: 'https://explorer-holesky.morphl2.io', // replace with actual explorer URL
    },
  },
  testnet: true,
} as const;

// Create wagmi config
export const wagmiConfig = createConfig({
  chains: [morphHolesky],
  connectors: [
    injected(),
    metaMask(),
    // walletConnect({ projectId: 'your-project-id' }),
  ],
  transports: {
    [morphHolesky.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
