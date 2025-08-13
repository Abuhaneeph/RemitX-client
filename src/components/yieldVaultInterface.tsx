import React, { useState, useEffect } from 'react';
import { useContractInstances } from '@/provider/ContractInstanceProvider';
import { 
  Vault, 
  Settings, 
  Info, 
  X, 
  Coins, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  DollarSign,
  Plus,
  Minus,
  Eye,
  Zap,
  Clock,
  Percent,
  Target,
  Trophy,
  ArrowRightLeft,
  PieChart,
  Activity
} from 'lucide-react';
import tokens from '@/lib/Tokens/tokens';
import { CONTRACT_ADDRESSES } from '@/provider/ContractInstanceProvider';
import { ethers, formatEther, parseEther } from 'ethers';

// Interface for user vault data
interface UserVaultData {
  depositedWBTC: string;
  depositedLSTValue: string;
  lstBTCBalance: string;
  yieldEarned: string;
  vaultShares: string;
  pendingYield: string;
}

// Interface for vault metrics
interface VaultMetrics {
  totalManaged: string;
  totalYield: string;
  totalUsers: string;
  currentAPY: string;
  totalValueLocked: string;
}

// Interface for supported LST
interface SupportedLST {
  address: string;
  symbol: string;
  name: string;
  img: string;
}

