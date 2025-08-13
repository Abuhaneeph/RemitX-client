import React, { useState, useEffect } from 'react';
import { useContractInstances } from '@/provider/ContractInstanceProvider';
import { 
  ArrowUpDown, 
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
  Percent
} from 'lucide-react';
import tokens from '@/lib/Tokens/tokens';
import { CONTRACT_ADDRESSES } from '@/provider/ContractInstanceProvider';
import { ethers, formatEther, parseEther } from 'ethers';
import { format } from 'path';

// Interface for user position data
interface UserPositionData {
  btcCollateral: string;
  lstBTCCollateral: string;
  totalBorrowed: string;
  healthFactor: string;
  stakingRewards: string;
}

// New interfaces for enhanced features
interface TokenBorrowData {
  principalAmount: string;
  currentDebt: string;
  accruedInterest: string;
  borrowRate: string;
}

interface BorrowIndexData {
  currentIndex: string;
  lastUpdateTime: number;
  borrowRate: string;
}

const LendingInterface = () => {
  const { 
    isConnected, 
    LENDING_CONTRACT_INSTANCE,
    MOCK_BTC_CONTRACT_INSTANCE, 
    TEST_TOKEN_CONTRACT_INSTANCE, 
    PRICEAPI_CONTRACT_INSTANCE,
    LST_BTC_CONTRACT_INSTANCE,
    fetchBalance, 
    address 
  } = useContractInstances();

  const [activeTab, setActiveTab] = useState('deposit');
  const [showSettings, setShowSettings] = useState(false);
  
  // Contract addresses
  const MOCK_BTC_ADDRESS = CONTRACT_ADDRESSES.mockBtcAddress;
  const LENDING_CONTRACT_ADDRESS = CONTRACT_ADDRESSES.lendingProtocolAddress;
  
  // Deposit states
  const [btcAmount, setBtcAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [hasApproved, setHasApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  
  // Borrow states
  const [selectedBorrowToken, setSelectedBorrowToken] = useState('USDT');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [tokenReserve, setTokenReserve] = useState<{ [key: string]: string }>({});
  const [isLoadingReserve, setIsLoadingReserve] = useState(false);
  
  // Repay states
  const [selectedRepayToken, setSelectedRepayToken] = useState('cNGN');
  const [repayAmount, setRepayAmount] = useState('');
  const [isRepaying, setIsRepaying] = useState(false);
  const [hasRepayApproved, setHasRepayApproved] = useState(false);
  const [isRepayApproving, setIsRepayApproving] = useState(false);
  
  // Withdraw states
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // User data states
  const [userPosition, setUserPosition] = useState<UserPositionData>({
    btcCollateral: '0',
    lstBTCCollateral: '0',
    totalBorrowed: '0',
    healthFactor: '0',
    stakingRewards: '0'
  });
  
  const [btcBalance, setBtcBalance] = useState('0');
  const [tokenBalances, setTokenBalances] = useState<{[key: string]: string}>({});
  const [borrowedAmounts, setBorrowedAmounts] = useState<{[key: string]: string}>({});
  const [prices, setPrices] = useState<{[key: string]: string}>({});
  const [maxBorrowable, setMaxBorrowable] = useState('0');

  // NEW: Enhanced states for interest tracking
  const [tokenBorrowData, setTokenBorrowData] = useState<{[key: string]: TokenBorrowData}>({});
  const [borrowIndexData, setBorrowIndexData] = useState<{[key: string]: BorrowIndexData}>({});
  const [userBorrowedTokens, setUserBorrowedTokens] = useState<string[]>([]);
  const [totalAccruedInterest, setTotalAccruedInterest] = useState('0');
  const [isAccruingInterest, setIsAccruingInterest] = useState(false);

  const addMinterToStCore = async () => {
    if (!isConnected || !address) return;

    try {
      const lstBTCContract = await LST_BTC_CONTRACT_INSTANCE();
      if (lstBTCContract) {
        const tx = await lstBTCContract.addMinter(CONTRACT_ADDRESSES.btcStakingAddress);
        await tx.wait();
        console.log('Lending pool added as minter successfully');
      }
    } catch (error) {
      console.error('Error adding minter:', error);
    }
  };


  //
const calculateHealthFactor = () => {
    const btcCollateralValue = parseFloat(userPosition.btcCollateral) * parseFloat(prices.BTC);
    const lstBTCCollateralValue = parseFloat(userPosition.lstBTCCollateral) * 2.25;
    const totalCollateralValue = btcCollateralValue + lstBTCCollateralValue;
    const totalBorrowedValue = parseFloat(userPosition.totalBorrowed);

    if (totalBorrowedValue === 0) {
        return '150'; // or any default value indicating no debt
    }

    const healthFactor = (totalCollateralValue / totalBorrowedValue) * 100; // Match the smart contract logic
    return healthFactor.toFixed(2); // Format to 2 decimal places
};

  // Fetch BTC balance using MOCK_BTC_CONTRACT_INSTANCE
  const fetchBTCBalance = async () => {
    if (!isConnected || !address) return;
    
    try {
      const mockBtcContract = await MOCK_BTC_CONTRACT_INSTANCE();
      if (mockBtcContract) {
        const balance = await mockBtcContract.balanceOf(address);
        const formattedBalance = formatEther(balance);
        const roundedBalance = Math.round(parseFloat(formattedBalance) * 10000) / 10000;
        setBtcBalance(roundedBalance.toString());
      }
    } catch (error) {
      console.error('Error fetching BTC balance:', error);
      setBtcBalance('0');
    }
  };

  // Fetch token balances for other tokens
  const fetchTokenBalances = async () => {
    if (!isConnected || !address) return;
    
    const balances: {[key: string]: string} = {};
    
    for (const token of tokens) {
      if (token.symbol !== 'BTC') {
        try {
          const balance = await fetchBalance(token.address);
          balances[token.symbol] = balance.toString();
        } catch (error) {
          console.error(`Error fetching ${token.symbol} balance:`, error);
          balances[token.symbol] = '0';
        }
      }
    }
    
    setTokenBalances(balances);
  };

  // NEW: Fetch enhanced user position with interest data
  const fetchUserPosition = async () => {
    if (!isConnected || !address) return;
    
    try {
      const lendingContract = await LENDING_CONTRACT_INSTANCE();
      if (lendingContract) {
        // Get basic position data
        const position = await lendingContract.getUserPosition(address);
        
        setUserPosition({
          btcCollateral: formatEther(position.btcCollateral),
          lstBTCCollateral: formatEther(position.lstBTCCollateral),
          totalBorrowed: formatEther(position.totalBorrowed),
          healthFactor: position.healthFactor.toString(),
          stakingRewards: formatEther(position.stakingRewards)
        });


        // NEW: Get user's borrowed tokens list
        const borrowedTokensList = await lendingContract.getUserBorrowedTokens(address);
        const tokenSymbols = borrowedTokensList.map(tokenAddr => {
          const token = tokens.find(t => t.address.toLowerCase() === tokenAddr.toLowerCase());
          return token ? token.symbol : 'UNKNOWN';
        }).filter(symbol => symbol !== 'UNKNOWN');
        
        setUserBorrowedTokens(tokenSymbols);

        // NEW: Fetch enhanced borrow data for each token
        const borrowData: {[key: string]: TokenBorrowData} = {};
        let totalInterest = 0;

        for (const token of tokens) {
          if (token.symbol !== 'BTC') {
            try {
              // Get principal borrowed amount
              const principalAmount = await lendingContract.getUserBorrowedAmount(address, token.address);
              
              // NEW: Get current debt including interest
              const currentDebt = await lendingContract.getUserCurrentDebt(address, token.address);
              
              // NEW: Get current borrow rate
              const borrowRate = await lendingContract.getCurrentBorrowRate(token.address);
              
              const principalFormatted = formatEther(principalAmount);
              const currentDebtFormatted = formatEther(currentDebt);
              const accruedInterest = parseFloat(currentDebtFormatted) - parseFloat(principalFormatted);
              
              borrowData[token.symbol] = {
                principalAmount: principalFormatted,
                currentDebt: currentDebtFormatted,
                accruedInterest: accruedInterest.toString(),
                borrowRate: formatEther(borrowRate)
              };

              // Add to total accrued interest (in USD terms)
              if (accruedInterest > 0 && prices[token.symbol]) {
                totalInterest += accruedInterest * parseFloat(prices[token.symbol]);
              }

            } catch (error) {
              borrowData[token.symbol] = {
                principalAmount: '0',
                currentDebt: '0',
                accruedInterest: '0',
                borrowRate: '0'
              };
            }
          }
        }

        setTokenBorrowData(borrowData);
        setTotalAccruedInterest(totalInterest.toString());

        // Update legacy borrowed amounts for backward compatibility
        const borrowed: {[key: string]: string} = {};
        Object.keys(borrowData).forEach(token => {
          borrowed[token] = borrowData[token].currentDebt;
        });
        setBorrowedAmounts(borrowed);
      }
    } catch (error) {
      console.error('Error fetching user position:', error);
    }
  };

  // NEW: Fetch borrow index data for all tokens
  const fetchBorrowIndexData = async () => {
    if (!isConnected) return;
    
    try {
      const lendingContract = await LENDING_CONTRACT_INSTANCE();
      if (lendingContract) {
        const indexData: {[key: string]: BorrowIndexData} = {};
        
        for (const token of tokens) {
          if (token.symbol !== 'WBTC') {
            try {
              const currentIndex = await lendingContract.getCurrentBorrowIndex(token.address);
              const borrowRate = await lendingContract.getCurrentBorrowRate(token.address);
              
              indexData[token.symbol] = {
                currentIndex: formatEther(currentIndex),
                lastUpdateTime: Date.now(), // Current time as approximation
                borrowRate: formatEther(borrowRate)
              };
            } catch (error) {
              indexData[token.symbol] = {
                currentIndex: '1.0',
                lastUpdateTime: Date.now(),
                borrowRate: '0'
              };
            }
          }
        }
        
        setBorrowIndexData(indexData);
      }
    } catch (error) {
      console.error('Error fetching borrow index data:', error);
    }
  };

  // Fetch prices from oracle
  const fetchPrices = async () => {
    try {
      const priceContract = await PRICEAPI_CONTRACT_INSTANCE();
      if (priceContract) {
        const priceData: {[key: string]: string} = {};
        
        // Fetch BTC price
        const btcPrice = await priceContract.getLatestPrice(MOCK_BTC_ADDRESS);
        priceData['BTC'] = formatEther(btcPrice);
        
        // Fetch other token prices
        for (const token of tokens) {
          if (token.symbol !== 'BTC') {
            try {
              const price = await priceContract.getLatestPrice(token.address);
              priceData[token.symbol] = formatEther(price);
            } catch (error) {
              priceData[token.symbol] = '1';
            }
          }
        }
        
        setPrices(priceData);
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  // Calculate max borrowable amount
  const calculateMaxBorrowable = () => {
    if (!userPosition || !prices.BTC) return '0';
    
    const btcValue = parseFloat(userPosition.btcCollateral) * parseFloat(prices.BTC);
    const lstBTCValue = parseFloat(userPosition.lstBTCCollateral) * 2.25;
    
    const maxFromBTC = (btcValue * 100) / 150;
    const maxFromLstBTC = (lstBTCValue * 100) / 120;
    
    const totalMax = maxFromBTC + maxFromLstBTC - parseFloat(userPosition.totalBorrowed);
    setMaxBorrowable(Math.max(0, totalMax).toFixed(2));
  };

  // NEW: Manual interest accrual function
  const accrueInterestManually = async () => {
    if (!isConnected || !address) return;
    
    try {
      setIsAccruingInterest(true);
      const lendingContract = await LENDING_CONTRACT_INSTANCE();
      
      // The smart contract automatically accrues interest when any function is called
      // We can trigger this by calling a view function that updates interest
      await lendingContract.getUserTotalBorrowedUSD(address);
      
      // Refresh user position to show updated interest
      await fetchUserPosition();
      
    } catch (error) {
      console.error('Error accruing interest:', error);
    } finally {
      setIsAccruingInterest(false);
    }
  };

  // useEffect hooks
  useEffect(() => {
    if (isConnected && address) {
      fetchBTCBalance();
      fetchTokenBalances();
      fetchUserPosition();
      fetchPrices();
      fetchTokenReserves();
      fetchBorrowIndexData();
    }
  }, [isConnected, address, isDepositing, isBorrowing, isRepaying, isWithdrawing]);

  useEffect(() => {
    calculateMaxBorrowable();
  }, [userPosition, prices]);

  // Auto-refresh interest data every 30 seconds
  useEffect(() => {
    if (isConnected && address && userBorrowedTokens.length > 0) {
      const interval = setInterval(() => {
        fetchUserPosition();
        fetchBorrowIndexData();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isConnected, address, userBorrowedTokens]);

  // Contract interaction functions (keeping existing ones and updating where needed)
  const approveBTC = async () => {
    if (!btcAmount || parseFloat(btcAmount) <= 0) return;
    
    try {
      setIsApproving(true);
      const mockBtcContract = await MOCK_BTC_CONTRACT_INSTANCE();
      const amountInWei = parseEther(btcAmount);
      
      const approveTx = await mockBtcContract.approve(LENDING_CONTRACT_ADDRESS, amountInWei);
      console.log(`Approving BTC - ${approveTx.hash}`);
      
      await approveTx.wait();
      console.log(`BTC Approved - ${approveTx.hash}`);
      
      setHasApproved(true);
    } catch (error) {
      console.error('Error approving BTC:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const depositBTC = async () => {
    if (!btcAmount || parseFloat(btcAmount) <= 0) return;
    
    try {
      setIsDepositing(true);
      const lendingContract = await LENDING_CONTRACT_INSTANCE();
      const amountInWei = parseEther(btcAmount);
      
      const depositTx = await lendingContract.depositBTC(amountInWei);
      console.log(`Depositing BTC - ${depositTx.hash}`);
      
      await depositTx.wait();
      console.log(`BTC Deposited - ${depositTx.hash}`);
      
      setBtcAmount('');
      setHasApproved(false);
    } catch (error) {
      console.error('Error depositing BTC:', error);
    } finally {
      setIsDepositing(false);
    }
  };

  const borrowToken = async () => {
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) return;
    
    try {
      setIsBorrowing(true);
      const lendingContract = await LENDING_CONTRACT_INSTANCE();
      const tokenAddress = tokens.find(t => t.symbol === selectedBorrowToken)?.address;
      const amountInWei = parseEther(borrowAmount);
      
      const borrowTx = await lendingContract.borrow(tokenAddress, amountInWei);
      console.log(`Borrowing ${selectedBorrowToken} - ${borrowTx.hash}`);
      
      await borrowTx.wait();
      console.log(`${selectedBorrowToken} Borrowed - ${borrowTx.hash}`);
      
      setBorrowAmount('');
    } catch (error) {
      console.error('Error borrowing token:', error);
    } finally {
      setIsBorrowing(false);
    }
  };

  const approveRepayToken = async () => {
    if (!repayAmount || parseFloat(repayAmount) <= 0) return;
    
    try {
      setIsRepayApproving(true);
      const tokenAddress = tokens.find(t => t.symbol === selectedRepayToken)?.address;
      const tokenContract = await TEST_TOKEN_CONTRACT_INSTANCE(tokenAddress);
      const amountInWei = parseEther(repayAmount);
      
      const approveTx = await tokenContract.approve(LENDING_CONTRACT_ADDRESS, amountInWei);
      console.log(`Approving ${selectedRepayToken} - ${approveTx.hash}`);
      
      await approveTx.wait();
      console.log(`${selectedRepayToken} Approved - ${approveTx.hash}`);
      
      setHasRepayApproved(true);
    } catch (error) {
      console.error('Error approving repay token:', error);
    } finally {
      setIsRepayApproving(false);
    }
  };

  const repayToken = async () => {
    if (!repayAmount || parseFloat(repayAmount) <= 0) return;
    
    try {
      setIsRepaying(true);
      const lendingContract = await LENDING_CONTRACT_INSTANCE();
      const tokenAddress = tokens.find(t => t.symbol === selectedRepayToken)?.address;
      const amountInWei = parseEther(repayAmount);
      
      const repayTx = await lendingContract.repay(tokenAddress, amountInWei);
      console.log(`Repaying ${selectedRepayToken} - ${repayTx.hash}`);
      
      await repayTx.wait();
      console.log(`${selectedRepayToken} Repaid - ${repayTx.hash}`);
      
      setRepayAmount('');
      setHasRepayApproved(false);
    } catch (error) {
      console.error('Error repaying token:', error);
    } finally {
      setIsRepaying(false);
    }
  };

  const withdrawBTC = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    
    try {
      setIsWithdrawing(true);
      const lendingContract = await LENDING_CONTRACT_INSTANCE();
      const amountInWei = parseEther(withdrawAmount);
      
      const withdrawTx = await lendingContract.withdrawBTC(amountInWei);
      console.log(`Withdrawing BTC - ${withdrawTx.hash}`);
      
      await withdrawTx.wait();
      console.log(`BTC Withdrawn - ${withdrawTx.hash}`);
      
      setWithdrawAmount('');
    } catch (error) {
      console.error('Error withdrawing BTC:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const claimRewards = async () => {
    try {
      const lendingContract = await LENDING_CONTRACT_INSTANCE();
      const claimTx = await lendingContract.claimStakingRewards();
      console.log(`Claiming rewards - ${claimTx.hash}`);
      
      await claimTx.wait();
      console.log(`Rewards claimed - ${claimTx.hash}`);
    } catch (error) {
      console.error('Error claiming rewards:', error);
    }
  };

  const fetchTokenReserves = async () => {
    if (!isConnected) return;
    
    try {
      setIsLoadingReserve(true);
      const lendingContract = await LENDING_CONTRACT_INSTANCE();
      if (lendingContract) {
        const reserves: {[key: string]: string} = {};
        
        for (const token of tokens) {
          if (token.symbol !== 'BTC') {
            try {
              const reserve = await lendingContract.tokenReserves(token.address);
              reserves[token.symbol] = formatEther(reserve);
            } catch (error) {
              console.error(`Error fetching ${token.symbol} reserve:`, error);
              reserves[token.symbol] = '0';
            }
          }
        }
        
        setTokenReserve(reserves);
      }
    } catch (error) {
      console.error('Error fetching token reserves:', error);
    } finally {
      setIsLoadingReserve(false);
    }
  };

  // Helper functions
 const getHealthFactorColor = (healthFactor: string) => {
  const factor = parseFloat(healthFactor);
  if (factor >= 150) return 'text-green-600';
  if (factor >= 120) return 'text-yellow-600';
  return 'text-red-600';
};

const formatNumber = (value: string, decimals: number = 4) => {
  const num = parseFloat(value);
  return isNaN(num) ? '0' : num.toFixed(decimals);
};

 

  // NEW: Format APY percentage
  const formatAPY = (rate: string) => {
    const rateNumber = parseFloat(rate);
    if (isNaN(rateNumber)) return '0.00%';
    return (rateNumber * 100).toFixed(2) + '%';
  };

  // Render functions (keeping existing ones and enhancing where needed)
  const renderDepositTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Deposit BTC as Collateral</h3>
        <p className="text-stone-600 text-sm mb-6">
          Deposit Bitcoin to receive lstBTC tokens and enable borrowing against your collateral.
        </p>
      </div>

      {/* BTC Deposit */}
      <div className="bg-stone-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-stone-600 text-sm">Deposit Amount</span>
          <span className="text-stone-500 text-sm">Balance: {formatNumber(btcBalance)} BTC</span>
        </div>

        <div className="flex items-center justify-between">
          <input
            type="text"
            value={btcAmount}
            onChange={(e) => setBtcAmount(e.target.value)}
            className="w-32 text-2xl font-semibold bg-transparent border-none outline-none"
            placeholder="0.0"
            disabled={!isConnected}
          />
          
          <div className="flex items-center space-x-2">
            <img src="/btc.png" alt="BTC" className="w-8 h-8 rounded-full" />
            <span className="font-medium">WBTC</span>
          </div>
        </div>

        <button 
          onClick={() => setBtcAmount(btcBalance)}
          className="text-terracotta text-sm mt-2 hover:underline"
          disabled={!isConnected}
        >
          Max
        </button>
      </div>

      {/* Deposit Preview */}
      {btcAmount && prices.BTC && (
        <div className="p-4 bg-stone-50 rounded-xl">
          <div className="flex items-center space-x-2 mb-3">
            <Info className="w-4 h-4 text-stone-500" />
            <span className="text-stone-600 text-sm font-medium">Deposit Preview</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-600">WBTC Collateral</span>
              <span className="font-medium">{btcAmount} WBTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">lstBTC to Receive</span>
              <span className="font-medium">{(parseFloat(btcAmount))} lstBTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">USD Value</span>
              <span className="font-medium">${(parseFloat(btcAmount) * parseFloat(prices.BTC)).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Approve & Deposit Buttons */}
      <div className="space-y-3">
        {!hasApproved && (
          <button
            onClick={approveBTC}
            disabled={!btcAmount || parseFloat(btcAmount) <= 0 || isApproving || !isConnected}
            className="w-full bg-gradient-to-r from-terracotta to-sage text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApproving ? 'Approving...' : 'Approve BTC'}
          </button>
        )}

        <button
          onClick={depositBTC}
          disabled={!hasApproved || !btcAmount || parseFloat(btcAmount) <= 0 || isDepositing || !isConnected}
          className="w-full bg-gradient-to-r from-terracotta to-sage text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDepositing ? 'Depositing...' : hasApproved ? 'Deposit BTC' : '✓ Approved - Click to Deposit'}
        </button>
      </div>
    </div>
  );

  const renderBorrowTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Borrow Assets</h3>
        <p className="text-stone-600 text-sm mb-6">
          Borrow supported tokens against your BTC and lstBTC collateral.
        </p>
      </div>

      {/* Available to Borrow */}
      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-green-800">Available to Borrow</span>
        </div>
        <p className="text-2xl font-bold text-green-800">${formatNumber(maxBorrowable, 2)}</p>
      </div>

      {/* Token Selection */}
      <div className="bg-stone-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-stone-600 text-sm">Borrow Token</span>
          <span className="text-stone-500 text-sm">
            Available: {formatNumber(tokenBalances[selectedBorrowToken] || '0')} {selectedBorrowToken}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <input
            type="text"
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(e.target.value)}
            className="w-32 text-2xl font-semibold bg-transparent border-none outline-none"
            placeholder="0.0"
            disabled={!isConnected}
          />
          
          <select
            value={selectedBorrowToken}
            onChange={(e) => setSelectedBorrowToken(e.target.value)}
            className="bg-white border border-stone-300 rounded-lg px-3 py-2 font-medium min-w-[120px]"
            disabled={!isConnected}
          >
            {tokens.filter(token => token.symbol !== 'BTC').map(token => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => setBorrowAmount(maxBorrowable)}
          className="text-terracotta text-sm mt-2 hover:underline"
          disabled={!isConnected}
        >
          Max Safe Amount
        </button>
      </div>

      {/* NEW: Enhanced Borrow Preview with Real Interest Rate */}
      {borrowAmount && (
        <div className="p-4 bg-stone-50 rounded-xl">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-600">Interest Rate (APY)</span>
              <span className="font-medium text-orange-600">
                {borrowIndexData[selectedBorrowToken] ? 
                  formatAPY(borrowIndexData[selectedBorrowToken].borrowRate) : 
                  'Loading...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Borrow Index</span>
              <span className="font-medium">
                {borrowIndexData[selectedBorrowToken] ? 
                  formatNumber(borrowIndexData[selectedBorrowToken].currentIndex, 6) : 
                  'Loading...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Network Fee</span>
              <span className="font-medium">~$0.001</span>
            </div>
          </div>
        </div>
      )}

      {/* Token Reserve Display */}
      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 mt-4">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="w-5 h-5 text-yellow-600" />
          <span className="font-semibold text-yellow-800">Token Reserve</span>
        </div>
        <p className="text-base text-yellow-800 font-medium">
          {selectedBorrowToken}: {formatNumber(tokenReserve[selectedBorrowToken] || '0', 2)} {selectedBorrowToken}
        </p>
      </div>

      <button
        onClick={borrowToken}
        disabled={!borrowAmount || parseFloat(borrowAmount) <= 0 || isBorrowing || !isConnected}
        className="w-full bg-gradient-to-r from-terracotta to-sage text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isBorrowing ? 'Borrowing...' : `Borrow ${selectedBorrowToken}`}
      </button>
    </div>
  );

const renderRepayTab = () => (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-stone-800 mb-4">Repay Loans</h3>
            <p className="text-stone-600 text-sm mb-6">
                Repay your borrowed tokens to improve your health factor and reduce interest.
            </p>
        </div>

        {/* Outstanding Debt */}
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-800">Total Debt</span>
            </div>
            <p className="text-2xl font-bold text-red-800">${formatNumber(userPosition.totalBorrowed, 2)}</p>
        </div>

        {/* Interest Accrual Section */}
        {userBorrowedTokens.length > 0 && (
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <span className="font-semibold text-orange-800">Accrued Interest</span>
                    </div>
                    <button 
                        onClick={accrueInterestManually}
                        disabled={isAccruingInterest}
                        className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                    >
                        {isAccruingInterest ? 'Updating...' : 'Refresh'}
                    </button>
                </div>
                <p className="text-xl font-bold text-orange-800">${formatNumber(totalAccruedInterest, 2)}</p>
                <p className="text-sm text-orange-600">Interest accrues continuously</p>
            </div>
        )}

        {/* Enhanced Borrowed Tokens with Interest Details */}
        <div className="space-y-3">
            <h4 className="font-medium text-stone-800">Your Borrowed Tokens</h4>
            {Object.entries(tokenBorrowData).map(([token, data]) => (
                parseFloat(data.currentDebt) > 0 && (
                    <div key={token} className="p-3 bg-stone-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-3">
                                {/* Fixed image path - using proper token image */}
                                <img 
                                    src={tokens.find(t => t.symbol === token)?.img || `/api/placeholder/24/24`} 
                                    alt={token} 
                                    className="w-6 h-6 rounded-full" 
                                />
                                <span className="font-medium">{token}</span>
                            </div>
                            <div className="text-right">
                                <span className="font-semibold">{formatNumber(data.currentDebt)}</span>
                                <div className="text-xs text-orange-600">
                                    APY: {formatAPY(data.borrowRate)}
                                </div>
                            </div>
                        </div>
                        
                        {/* Interest Breakdown */}
                        <div className="text-xs text-stone-600 space-y-1">
                            <div className="flex justify-between">
                                <span>Principal:</span>
                                <span>{formatNumber(data.principalAmount, 4)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Accrued Interest:</span>
                                <span className="text-orange-600">+{formatNumber(data.accruedInterest, 6)}</span>
                            </div>
                        </div>
                    </div>
                )
            ))}
        </div>

        {/* Repay Form */}
        <div className="bg-stone-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-stone-600 text-sm">Repay Token</span>
                <span className="text-stone-500 text-sm">
                    Current Debt: {formatNumber(tokenBorrowData[selectedRepayToken]?.currentDebt || '0')} {selectedRepayToken}
                </span>
            </div>

            <div className="flex items-center justify-between">
                <input
                    type="text"
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(e.target.value)}
                    className="w-32 text-2xl font-semibold bg-transparent border-none outline-none"
                    placeholder="0.0"
                    disabled={!isConnected}
                />
                
                <select
                    value={selectedRepayToken}
                    onChange={(e) => {
                        setSelectedRepayToken(e.target.value);
                        setHasRepayApproved(false);
                        // Reset repay amount when changing token
                        setRepayAmount('');
                    }}
                    className="bg-white border border-stone-300 rounded-lg px-3 py-2 font-medium min-w-[120px]"
                    disabled={!isConnected}
                >
                    {Object.keys(tokenBorrowData).filter(token => parseFloat(tokenBorrowData[token].currentDebt) > 0).map(token => (
                        <option key={token} value={token}>
                            {token}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex space-x-2 mt-2">
                <button 
                    onClick={() => {
                        const currentDebt = tokenBorrowData[selectedRepayToken]?.currentDebt || '0';
                        setRepayAmount(currentDebt);
                    }}
                    className="text-terracotta text-sm hover:underline"
                    disabled={!isConnected || !tokenBorrowData[selectedRepayToken]}
                >
                    Repay All
                </button>
                <button 
                    onClick={() => {
                        const principalAmount = tokenBorrowData[selectedRepayToken]?.principalAmount || '0';
                        setRepayAmount(principalAmount);
                    }}
                    className="text-blue-600 text-sm hover:underline"
                    disabled={!isConnected || !tokenBorrowData[selectedRepayToken]}
                >
                    Repay Principal Only
                </button>
            </div>
        </div>

        {/* Approve & Repay Buttons */}
        <div className="space-y-3">
            {!hasRepayApproved && (
                <button
                    onClick={approveRepayToken}
                    disabled={!repayAmount || parseFloat(repayAmount) <= 0 || isRepayApproving || !isConnected}
                    className="w-full bg-gradient-to-r from-terracotta to-sage text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isRepayApproving ? `Approving ${selectedRepayToken}...` : `Approve ${selectedRepayToken}`}
                </button>
            )}

            <button
                onClick={repayToken}
                disabled={!hasRepayApproved || !repayAmount || parseFloat(repayAmount) <= 0 || isRepaying || !isConnected}
                className="w-full bg-gradient-to-r from-terracotta to-sage text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isRepaying ? `Repaying ${selectedRepayToken}...` : hasRepayApproved ? `Repay ${selectedRepayToken}` : `✓ ${selectedRepayToken} Approved - Click to Repay`}
            </button>
        </div>
    </div>
);

  const renderWithdrawTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Withdraw Collateral</h3>
        <p className="text-stone-600 text-sm mb-6">
          Withdraw your BTC collateral while maintaining a safe collateralization ratio.
        </p>
      </div>

      {/* Available to Withdraw */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <Coins className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-blue-800">Available Collateral</span>
        </div>
        <p className="text-2xl font-bold text-blue-800">{formatNumber(userPosition.btcCollateral)} WBTC</p>
      </div>

      {/* Withdraw Form */}
      <div className="bg-stone-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-stone-600 text-sm">Withdraw Amount</span>
          <span className="text-stone-500 text-sm">
            Available: {formatNumber(userPosition.btcCollateral)} WBTC
          </span>
        </div>

        <div className="flex items-center justify-between">
          <input
            type="text"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="w-32 text-2xl font-semibold bg-transparent border-none outline-none"
            placeholder="0.0"
            disabled={!isConnected}
          />
          
          <div className="flex items-center space-x-2">
            <img src="/btc.png" alt="BTC" className="w-8 h-8 rounded-full" />
            <span className="font-medium">BTC</span>
          </div>
        </div>

        <button 
          onClick={() => {
            // Calculate safe max withdrawal (leaving enough collateral for current debt)
            const totalBorrowed = parseFloat(userPosition.totalBorrowed);
            const btcCollateral = parseFloat(userPosition.btcCollateral);
            const btcPrice = parseFloat(prices.BTC || '45000');
            
            if (totalBorrowed > 0) {
              // Need to maintain 150% collateralization ratio
              const minBtcNeeded = (totalBorrowed * 1.5) / btcPrice;
              const maxWithdrawable = Math.max(0, btcCollateral - minBtcNeeded);
              setWithdrawAmount(maxWithdrawable.toFixed(6));
            } else {
              setWithdrawAmount(userPosition.btcCollateral);
            }
          }}
          className="text-terracotta text-sm mt-2 hover:underline"
          disabled={!isConnected}
        >
          Max Safe Amount
        </button>
      </div>

      {/* Withdrawal Impact */}
      {withdrawAmount && (
        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-600">lstBTC to Burn</span>
              <span className="font-medium">{(parseFloat(withdrawAmount))} lstBTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Remaining Collateral</span>
              <span className="font-medium">{(parseFloat(userPosition.btcCollateral) - parseFloat(withdrawAmount || '0')).toFixed(6)} BTC</span>
            </div>
            {prices.BTC && (
              <div className="flex justify-between">
                <span className="text-stone-600">USD Value</span>
                <span className="font-medium">${(parseFloat(withdrawAmount) * parseFloat(prices.BTC)).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={withdrawBTC}
        disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || isWithdrawing || !isConnected}
        className="w-full bg-gradient-to-r from-terracotta to-sage text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isWithdrawing ? 'Withdrawing...' : 'Withdraw BTC'}
      </button>
    </div>
  );

  const renderDashboardTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Your Position</h3>
        <p className="text-stone-600 text-sm mb-6">
          Overview of your collateral, borrowed assets, and position health.
        </p>
      </div>


      {/* Health Factor 
      <div className={`${parseFloat(userPosition.healthFactor) >= 150 ? 'bg-green-50 border-green-200' : 
                       parseFloat(userPosition.healthFactor) >= 120 ? 'bg-yellow-50 border-yellow-200' : 
                       'bg-red-50 border-red-200'} rounded-xl p-4 border`}>
      <div className="flex items-center space-x-2 mb-2">
        <Shield className="w-5 h-5 text-stone-600" />
        <span className="font-semibold text-stone-800">Health Factor</span>
      </div>
      <p className={`text-3xl font-bold ${getHealthFactorColor(userPosition.healthFactor)}`}>
        {formatNumber(userPosition.healthFactor, 0)}%
      </p>
      <p className="text-sm text-stone-600 mt-1">
        {parseFloat(userPosition.healthFactor) >= 150 ? 'Healthy' : 
         parseFloat(userPosition.healthFactor) >= 120 ? 'Moderate Risk' : 'At Risk'}
      </p>
    </div>
*/}
      {/* Collateral Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-stone-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <img src="/btc.png" alt="BTC" className="w-6 h-6 rounded-full" />
            <span className="font-medium text-stone-800">WBTC Collateral</span>
          </div>
          <p className="text-xl font-bold text-stone-800">{formatNumber(userPosition.btcCollateral)} BTC</p>
          {prices.BTC && (
            <p className="text-sm text-stone-600">${(parseFloat(userPosition.btcCollateral) * parseFloat(prices.BTC)).toLocaleString()}</p>
          )}
        </div>

        <div className="bg-stone-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Coins className="w-6 h-6 text-terracotta" />
            <span className="font-medium text-stone-800">lstBTC</span>
          </div>
          <p className="text-xl font-bold text-stone-800">{formatNumber(userPosition.lstBTCCollateral)}</p>
          <p className="text-sm text-stone-600">${(parseFloat(userPosition.lstBTCCollateral) * 2.25).toLocaleString()}</p>
        </div>
      </div>

      {/* NEW: Enhanced Borrowed Assets with Interest Tracking */}
      <div className="bg-stone-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-stone-800">Borrowed Assets</h4>
          {userBorrowedTokens.length > 0 && (
            <button 
              onClick={accrueInterestManually}
              disabled={isAccruingInterest}
              className="text-terracotta hover:underline text-sm font-medium flex items-center space-x-1"
            >
              <Clock className="w-3 h-3" />
              <span>{isAccruingInterest ? 'Updating...' : 'Update Interest'}</span>
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          {Object.entries(tokenBorrowData).map(([token, data]) => (
            parseFloat(data.currentDebt) > 0 && (
              <div key={token} className="border-b border-stone-200 pb-3 last:border-b-0">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center space-x-2">
                    <img src="/api/placeholder/20/20" alt={token} className="w-5 h-5 rounded-full" />
                    <span className="font-medium">{token}</span>
                    <div className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">
                      {formatAPY(data.borrowRate)}
                    </div>
                  </div>
                  <span className="font-semibold">{formatNumber(data.currentDebt)}</span>
                </div>
                
                {/* Interest Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Principal: {formatNumber(data.principalAmount, 4)}</span>
                    <span className="text-orange-600">Interest: +{formatNumber(data.accruedInterest, 6)}</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-1.5">
                    <div 
                      className="bg-orange-400 h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (parseFloat(data.accruedInterest) / parseFloat(data.principalAmount)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          ))}
          
          <div className="border-t border-stone-300 pt-2 mt-2">
            <div className="flex justify-between items-center font-semibold">
              <span>Total Borrowed</span>
              <span>${formatNumber(userPosition.totalBorrowed, 2)}</span>
            </div>
            <div className="flex justify-between text-sm text-orange-600">
              <span>Total Accrued Interest</span>
              <span>+${formatNumber(totalAccruedInterest, 2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Staking Rewards */}
      <div className="bg-terracotta-50 rounded-xl p-4 border border-terracotta-200">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-terracotta" />
            <span className="font-semibold text-stone-800">Staking Rewards</span>
          </div>
          <button 
            className="text-terracotta hover:underline text-sm font-medium"
            onClick={claimRewards}
            disabled={parseFloat(userPosition.stakingRewards) <= 0}
          >
            Claim
          </button>
         
        </div>
        <p className="text-xl font-bold text-terracotta">{formatNumber(userPosition.stakingRewards)} lstBTC</p>
        <p className="text-sm text-stone-600">${(parseFloat(userPosition.stakingRewards) * 2.25).toFixed(2)}</p>
      </div>

      {/* NEW: Borrowing Capacity Utilization */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <Percent className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-blue-800">Borrowing Capacity</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Used: ${formatNumber(userPosition.totalBorrowed, 2)}</span>
            <span>Available: ${formatNumber(maxBorrowable, 2)}</span>
          </div>
          
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (parseFloat(userPosition.totalBorrowed) / (parseFloat(userPosition.totalBorrowed) + parseFloat(maxBorrowable))) * 100)}%`
              }}
            />
          </div>
          
          <p className="text-xs text-blue-600">
            {((parseFloat(userPosition.totalBorrowed) / (parseFloat(userPosition.totalBorrowed) + parseFloat(maxBorrowable))) * 100).toFixed(1)}% utilized
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Lending Protocol</h1>
        <p className="text-stone-600">Deposit, Borrow, and Manage Your Position</p>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Please connect your wallet to use the lending protocol.</span>
          </div>
        </div>
      )}

      {/* NEW: Interest Notification */}
      {userBorrowedTokens.length > 0 && parseFloat(totalAccruedInterest) > 0.01 && (
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-orange-800 font-medium">
                Interest accruing: ${formatNumber(totalAccruedInterest, 2)}
              </span>
            </div>
            <button 
              onClick={() => setActiveTab('repay')}
              className="text-orange-600 hover:underline text-sm font-medium"
            >
              Repay Now
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-stone-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
            activeTab === 'deposit'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Deposit</span>
        </button>
        
        <button
          onClick={() => setActiveTab('borrow')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
            activeTab === 'borrow'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Borrow</span>
        </button>
        
        <button
          onClick={() => setActiveTab('repay')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1 relative ${
            activeTab === 'repay'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Minus className="w-4 h-4" />
          <span>Repay</span>
          {parseFloat(totalAccruedInterest) > 0.01 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
            activeTab === 'withdraw'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>Withdraw</span>
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
          <h2 className="text-lg font-semibold text-stone-800 capitalize">{activeTab}</h2>
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
              <h3 className="font-semibold text-stone-800">Protocol Settings</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-1 rounded text-stone-500 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-600">BTC Collateral Ratio</span>
                <span className="font-medium">150%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">lstBTC Collateral Ratio</span>
                <span className="font-medium">120%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Liquidation Threshold</span>
                <span className="font-medium text-red-600">110%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Base Interest Rate</span>
                <span className="font-medium">5.0% APY</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Max Interest Rate</span>
                <span className="font-medium text-red-600">50.0% APY</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Interest Compounds</span>
                <span className="font-medium text-orange-600">Continuously</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'deposit' && renderDepositTab()}
        {activeTab === 'borrow' && renderBorrowTab()}
        {activeTab === 'repay' && renderRepayTab()}
        {activeTab === 'withdraw' && renderWithdrawTab()}
        {activeTab === 'dashboard' && renderDashboardTab()}
      </div>

     
      {/* Protocol Stats */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200">
        <h3 className="font-semibold text-stone-800 mb-3">Protocol Statistics</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-terracotta">$12.5M</p>
            <p className="text-stone-600 text-sm">Total Collateral</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-sage">$8.2M</p>
            <p className="text-stone-600 text-sm">Total Borrowed</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-stone-800">65.6%</p>
            <p className="text-stone-600 text-sm">Utilization Rate</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-stone-800">2,450</p>
            <p className="text-stone-600 text-sm">Active Users</p>
          </div>
        </div>
      </div>

      {/* Available Markets */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200">
        <h3 className="font-semibold text-stone-800 mb-3">Available Markets</h3>
        
        <div className="space-y-3">
          {tokens.filter(token => token.symbol !== 'BTC').map(token => (
            <div key={token.symbol} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <img src={token.img} alt={token.symbol} className="w-6 h-6 rounded-full" />
                <div>
                  <p className="font-medium text-stone-800">{token.symbol}</p>
                  <p className="text-stone-500 text-xs">{token.name}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-stone-800">8.5%</p>
                <p className="text-stone-500 text-xs">Borrow APY</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Warning */}
      {parseFloat(userPosition.healthFactor) < 130 && parseFloat(userPosition.healthFactor) > 0 && (
        <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Position Warning</h4>
              <p className="text-red-700 text-sm">
                Your health factor is low. Consider repaying debt or adding more collateral to avoid liquidation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LendingInterface;