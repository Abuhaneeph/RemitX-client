import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useActiveAccount, useActiveWallet, useActiveWalletChain} from 'thirdweb/react';
import { PRICE_ABI } from '../lib/ABI/PriceAPI_ABI.ts';
import { Token_ABI} from '../lib/ABI/TestToken_ABI.ts';
import { SWAP_ABI } from '../lib/ABI/Swap_ABI.ts';
import { AfriStable_ABI } from '@/lib/ABI/AfriStable_ABI.ts';
import {Saving_ABI} from '@/lib/ABI/Saving_ABI.ts'
import { MockBTC_ABI } from '@/lib/ABI/MockBTC_abi.ts';
import tokens from '@/lib/Tokens/tokens.ts';

// Import or define the Token type
import type { Token } from '@/lib/Tokens/tokens.ts';
import { Lending_ABI } from '@/lib/ABI/Lending_ABI.ts';
import { mock } from 'node:test';
import {LST_BTC_ABI} from '@/lib/ABI/lstBTC_ABI.ts';
import { yieldVault_ABI } from '@/lib/ABI/yieldVault_ABI.ts';
// Contract addresses - replace with your actual contract addresses
export const CONTRACT_ADDRESSES = {
  swapAddress: '0xc271212C6c48d4FF2b4117B4136d98a41542F949',
  priceFeedAddress: '0x48686EA995462d611F4DA0d65f90B21a30F259A5',
  afriStableAddress: '0x2B2068a831e7C7B2Ac4D97Cd293F934d2625aB69',
  savingAddress: '0xa854EC84d953D81Fe5C59c09369BE94b4548D748',
  lendingProtocolAddress: '0x5CD11BAD37C63E30039BA4A741Ad9c5e837c52EF',
  mockBtcAddress: '0xF12D5E4D561000F1F464E4576bb27eA0e83931da', // Replace with actual Mock BTC contract address
  lstBTCAddress: '0xDeA521E585D429291f99631D751f5f02F544909b',
  btcStakingAddress: '0xBc6d8B5cC83E32079f75bB44cF723699B34c8495',
  yieldVaultAddress: '0xF7147Ee61060e3A33DBEd03207413c9C456004BC'


};

// Core Testnet chain ID
const CORE_CHAIN_ID = 1114;
//https://1114.rpc.thirdweb.com/1e9556ac7186f6b32eeb1bb30a368ce6
// Thirdweb RPC endpoint
const THIRDWEB_RPC_URL = `https://1114.rpc.thirdweb.com/${import.meta.env.VITE_THIRDWEB_CLIENT_ID}`;

// Enhanced context interface with Thirdweb integration
interface ContractInstancesContextType {
  fetchBalance: (faucetAddress: string) => Promise<string | undefined>;
  SWAP_CONTRACT_INSTANCE: () => Promise<ethers.Contract | null>;
  AFRISTABLE_CONTRACT_INSTANCE: () => Promise<ethers.Contract | null>;
  TEST_TOKEN_CONTRACT_INSTANCE: (tokenAddress: string) => Promise<ethers.Contract | null>;
  PRICEAPI_CONTRACT_INSTANCE: () => Promise<ethers.Contract | null>;
  SAVING_CONTRACT_INSTANCE: () => Promise<ethers.Contract | null>;
  LENDING_CONTRACT_INSTANCE: () => Promise<ethers.Contract | null>;
  MOCK_BTC_CONTRACT_INSTANCE: () => Promise<ethers.Contract | null>;
  LST_BTC_CONTRACT_INSTANCE: () => Promise<ethers.Contract | null>;
  YIELD_CONTRACT_INSTANCE: () => Promise<ethers.Contract | null>;
  signer: ethers.Signer | null;
  provider: ethers.JsonRpcProvider | null;
  address: string | null;
  nativeBalance: string | null;
  tokenList: Token[];
  isConnected: boolean;
  isCorrectNetwork: boolean;
  networkError: string | null;
  connectionError: string | null;
  // Manual connection method
  reconnectSigner: () => Promise<void>;
  // Network switching method
  switchToMorphNetwork: () => Promise<boolean>;
}

export const ContractInstances = createContext<ContractInstancesContextType | undefined>(undefined);

interface ContractInstanceProviderProps {
  children: ReactNode;
}

// Provider component with updated Thirdweb integration
export const ContractInstanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Thirdweb hooks
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const activeChain = useActiveWalletChain();

  // Local state
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [nativeBalance, setNativeBalance] = useState<string>('0');
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Derived state
  const address = account?.address || null;
  const isConnected = !!account && !!wallet;
  const isCorrectNetwork = activeChain?.id === CORE_CHAIN_ID;

  // Network switching function
  const switchToMorphNetwork = async (): Promise<boolean> => {
    try {
      if (!window.ethereum) {
        throw new Error('Ethereum provider not available');
      }

      console.log('Attempting to switch to Core Testnet network...');
      
      // First, try to switch to the existing network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${CORE_CHAIN_ID.toString(16)}` }], // Convert 2810 to hex: 0xAFA
        });
        console.log('✅ Successfully switched to Core Testnet network');
        return true;
      } catch (switchError: any) {
        // If network doesn't exist (error code 4902), add it
        if (switchError.code === 4902) {
          console.log('Core Testnet network not found, adding it...');
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${CORE_CHAIN_ID.toString(16)}`, // 0xAFA
                chainName: 'Core Testnet',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'TCORE2',
                  decimals: 18,
                },
                rpcUrls: [THIRDWEB_RPC_URL],
                blockExplorerUrls: ['https://explorer-testnet.morphl2.io/'],
              },
            ],
          });
          console.log('✅ Successfully added and switched to Core Testnet network');
          return true;
        }
        throw switchError;
      }
    } catch (error) {
      console.error('❌ Failed to switch network:', error);
      return false;
    }
  };

  // Initialize provider with Thirdweb RPC
  useEffect(() => {
    const initializeProvider = () => {
      try {
        const jsonRpcProvider = new ethers.JsonRpcProvider(THIRDWEB_RPC_URL);
        setProvider(jsonRpcProvider);
        console.log('Thirdweb RPC provider initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Thirdweb RPC provider:', error);
        setConnectionError('Failed to initialize RPC provider');
      }
    };

    initializeProvider();
  }, []);

  // Effect to create signer from active account with Thirdweb RPC
  useEffect(() => {
    const createSignerFromAccount = async () => {
      if (account && wallet && isConnected && isCorrectNetwork && provider) {
        try {
          console.log('Starting signer creation process...');
          console.log('Account:', account.address);
          console.log('Wallet:', wallet);
          console.log('Provider available:', !!provider);

          // Check if the browser has ethereum provider for signing
          if (typeof window !== 'undefined' && window.ethereum) {
            console.log('Ethereum provider found, creating browser provider...');
            
            // Create browser provider for signing transactions
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            console.log('Browser provider created successfully');
            
            // Get the signer
            console.log('Getting signer from browser provider...');
            const ethSigner = await browserProvider.getSigner();
            console.log('Signer obtained from browser provider');
            
            // Verify the signer address matches the account
            const signerAddress = await ethSigner.getAddress();
            console.log('Signer address:', signerAddress);
            console.log('Account address:', account.address);
            
            if (signerAddress.toLowerCase() === account.address.toLowerCase()) {
              // Try to connect signer to our Thirdweb RPC provider
              try {
                console.log('Connecting signer to Thirdweb RPC provider...');
                const connectedSigner = ethSigner.connect(provider);
                setSigner(connectedSigner);
                setConnectionError(null);
                console.log('✅ Signer connected with Thirdweb RPC provider successfully');
              } catch (connectError) {
                console.warn('Failed to connect signer to Thirdweb RPC, using browser signer:', connectError);
                // Fallback: use the browser signer directly
                setSigner(ethSigner);
                setConnectionError(null);
                console.log('✅ Using browser signer as fallback');
              }
            } else {
              console.warn('❌ Signer address mismatch with account');
              console.warn('Expected:', account.address.toLowerCase());
              console.warn('Got:', signerAddress.toLowerCase());
              setSigner(null);
              setConnectionError('Address mismatch between wallet and signer');
            }
          } else {
            console.warn('❌ No ethereum provider found in window object');
            console.log('Available providers:', Object.keys(window).filter(key => key.includes('ethereum') || key.includes('wallet')));
            setSigner(null);
            setConnectionError('No ethereum provider available');
          }
        } catch (error) {
          console.error('❌ Failed to create signer from account:', error);
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
          setSigner(null);
          setConnectionError(`Failed to create signer: ${error.message}`);
        }
      } else {
        console.log('Signer creation conditions not met:');
        console.log('- Account:', !!account);
        console.log('- Wallet:', !!wallet);
        console.log('- Is Connected:', isConnected);
        console.log('- Is Correct Network:', isCorrectNetwork);
        console.log('- Provider:', !!provider);
        setSigner(null);
      }
    };

    createSignerFromAccount();
  }, [account, wallet, isConnected, isCorrectNetwork, provider]);

  // Alternative signer creation method for Thirdweb compatibility
  useEffect(() => {
    const createThirdwebCompatibleSigner = async () => {
      if (account && wallet && isConnected && isCorrectNetwork) {
        try {
          console.log('Attempting Thirdweb-compatible signer creation...');
          
          // Method 1: Try to get signer from wallet adapter
          if (wallet.getChain && wallet.switchChain) {
            try {
              // Ensure we're on the correct chain
              const currentChain = await wallet.getChain();
              if (currentChain.id !== CORE_CHAIN_ID) {
                console.log('Switching to correct chain...');
                await wallet.switchChain({
                  id: CORE_CHAIN_ID,
                  name: "Core Testnet",
                  rpc: THIRDWEB_RPC_URL,
                  nativeCurrency: {
                    name: "TCORE2",
                    symbol: "TCORE2",
                    decimals: 18
                  }
                });
              }
            } catch (chainError) {
              console.warn('Chain switch failed:', chainError);
            }
          }

          // Method 2: Try EIP-1193 provider approach
          if (typeof window !== 'undefined' && window.ethereum) {
            console.log('Trying EIP-1193 provider approach...');
            
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Create provider and signer
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await web3Provider.getSigner();
            
            // Verify network
            const network = await web3Provider.getNetwork();
            console.log('Current network:', network.chainId);
            
            if (Number(network.chainId) === CORE_CHAIN_ID) {
              setSigner(signer);
              setConnectionError(null);
              console.log('✅ EIP-1193 signer created successfully');
              return;
            } else {
              console.warn('Wrong network detected:', network.chainId, 'expected:', CORE_CHAIN_ID);
              setNetworkError(`Wrong network. Expected chain ID: ${CORE_CHAIN_ID}, got: ${network.chainId}`);
            }
          }

          // Method 3: Direct provider connection (fallback)
          if (provider) {
            console.log('Using read-only provider as fallback...');
            // This won't allow transactions but will allow contract reads
            setConnectionError('Connected in read-only mode. Some features may be limited.');
          }

        } catch (error) {
          console.error('All signer creation methods failed:', error);
          setConnectionError(`Signer creation failed: ${error.message}`);
        }
      }
    };

    // Run alternative method if primary method fails
    if (isConnected && !signer && !connectionError?.includes('No ethereum provider')) {
      createThirdwebCompatibleSigner();
    }
  }, [account, wallet, isConnected, isCorrectNetwork, provider, signer, connectionError]);

  useEffect(() => {
    const fetchNativeBalance = async () => {
      if (provider && address && isConnected && isCorrectNetwork) {
        try {
          const balance = await provider.getBalance(address);
          setNativeBalance(ethers.formatEther(balance));
        } catch (error) {
          console.error('Failed to fetch native balance:', error);
          setNativeBalance('0');
        }
      } else {
        setNativeBalance('0');
      }
    };

    fetchNativeBalance();
  }, [provider, address, isConnected, isCorrectNetwork]);

  // Enhanced effect to handle network changes with automatic switching
  useEffect(() => {
    const handleNetworkChange = async () => {
      if (isConnected && activeChain?.id && activeChain.id !== CORE_CHAIN_ID) {
        console.log(`Wrong network detected: ${activeChain.id}, expected: ${CORE_CHAIN_ID}`);
        
        // Show network error immediately
        setNetworkError(`Connected to wrong network. Please switch to Core Testnet (Chain ID: ${CORE_CHAIN_ID}) or click the switch button.`);
        
        // Optionally try to switch automatically (uncomment if you want auto-switch)
        // const switched = await switchToMorphNetwork();
        // if (switched) {
        //   setNetworkError(null);
        // }
      } else if (isConnected && isCorrectNetwork) {
        setNetworkError(null);
      }
    };

    handleNetworkChange();
  }, [activeChain?.id, isConnected, isCorrectNetwork]);

  // Effect to clear state when disconnected
  useEffect(() => {
    if (!isConnected) {
      setConnectionError(null);
      setNetworkError(null);
      setSigner(null);
      setNativeBalance('0');
    }
  }, [isConnected]);

  // Fetch balance function
  const fetchBalance = async (faucetAddress: string): Promise<string | undefined> => {
    try {
      if (!address || !isConnected || !isCorrectNetwork || !provider) {
        throw new Error('Wallet not connected, wrong network, or provider not available');
      }

      const token = tokens.find(token => token.address === faucetAddress);
      if (!token) {
        throw new Error('Token not found');
      }

      // Check if it's the native token
      if (token.symbol === 'TCORE2') {
        return nativeBalance || '0';
      }

      // Special case for AFX token
      if (token.symbol === 'AFX') {
        const AFRI_CONTRACT = await AFRISTABLE_CONTRACT_INSTANCE();
        if (!AFRI_CONTRACT) {
          throw new Error('Unable to create AFX token contract instance');
        }
        const balance = await AFRI_CONTRACT.balanceOf(address);
        const formattedBalance = ethers.formatEther(balance);
        return formattedBalance;
      }

      // For other ERC20 tokens
      const TOKEN_CONTRACT = await TEST_TOKEN_CONTRACT_INSTANCE(faucetAddress);
      if (!TOKEN_CONTRACT) {
        throw new Error('Unable to create token contract instance');
      }
      const balance = await TOKEN_CONTRACT.balanceOf(address);
      const formattedBalance = ethers.formatEther(balance);
      return formattedBalance;

    } catch (error) {
      console.error('Error fetching balance:', error);
      return undefined;
    }
  };

  // Contract instance functions with Thirdweb RPC provider
  const SWAP_CONTRACT_INSTANCE = async (): Promise<ethers.Contract | null> => {
    if (!provider || !isConnected || !isCorrectNetwork) {
      console.warn('Provider not available, wallet not connected, or wrong network.');
      return null;
    }
    
    // Use signer if available for write operations, otherwise use provider for read-only
    const signerOrProvider = signer || provider;
    return new ethers.Contract(CONTRACT_ADDRESSES.swapAddress, SWAP_ABI, signerOrProvider);
  };

  const PRICEAPI_CONTRACT_INSTANCE = async (): Promise<ethers.Contract | null> => {
    if (!provider || !isConnected || !isCorrectNetwork) {
      console.warn('Provider not available, wallet not connected, or wrong network.');
      return null;
    }
    
    const signerOrProvider = signer || provider;
    return new ethers.Contract(CONTRACT_ADDRESSES.priceFeedAddress, PRICE_ABI, signerOrProvider);
  };

  const TEST_TOKEN_CONTRACT_INSTANCE = async (TOKEN_ADDRESS: string): Promise<ethers.Contract | null> => {
    if (!provider || !isConnected || !isCorrectNetwork) {
      console.warn('Provider not available, wallet not connected, or wrong network.');
      return null;
    }
    
    const signerOrProvider = signer || provider;
    return new ethers.Contract(TOKEN_ADDRESS, Token_ABI, signerOrProvider);
  };

  const AFRISTABLE_CONTRACT_INSTANCE = async (): Promise<ethers.Contract | null> => {
    if (!provider || !isConnected || !isCorrectNetwork) {
      console.warn('Provider not available, wallet not connected, or wrong network.');
      return null;
    }
    
    const signerOrProvider = signer || provider;
    return new ethers.Contract(CONTRACT_ADDRESSES.afriStableAddress, AfriStable_ABI, signerOrProvider);
  };

  const SAVING_CONTRACT_INSTANCE = async (): Promise<ethers.Contract | null> => {
    if (!provider || !isConnected || !isCorrectNetwork) {
      console.warn('Provider not available, wallet not connected, or wrong network.');
      return null;
    }
    
    const signerOrProvider = signer || provider;
    return new ethers.Contract(CONTRACT_ADDRESSES.savingAddress, Saving_ABI, signerOrProvider);
  };


   const LENDING_CONTRACT_INSTANCE = async (): Promise<ethers.Contract | null> => {
    if (!provider || !isConnected || !isCorrectNetwork) {
      console.warn('Provider not available, wallet not connected, or wrong network.');
      return null;
    }
    
    const signerOrProvider = signer || provider;
    return new ethers.Contract(CONTRACT_ADDRESSES.lendingProtocolAddress, Lending_ABI, signerOrProvider);
  };

  const YIELD_CONTRACT_INSTANCE = async (): Promise<ethers.Contract | null> => {
    if (!provider || !isConnected || !isCorrectNetwork) {   

      console.warn('Provider not available, wallet not connected, or wrong network.');
      return null;
    }
        const signerOrProvider = signer || provider;
    return new ethers.Contract(CONTRACT_ADDRESSES.yieldVaultAddress, yieldVault_ABI, signerOrProvider);
  }


     const MOCK_BTC_CONTRACT_INSTANCE = async (): Promise<ethers.Contract | null> => {
    if (!provider || !isConnected || !isCorrectNetwork) {
      console.warn('Provider not available, wallet not connected, or wrong network.');
      return null;
    }
    

    
    const signerOrProvider = signer || provider;
    return new ethers.Contract(CONTRACT_ADDRESSES.mockBtcAddress, MockBTC_ABI, signerOrProvider);
  };


  
     const LST_BTC_CONTRACT_INSTANCE = async (): Promise<ethers.Contract | null> => {
    if (!provider || !isConnected || !isCorrectNetwork) {
      console.warn('Provider not available, wallet not connected, or wrong network.');
      return null;
    }
    

    
    const signerOrProvider = signer || provider;
    return new ethers.Contract(CONTRACT_ADDRESSES.lstBTCAddress, LST_BTC_ABI, signerOrProvider);
  };


  // Manual reconnection function
  const reconnectSigner = async (): Promise<void> => {
    try {
      console.log('Manual signer reconnection initiated...');
      setConnectionError(null);
      
      if (!isConnected) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      if (!isCorrectNetwork) {
        throw new Error(`Wrong network. Please switch to chain ID: ${CORE_CHAIN_ID}`);
      }

      // Force reconnection
      if (window.ethereum) {
        // Request account access again
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts.length === 0) {
          throw new Error('No accounts available');
        }

        // Create fresh provider and signer
        const freshProvider = new ethers.BrowserProvider(window.ethereum);
        const freshSigner = await freshProvider.getSigner();
        
        // Verify the address
        const signerAddress = await freshSigner.getAddress();
        if (account && signerAddress.toLowerCase() === account.address.toLowerCase()) {
          setSigner(freshSigner);
          console.log('✅ Manual signer reconnection successful');
        } else {
          throw new Error('Address mismatch after reconnection');
        }
      } else {
        throw new Error('Ethereum provider not available');
      }
    } catch (error) {
      console.error('Manual reconnection failed:', error);
      setConnectionError(`Manual reconnection failed: ${error.message}`);
      throw error;
    }
  };

  const contextValue: ContractInstancesContextType = {
    fetchBalance,
    SWAP_CONTRACT_INSTANCE,
    AFRISTABLE_CONTRACT_INSTANCE,
    TEST_TOKEN_CONTRACT_INSTANCE,
    PRICEAPI_CONTRACT_INSTANCE,
    SAVING_CONTRACT_INSTANCE,
    LENDING_CONTRACT_INSTANCE,
    MOCK_BTC_CONTRACT_INSTANCE,
    LST_BTC_CONTRACT_INSTANCE,
    YIELD_CONTRACT_INSTANCE,
    signer,
    provider,
    address,
    nativeBalance,
    tokenList: tokens,
    isConnected,
    isCorrectNetwork,
    networkError,
    connectionError,
    reconnectSigner,
    switchToMorphNetwork,
  };

  return (
    <ContractInstances.Provider value={contextValue}>
      {children}
    </ContractInstances.Provider>
  );
};

export default ContractInstanceProvider;

// Custom hook to use the context
export const useContractInstances = (): ContractInstancesContextType => {
  const context = React.useContext(ContractInstances);
  if (context === undefined) {
    throw new Error('useContractInstances must be used within a ContractInstanceProvider');
  }
  return context;
};