const YieldVaultInterface = () => {
  const { 
    isConnected, 
    YIELD_CONTRACT_INSTANCE,
    MOCK_BTC_CONTRACT_INSTANCE, 
    TEST_TOKEN_CONTRACT_INSTANCE, 
    PRICEAPI_CONTRACT_INSTANCE,
    fetchBalance, 
    address 
  } = useContractInstances();

  const [activeTab, setActiveTab] = useState('deposit');
  const [showSettings, setShowSettings] = useState(false);
  
  // Contract addresses
  const MOCK_BTC_ADDRESS = CONTRACT_ADDRESSES.mockBtcAddress;
  const YIELD_VAULT_ADDRESS = CONTRACT_ADDRESSES.yieldVaultAddress; // Assuming this is added to your contract addresses
  
  // Deposit states
  const [wbtcAmount, setWbtcAmount] = useState('');
  const [lstToken, setLstToken] = useState('');
  const [lstAmount, setLstAmount] = useState('');
  const [isDepositingWBTC, setIsDepositingWBTC] = useState(false);
  const [isDepositingLST, setIsDepositingLST] = useState(false);
  const [hasWBTCApproved, setHasWBTCApproved] = useState(false);
  const [hasLSTApproved, setHasLSTApproved] = useState(false);
  const [isApprovingWBTC, setIsApprovingWBTC] = useState(false);
  const [isApprovingLST, setIsApprovingLST] = useState(false);
  
  // Withdraw states
  const [withdrawShares, setWithdrawShares] = useState('');
  const [outputToken, setOutputToken] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  // Yield states
  const [isClaimingYield, setIsClaimingYield] = useState(false);
  const [isDistributingYield, setIsDistributingYield] = useState(false);
  
  // User data states
  const [userVaultData, setUserVaultData] = useState<UserVaultData>({
    depositedWBTC: '0',
    depositedLSTValue: '0',
    lstBTCBalance: '0',
    yieldEarned: '0',
    vaultShares: '0',
    pendingYield: '0'
  });
  
  const [vaultMetrics, setVaultMetrics] = useState<VaultMetrics>({
    totalManaged: '0',
    totalYield: '0',
    totalUsers: '0',
    currentAPY: '0',
    totalValueLocked: '0'
  });
  
  const [wbtcBalance, setWbtcBalance] = useState('0');
  const [tokenBalances, setTokenBalances] = useState<{[key: string]: string}>({});
  const [prices, setPrices] = useState<{[key: string]: string}>({});
  const [supportedLSTs, setSupportedLSTs] = useState<SupportedLST[]>([]);
  const [conversionRates, setConversionRates] = useState<{[key: string]: string}>({});





 

  // Fetch WBTC balance
  const fetchWBTCBalance = async () => {
    if (!isConnected || !address) return;
    
    try {
      const mockBtcContract = await MOCK_BTC_CONTRACT_INSTANCE();
      if (mockBtcContract) {
        const balance = await mockBtcContract.balanceOf(address);
        const formattedBalance = formatEther(balance);
        const roundedBalance = Math.round(parseFloat(formattedBalance) * 10000) / 10000;
        setWbtcBalance(roundedBalance.toString());
      }
    } catch (error) {
      console.error('Error fetching WBTC balance:', error);
      setWbtcBalance('0');
    }
  };

  // Fetch token balances for LSTs
  const fetchTokenBalances = async () => {
    if (!isConnected || !address) return;
    
    const balances: {[key: string]: string} = {};
    
    for (const lst of supportedLSTs) {
      try {
        const balance = await fetchBalance(lst.address);
        balances[lst.symbol] = balance.toString();
      } catch (error) {
        console.error(`Error fetching ${lst.symbol} balance:`, error);
        balances[lst.symbol] = '0';
      }
    }
    
    setTokenBalances(balances);
  };

  // Fetch user vault information
  const fetchUserVaultInfo = async () => {
    if (!isConnected || !address) return;
    
    try {
      const yieldContract = await YIELD_CONTRACT_INSTANCE();
      if (yieldContract) {
        const vaultInfo = await yieldContract.getUserVaultInfo(address);
        console.log('User Vault Info:', vaultInfo);
        setUserVaultData({
          depositedWBTC: formatEther(vaultInfo.depositedWBTC),
          depositedLSTValue: formatEther(vaultInfo.depositedLSTValue),
          lstBTCBalance: formatEther(vaultInfo.lstBTCBalance),
          yieldEarned: formatEther(vaultInfo.yieldEarned),
          vaultShares: formatEther(vaultInfo.vaultShares),
          pendingYield: formatEther(vaultInfo.pendingYield)
        });
      }
    } catch (error) {
      console.error('Error fetching user vault info:', error);
    }
  };

  // Fetch vault metrics
  const fetchVaultMetrics = async () => {
    if (!isConnected) return;
    
    try {
      const yieldContract = await YIELD_CONTRACT_INSTANCE();
      if (yieldContract) {
        const metrics = await yieldContract.getVaultMetrics();
        
        setVaultMetrics({
          totalManaged: formatEther(metrics.totalManaged),
          totalYield: formatEther(metrics.totalYield),
          totalUsers: metrics.totalUsers.toString(),
          currentAPY: (parseFloat(formatEther(metrics.currentAPY)) / 100).toFixed(2), // Convert from basis points
          totalValueLocked: formatEther(metrics.totalValueLocked)
        });
      }
    } catch (error) {
      console.error('Error fetching vault metrics:', error);
    }
  };

  // Fetch supported LSTs
  const fetchSupportedLSTs = async () => {
    if (!isConnected) return;
    
    try {
      const yieldContract = await YIELD_CONTRACT_INSTANCE();
      if (yieldContract) {
        const lstAddresses = await yieldContract.getSupportedLSTs();
        const lsts: SupportedLST[] = [];
        
        for (const lstAddress of lstAddresses) {
          const token = tokens.find(t => t.address.toLowerCase() === lstAddress.toLowerCase());
          if (token && token.symbol !== 'BTC') {
            lsts.push({
              address: lstAddress,
              symbol: token.symbol,
              name: token.name,
              img: token.img
            });
          }
        }
        
        setSupportedLSTs(lsts);
        
        // Set default LST token if none selected
        if (lsts.length > 0 && !lstToken) {
          setLstToken(lsts[0].address);
        }
        if (lsts.length > 0 && !outputToken) {
          setOutputToken(lsts[0].address);
        }
      }
    } catch (error) {
      console.error('Error fetching supported LSTs:', error);
    }
  };

  // Fetch prices from oracle
  const fetchPrices = async () => {
    try {
      const priceContract = await PRICEAPI_CONTRACT_INSTANCE();
      if (priceContract) {
        const priceData: {[key: string]: string} = {};
        
        // Fetch WBTC price
        const wbtcPrice = await priceContract.getLatestPrice(MOCK_BTC_ADDRESS);
        priceData['WBTC'] = formatEther(wbtcPrice);
        
        // Fetch LST prices
        for (const lst of supportedLSTs) {
          try {
            const price = await priceContract.getLatestPrice(lst.address);
            priceData[lst.symbol] = formatEther(price);
          } catch (error) {
            priceData[lst.symbol] = '1';
          }
        }
        
        setPrices(priceData);
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  // Fetch conversion rates
  const fetchConversionRates = async () => {
    if (!isConnected) return;
    
    try {
      const yieldContract = await YIELD_CONTRACT_INSTANCE();
      if (yieldContract) {
        const rates: {[key: string]: string} = {};
        
        // Get WBTC to lstBTC rate
        const wbtcRate = await yieldContract.getConversionRate(MOCK_BTC_ADDRESS, CONTRACT_ADDRESSES.lstBTCAddress);
        rates['WBTC'] = formatEther(wbtcRate);
        
        // Get LST to lstBTC rates
        for (const lst of supportedLSTs) {
          try {
            const rate = await yieldContract.getConversionRate(lst.address, CONTRACT_ADDRESSES.lstBTCAddress);
            rates[lst.symbol] = formatEther(rate);
          } catch (error) {
            rates[lst.symbol] = '1';
          }
        }
        
        setConversionRates(rates);
      }
    } catch (error) {
      console.error('Error fetching conversion rates:', error);
    }
  };

  // useEffect hooks
  useEffect(() => {
    if (isConnected && address) {
      fetchSupportedLSTs();
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (isConnected && address && supportedLSTs.length > 0) {
      fetchWBTCBalance();
      fetchTokenBalances();
      fetchUserVaultInfo();
      fetchVaultMetrics();
      fetchPrices();
      fetchConversionRates();
    }
  }, [isConnected, address, supportedLSTs, isDepositingWBTC, isDepositingLST, isWithdrawing, isClaimingYield]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (isConnected && address) {
      const interval = setInterval(() => {
        fetchUserVaultInfo();
        fetchVaultMetrics();
        fetchPrices();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isConnected, address]);

  // Contract interaction functions

  // Approve WBTC
  const approveWBTC = async () => {
    if (!wbtcAmount || parseFloat(wbtcAmount) <= 0) return;
    
    try {
      setIsApprovingWBTC(true);
      const mockBtcContract = await MOCK_BTC_CONTRACT_INSTANCE();
      const amountInWei = parseEther(wbtcAmount);
      
      const approveTx = await mockBtcContract.approve(YIELD_VAULT_ADDRESS, amountInWei);
      console.log(`Approving WBTC - ${approveTx.hash}`);
      
      await approveTx.wait();
      console.log(`WBTC Approved - ${approveTx.hash}`);
      
      setHasWBTCApproved(true);
    } catch (error) {
      console.error('Error approving WBTC:', error);
    } finally {
      setIsApprovingWBTC(false);
    }
  };

  // Deposit WBTC
  const depositWBTC = async () => {
    if (!wbtcAmount || parseFloat(wbtcAmount) <= 0) return;
    
    try {
      setIsDepositingWBTC(true);
      const yieldContract = await YIELD_CONTRACT_INSTANCE();
      const amountInWei = parseEther(wbtcAmount);
      
      const depositTx = await yieldContract.depositWBTC(amountInWei);
      console.log(`Depositing WBTC - ${depositTx.hash}`);
      
      await depositTx.wait();
      console.log(`WBTC Deposited - ${depositTx.hash}`);
      
      setWbtcAmount('');
      setHasWBTCApproved(false);
    } catch (error) {
      console.error('Error depositing WBTC:', error);
    } finally {
      setIsDepositingWBTC(false);
    }
  };

  // Approve LST
  const approveLST = async () => {
    if (!lstAmount || parseFloat(lstAmount) <= 0 || !lstToken) return;
    
    try {
      setIsApprovingLST(true);
      const tokenContract = await TEST_TOKEN_CONTRACT_INSTANCE(lstToken);
      const amountInWei = parseEther(lstAmount);
      
      const approveTx = await tokenContract.approve(YIELD_VAULT_ADDRESS, amountInWei);
      console.log(`Approving LST - ${approveTx.hash}`);
      
      await approveTx.wait();
      console.log(`LST Approved - ${approveTx.hash}`);
      
      setHasLSTApproved(true);
    } catch (error) {
      console.error('Error approving LST:', error);
    } finally {
      setIsApprovingLST(false);
    }
  };

  // Deposit LST
  const depositLST = async () => {
    if (!lstAmount || parseFloat(lstAmount) <= 0 || !lstToken) return;
    
    try {
      setIsDepositingLST(true);
      const yieldContract = await YIELD_CONTRACT_INSTANCE();
      const amountInWei = parseEther(lstAmount);
      console.log(`Depositing LST - ${lstToken} - Amount: ${amountInWei.toString()}`);
      
      const depositTx = await yieldContract.depositLST(lstToken, amountInWei);
      console.log(`Depositing LST - ${depositTx.hash}`);
      
      await depositTx.wait();
      console.log(`LST Deposited - ${depositTx.hash}`);
      
      setLstAmount('');
      setHasLSTApproved(false);
    } catch (error) {
      console.error('Error depositing LST:', error);
    } finally {
      setIsDepositingLST(false);
    }
  };

  // Withdraw from vault
  const withdrawFromVault = async () => {
    if (!withdrawShares || parseFloat(withdrawShares) <= 0 || !outputToken) return;
    
    try {
      setIsWithdrawing(true);
      const yieldContract = await YIELD_CONTRACT_INSTANCE();
      const sharesInWei = parseEther(withdrawShares);
      
      const withdrawTx = await yieldContract.requestWithdrawal(sharesInWei, outputToken);
      console.log(`Withdrawing from vault - ${withdrawTx.hash}`);
      
      await withdrawTx.wait();
      console.log(`Withdrawal completed - ${withdrawTx.hash}`);
      
      setWithdrawShares('');
    } catch (error) {
      console.error('Error withdrawing from vault:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Claim yield
  const claimYield = async () => {
    try {
      setIsClaimingYield(true);
      const yieldContract = await YIELD_CONTRACT_INSTANCE();
      
      const claimTx = await yieldContract.claimYield();
      console.log(`Claiming yield - ${claimTx.hash}`);
      
      await claimTx.wait();
      console.log(`Yield claimed - ${claimTx.hash}`);
    } catch (error) {
      console.error('Error claiming yield:', error);
    } finally {
      setIsClaimingYield(false);
    }
  };

  // Distribute yield (anyone can call)
  const distributeYield = async () => {
    try {
      setIsDistributingYield(true);
      const yieldContract = await YIELD_CONTRACT_INSTANCE();
      
      const distributeTx = await yieldContract.distributeYield();
      console.log(`Distributing yield - ${distributeTx.hash}`);
      
      await distributeTx.wait();
      console.log(`Yield distributed - ${distributeTx.hash}`);
    } catch (error) {
      console.error('Error distributing yield:', error);
    } finally {
      setIsDistributingYield(false);
    }
  };

  // Helper functions
  const formatNumber = (value: string, decimals: number = 4) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0' : num.toFixed(decimals);
  };

  const formatAPY = (apy: string) => {
    const apyNumber = parseFloat(apy);
    return isNaN(apyNumber) ? '0.00%' : apyNumber.toFixed(2) + '%';
  };

  const getSelectedLST = () => {
    return supportedLSTs.find(lst => lst.address === lstToken);
  };

  const getOutputToken = () => {
    if (outputToken === MOCK_BTC_ADDRESS) return { symbol: 'WBTC', name: 'Wrapped Bitcoin' };
    return supportedLSTs.find(lst => lst.address === outputToken) || { symbol: 'Unknown', name: 'Unknown Token' };
  };

  // Render functions
  const renderDepositTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Deposit Assets</h3>
        <p className="text-stone-600 text-sm mb-6">
          Deposit WBTC or supported LSTs to earn yield through automated lstBTC conversion and staking.
        </p>
      </div>

      {/* Deposit Type Selection */}
      <div className="flex space-x-1 bg-stone-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('deposit-wbtc')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'deposit-wbtc'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          WBTC Deposit
        </button>
        <button
          onClick={() => setActiveTab('deposit-lst')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'deposit-lst'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          LST Deposit
        </button>
      </div>

      {/* WBTC Deposit Form */}
      {activeTab === 'deposit-wbtc' && (
        <div className="space-y-4">
          <div className="bg-stone-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-stone-600 text-sm">WBTC Amount</span>
              <span className="text-stone-500 text-sm">Balance: {formatNumber(wbtcBalance)} WBTC</span>
            </div>

            <div className="flex items-center justify-between">
              <input
                type="text"
                value={wbtcAmount}
                onChange={(e) => setWbtcAmount(e.target.value)}
                className="w-32 text-2xl font-semibold bg-transparent border-none outline-none"
                placeholder="0.0"
                disabled={!isConnected}
              />
              
              <div className="flex items-center space-x-2">
                <img src="/btc.png" alt="WBTC" className="w-8 h-8 rounded-full" />
                <span className="font-medium">WBTC</span>
              </div>
            </div>

            <button 
              onClick={() => setWbtcAmount(wbtcBalance)}
              className="text-terracotta text-sm mt-2 hover:underline"
              disabled={!isConnected}
            >
              Max
            </button>
          </div>

          {/* WBTC Deposit Preview */}
          {wbtcAmount && conversionRates.WBTC && (
            <div className="p-4 bg-stone-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-3">
                <Info className="w-4 h-4 text-stone-500" />
                <span className="text-stone-600 text-sm font-medium">Deposit Preview</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-600">lstBTC to Receive</span>
                  <span className="font-medium">{(parseFloat(wbtcAmount) * parseFloat(conversionRates.WBTC)).toFixed(6)} lstBTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Current APY</span>
                  <span className="font-medium text-green-600">{formatAPY(vaultMetrics.currentAPY)}</span>
                </div>
                {prices.WBTC && (
                  <div className="flex justify-between">
                    <span className="text-stone-600">USD Value</span>
                    <span className="font-medium">${(parseFloat(wbtcAmount) * parseFloat(prices.WBTC)).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WBTC Approve & Deposit Buttons */}
          <div className="space-y-3">
            {!hasWBTCApproved && (
              <button
                onClick={approveWBTC}
                disabled={!wbtcAmount || parseFloat(wbtcAmount) <= 0 || isApprovingWBTC || !isConnected}
                className="w-full bg-gradient-to-r from-terracotta to-sage text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApprovingWBTC ? 'Approving...' : 'Approve WBTC'}
              </button>
            )}

            <button
              onClick={depositWBTC}
              disabled={!hasWBTCApproved || !wbtcAmount || parseFloat(wbtcAmount) <= 0 || isDepositingWBTC || !isConnected}
              className="w-full bg-gradient-to-r from-terracotta to-sage text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDepositingWBTC ? 'Depositing...' : hasWBTCApproved ? 'Deposit WBTC' : '✓ Approved - Click to Deposit'}
            </button>
          </div>
        </div>
      )}

      {/* LST Deposit Form */}
      {activeTab === 'deposit-lst' && (
        <div className="space-y-4">
          <div className="bg-stone-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-stone-600 text-sm">LST Amount</span>
              <span className="text-stone-500 text-sm">
                Balance: {formatNumber(tokenBalances[getSelectedLST()?.symbol || ''] || '0')} {getSelectedLST()?.symbol}
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                value={lstAmount}
                onChange={(e) => setLstAmount(e.target.value)}
                className="w-32 text-2xl font-semibold bg-transparent border-none outline-none"
                placeholder="0.0"
                disabled={!isConnected}
              />
              
           <select
  value={lstToken}
  onChange={(e) => {
    setLstToken(e.target.value);
    setHasLSTApproved(false);
  }}
  className="bg-white border border-stone-300 rounded-lg px-3 py-2 font-medium min-w-[120px]"
  disabled={!isConnected}
>
  {supportedLSTs
    .filter(lst => lst.symbol !== 'WBTC') // 🚫 exclude WBTC
    .map(lst => (
      <option key={lst.address} value={lst.address}>
        {lst.symbol}
      </option>
    ))}
</select>

            </div>

            <button 
              onClick={() => {
                const selectedLST = getSelectedLST();
                if (selectedLST) {
                  setLstAmount(tokenBalances[selectedLST.symbol] || '0');
                }
              }}
              className="text-terracotta text-sm hover:underline"
              disabled={!isConnected}
            >
              Max
            </button>
          </div>

          {/* LST Deposit Preview */}
          {lstAmount && lstToken && conversionRates[getSelectedLST()?.symbol || ''] && (
            <div className="p-4 bg-stone-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-3">
                <Info className="w-4 h-4 text-stone-500" />
                <span className="text-stone-600 text-sm font-medium">Deposit Preview</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-600">lstBTC to Receive</span>
                  <span className="font-medium">
                    {(parseFloat(lstAmount) * parseFloat(conversionRates[getSelectedLST()?.symbol || ''] || '1')).toFixed(6)} lstBTC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Current APY</span>
                  <span className="font-medium text-green-600">{formatAPY(vaultMetrics.currentAPY)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Conversion Rate</span>
                  <span className="font-medium">{formatNumber(conversionRates[getSelectedLST()?.symbol || ''] || '1', 6)}</span>
                </div>
              </div>
            </div>
          )}

          {/* LST Approve & Deposit Buttons */}
          <div className="space-y-3">
            {!hasLSTApproved && (
              <button
                onClick={approveLST}
                disabled={!lstAmount || parseFloat(lstAmount) <= 0 || isApprovingLST || !isConnected || !lstToken}
                className="w-full bg-gradient-to-r from-terracotta to-sage text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApprovingLST ? 'Approving...' : `Approve ${getSelectedLST()?.symbol}`}
              </button>
            )}

            <button
              onClick={depositLST}
              disabled={!hasLSTApproved || !lstAmount || parseFloat(lstAmount) <= 0 || isDepositingLST || !isConnected || !lstToken}
              className="w-full bg-gradient-to-r from-terracotta to-sage text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDepositingLST ? 'Depositing...' : hasLSTApproved ? `Deposit ${getSelectedLST()?.symbol}` : `✓ ${getSelectedLST()?.symbol} Approved - Click to Deposit`}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderWithdrawTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Withdraw Assets</h3>
        <p className="text-stone-600 text-sm mb-6">
          Withdraw your vault shares and receive your preferred token.
        </p>
      </div>

      {/* Vault Shares Balance */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <Vault className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-blue-800">Your Vault Shares</span>
        </div>
        <p className="text-2xl font-bold text-blue-800">{formatNumber(userVaultData.vaultShares)} yLSTBTC</p>
        <p className="text-sm text-blue-600">≈ {formatNumber(userVaultData.lstBTCBalance)} lstBTC</p>
      </div>

      {/* Withdraw Form */}
      <div className="bg-stone-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-stone-600 text-sm">Withdraw Shares</span>
          <span className="text-stone-500 text-sm">
            Available: {formatNumber(userVaultData.vaultShares)} yLSTBTC
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={withdrawShares}
            onChange={(e) => setWithdrawShares(e.target.value)}
            className="w-32 text-2xl font-semibold bg-transparent border-none outline-none"
            placeholder="0.0"
            disabled={!isConnected}
          />
          
          <div className="flex items-center space-x-2">
            <Vault className="w-8 h-8 text-terracotta" />
            <span className="font-medium">yLSTBTC</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-stone-600 text-sm mb-2 block">Output Token</label>
  <select
  value={outputToken}
  onChange={(e) => setOutputToken(e.target.value)}
  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 font-medium"
  disabled={!isConnected}
>
  <option value={MOCK_BTC_ADDRESS}>WBTC</option>
  {supportedLSTs
    .filter(lst => lst.symbol !== 'WBTC') // 🚫 exclude WBTC
    .map(lst => (
      <option key={lst.address} value={lst.address}>
        {lst.symbol}
      </option>
    ))}
</select>

        </div>

        <div className="flex space-x-2">
          <button 
            onClick={() => setWithdrawShares(userVaultData.vaultShares)}
            className="text-terracotta text-sm hover:underline"
            disabled={!isConnected}
          >
            Max
          </button>
          <button 
            onClick={() => setWithdrawShares((parseFloat(userVaultData.vaultShares) / 2).toString())}
            className="text-blue-600 text-sm hover:underline"
            disabled={!isConnected}
          >
            50%
          </button>
          <button 
            onClick={() => setWithdrawShares((parseFloat(userVaultData.vaultShares) * 0.25).toString())}
            className="text-green-600 text-sm hover:underline"
            disabled={!isConnected}
          >
            25%
          </button>
        </div>
      </div>

      {/* Withdrawal Preview */}
      {withdrawShares && outputToken && (
        <div className="p-4 bg-stone-50 rounded-xl">
          <div className="flex items-center space-x-2 mb-3">
            <Info className="w-4 h-4 text-stone-500" />
            <span className="text-stone-600 text-sm font-medium">Withdrawal Preview</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-600">lstBTC Equivalent</span>
              <span className="font-medium">
                {(parseFloat(withdrawShares) * parseFloat(userVaultData.lstBTCBalance) / parseFloat(userVaultData.vaultShares)).toFixed(6)} lstBTC
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Output Token</span>
              <span className="font-medium">{getOutputToken().symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Estimated Output</span>
              <span className="font-medium">
                ~{(parseFloat(withdrawShares) * parseFloat(userVaultData.lstBTCBalance) / parseFloat(userVaultData.vaultShares) * 
                  parseFloat(conversionRates[getOutputToken().symbol] || '1')).toFixed(6)} {getOutputToken().symbol}
              </span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={withdrawFromVault}
        disabled={!withdrawShares || parseFloat(withdrawShares) <= 0 || isWithdrawing || !isConnected || !outputToken}
        className="w-full bg-gradient-to-r from-terracotta to-sage text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isWithdrawing ? 'Withdrawing...' : `Withdraw as ${getOutputToken().symbol}`}
      </button>
    </div>
  );

  const renderYieldTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Yield Management</h3>
        <p className="text-stone-600 text-sm mb-6">
          Manage your earned yield and participate in yield distribution.
        </p>
      </div>

      {/* Yield Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <Trophy className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">Earned Yield</span>
          </div>
          <p className="text-2xl font-bold text-green-800">{formatNumber(userVaultData.yieldEarned)} lstBTC</p>
        </div>

        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="font-semibold text-orange-800">Pending Yield</span>
          </div>
          <p className="text-2xl font-bold text-orange-800">{formatNumber(userVaultData.pendingYield)} lstBTC</p>
        </div>
      </div>

      {/* Current APY Display */}
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-center space-x-2 mb-2">
          <Percent className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-purple-800">Current Vault APY</span>
        </div>
        <p className="text-3xl font-bold text-purple-800">{formatAPY(vaultMetrics.currentAPY)}</p>
        <p className="text-sm text-purple-600">Updated continuously based on staking rewards</p>
      </div>

      {/* Yield Actions */}
      <div className="space-y-3">
        <button
          onClick={claimYield}
          disabled={parseFloat(userVaultData.yieldEarned) <= 0 || isClaimingYield || !isConnected}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isClaimingYield ? 'Claiming Yield...' : `Claim ${formatNumber(userVaultData.yieldEarned)} lstBTC`}
        </button>

        <button
          onClick={distributeYield}
          disabled={isDistributingYield || !isConnected}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDistributingYield ? 'Distributing Yield...' : 'Trigger Yield Distribution (Anyone Can Call)'}
        </button>
      </div>

      {/* Yield Information */}
      <div className="bg-stone-50 rounded-xl p-4">
        <h4 className="font-semibold text-stone-800 mb-3">Yield Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-600">Performance Fee</span>
            <span className="font-medium">10%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-600">Management Fee</span>
            <span className="font-medium">2% Annual</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-600">Yield Source</span>
            <span className="font-medium">lstBTC Staking Rewards</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-600">Distribution Frequency</span>
            <span className="font-medium">Daily (Manual Trigger)</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboardTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Your Vault Position</h3>
        <p className="text-stone-600 text-sm mb-6">
          Overview of your deposits, shares, and yield performance.
        </p>
      </div>

      {/* Position Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-stone-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <img src="/btc.png" alt="WBTC" className="w-6 h-6 rounded-full" />
            <span className="font-medium text-stone-800">WBTC Deposited</span>
          </div>
          <p className="text-xl font-bold text-stone-800">{formatNumber(userVaultData.depositedWBTC)} WBTC</p>
          {prices.WBTC && (
            <p className="text-sm text-stone-600">${(parseFloat(userVaultData.depositedWBTC) * parseFloat(prices.WBTC)).toLocaleString()}</p>
          )}
        </div>

        <div className="bg-stone-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Coins className="w-6 h-6 text-terracotta" />
            <span className="font-medium text-stone-800">LST Value Deposited</span>
          </div>
          <p className="text-xl font-bold text-stone-800">${formatNumber(userVaultData.depositedLSTValue)}</p>
          <p className="text-sm text-stone-600">Various LST tokens</p>
        </div>
      </div>

      {/* Vault Shares & lstBTC */}
      <div className="bg-gradient-to-r from-terracotta-50 to-sage-50 rounded-xl p-4 border border-terracotta-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Vault className="w-6 h-6 text-terracotta" />
              <span className="font-medium text-stone-800">Vault Shares</span>
            </div>
            <p className="text-2xl font-bold text-terracotta">{formatNumber(userVaultData.vaultShares)} yLSTBTC</p>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-6 h-6 text-sage" />
              <span className="font-medium text-stone-800">lstBTC Balance</span>
            </div>
            <p className="text-2xl font-bold text-sage">{formatNumber(userVaultData.lstBTCBalance)} lstBTC</p>
          </div>
        </div>
      </div>

      {/* Yield Performance */}
      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
        <h4 className="font-semibold text-stone-800 mb-3 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span>Yield Performance</span>
        </h4>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-sm text-stone-600">Total Yield Earned</p>
            <p className="text-lg font-semibold text-green-600">{formatNumber(userVaultData.yieldEarned)} lstBTC</p>
          </div>
          <div>
            <p className="text-sm text-stone-600">Pending Yield</p>
            <p className="text-lg font-semibold text-orange-600">{formatNumber(userVaultData.pendingYield)} lstBTC</p>
          </div>
        </div>
        
        <div className="text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-stone-600">Current APY</span>
            <span className="font-medium text-green-600">{formatAPY(vaultMetrics.currentAPY)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-600">Total Yield (USD)</span>
            <span className="font-medium">${(parseFloat(userVaultData.yieldEarned) * 2.25).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Vault Share Breakdown */}
      <div className="bg-stone-50 rounded-xl p-4">
        <h4 className="font-semibold text-stone-800 mb-3 flex items-center space-x-2">
          <PieChart className="w-5 h-5 text-stone-600" />
          <span>Your Vault Share</span>
        </h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-600">Your Shares</span>
            <span className="font-medium">{formatNumber(userVaultData.vaultShares)} yLSTBTC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-600">Total Vault Shares</span>
            <span className="font-medium">{formatNumber(vaultMetrics.totalManaged)} yLSTBTC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-600">Your Share %</span>
            <span className="font-medium">
              {parseFloat(vaultMetrics.totalManaged) > 0 ? 
                ((parseFloat(userVaultData.vaultShares) / parseFloat(vaultMetrics.totalManaged)) * 100).toFixed(4) : '0.00'}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">lstBTC Yield Vault</h1>
        <p className="text-stone-600">Automated yield generation for Bitcoin and LSTs</p>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Please connect your wallet to use the yield vault.</span>
          </div>
        </div>
      )}

      {/* Vault Performance Alert */}
      {parseFloat(userVaultData.pendingYield) > 0.001 && (
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                You have {formatNumber(userVaultData.pendingYield)} lstBTC pending yield!
              </span>
            </div>
            <button 
              onClick={() => setActiveTab('yield')}
              className="text-green-600 hover:underline text-sm font-medium"
            >
              Claim Now
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-stone-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
            activeTab === 'deposit' || activeTab === 'deposit-wbtc' || activeTab === 'deposit-lst'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Deposit</span>
        </button>
        
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
            activeTab === 'withdraw'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Minus className="w-4 h-4" />
          <span>Withdraw</span>
        </button>
        
        <button
          onClick={() => setActiveTab('yield')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1 relative ${
            activeTab === 'yield'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Yield</span>
          {parseFloat(userVaultData.pendingYield) > 0.001 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
            activeTab === 'dashboard'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        {/* Settings */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-stone-800 capitalize">
            {activeTab.includes('deposit') ? 'Deposit' : activeTab}
          </h2>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Enhanced Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-stone-800">Vault Settings</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-1 rounded text-stone-500 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-600">Performance Fee</span>
                <span className="font-medium">10%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Management Fee</span>
                <span className="font-medium">2% Annual</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Auto-Rebalance</span>
                <span className="font-medium text-green-600">Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Rebalance Threshold</span>
                <span className="font-medium">5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Max Slippage</span>
                <span className="font-medium">1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Supported Assets</span>
                <span className="font-medium">{supportedLSTs.length + 1} tokens</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {(activeTab === 'deposit' || activeTab === 'deposit-wbtc' || activeTab === 'deposit-lst') && renderDepositTab()}
        {activeTab === 'withdraw' && renderWithdrawTab()}
        {activeTab === 'yield' && renderYieldTab()}
        {activeTab === 'dashboard' && renderDashboardTab()}
      </div>

      {/* Vault Statistics */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200">
        <h3 className="font-semibold text-stone-800 mb-3 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-terracotta" />
          <span>Vault Statistics</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-terracotta">${formatNumber(vaultMetrics.totalValueLocked)}</p>
            <p className="text-stone-600 text-sm">Total Value Locked</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-sage">{formatNumber(vaultMetrics.totalManaged)} lstBTC</p>
            <p className="text-stone-600 text-sm">Total Managed</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-stone-800">{formatAPY(vaultMetrics.currentAPY)}</p>
            <p className="text-stone-600 text-sm">Current APY</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-stone-800">{vaultMetrics.totalUsers}</p>
            <p className="text-stone-600 text-sm">Total Users</p>
          </div>
        </div>
      </div>

      {/* Supported Assets */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200">
        <h3 className="font-semibold text-stone-800 mb-3">Supported Assets</h3>
        
        <div className="space-y-3">
          {/* WBTC */}
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <img src="/btc.png" alt="WBTC" className="w-6 h-6 rounded-full" />
              <div>
                <p className="font-medium text-stone-800">WBTC</p>
                <p className="text-stone-500 text-xs">Wrapped Bitcoin</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-semibold text-stone-800">{formatNumber(conversionRates.WBTC || '1', 4)}</p>
              <p className="text-stone-500 text-xs">Conversion Rate</p>
            </div>
          </div>

        {/* Supported LSTs */}
{supportedLSTs
  .filter(lst => lst.symbol !== 'WBTC') // 🚫 exclude WBTC
  .map(lst => (
    <div key={lst.address} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <img src={lst.img} alt={lst.symbol} className="w-6 h-6 rounded-full" />
        <div>
          <p className="font-medium text-stone-800">{lst.symbol}</p>
          <p className="text-stone-500 text-xs">{lst.name}</p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-semibold text-stone-800">
          {formatNumber(conversionRates[lst.symbol] || '1', 4)}
        </p>
        <p className="text-stone-500 text-xs">Conversion Rate</p>
      </div>
    </div>
  ))}

       
        </div>
      </div>

      {/* Risk Information */}
      <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800 mb-1">Important Information</h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Assets are automatically converted to lstBTC for yield generation</li>
              <li>• Performance fee (10%) and management fee (2% annual) are deducted</li>
              <li>• Yield distribution requires manual triggering (can be called by anyone)</li>
              <li>• Withdrawal converts back to your chosen output token via custodian</li>
              <li>• Smart contract risk applies - only deposit what you can afford to lose</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldVaultInterface;