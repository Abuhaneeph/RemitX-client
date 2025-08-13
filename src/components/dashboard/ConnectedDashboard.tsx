import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, PiggyBank, Gift, Wallet, Bitcoin, RefreshCw, Layers, Shield, DollarSign } from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import { shortenAddress } from '@/lib/utils';
import Currencies from '@/lib/Tokens/currencies';

interface ConnectedDashboardProps {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  balanceVisible: boolean;
  setBalanceVisible: (visible: boolean) => void;
  walletAddress: string;
  copied: boolean;
  onCopyAddress: () => void;
  selectedToken: any;
  bal1: number | null;
  usdValue: number;
  currentTokenPrice: number;
  portfolioGrowth: number;
  onQuickAction: (action: string) => void;
  exchangeRates: {[key: string]: { rate: number, change: number, positive: boolean | null }};
  transactions: any[];
  txLoading: boolean;
  txError: string | null;
}

const ConnectedDashboard: React.FC<ConnectedDashboardProps> = ({
  selectedCurrency,
  setSelectedCurrency,
  balanceVisible,
  setBalanceVisible,
  walletAddress,
  copied,
  onCopyAddress,
  selectedToken,
  bal1,
  usdValue,
  currentTokenPrice,
  portfolioGrowth,
  onQuickAction,
  exchangeRates,
  transactions,
  txLoading,
  txError
}) => {
  // Find the symbol for the selected currency
  const selectedCurrencyObj = Currencies.find(c => c.code === selectedCurrency);
  const currencySymbol = selectedCurrencyObj ? selectedCurrencyObj.symbol : selectedToken?.symbol || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <DashboardHeader
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
          balanceVisible={balanceVisible}
          setBalanceVisible={setBalanceVisible}
          walletAddress={walletAddress}
          copied={copied}
          onCopyAddress={onCopyAddress}
        />

        {/* Balance Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-orange-600 via-red-600 to-amber-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-orange-100">lstBTC Balance</h2>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">
                {balanceVisible
                  ? `${currencySymbol} ${bal1?.toLocaleString() || 0}`
                  : '••••••••'}
              </div>
              <div className="text-orange-100 text-lg">
                {balanceVisible 
                  ? `≈ $${usdValue.toLocaleString()} USD`
                  : '≈ $••••••••'
                }
              </div>
              <div className="text-sm text-orange-200">
                {balanceVisible && `lstBTC Rate: $${currentTokenPrice.toFixed(6)}`}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-3xl p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-green-800">Yield Generated</h3>
                <p className="text-sm text-green-600">This month</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-700">+{portfolioGrowth}%</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { key: 'yield', title: 'Earn Yield', subtitle: 'Generate lstBTC yield', icon: Bitcoin, gradient: 'from-orange-500 to-red-500' },
            { key: 'swap', title: 'Swap', subtitle: 'Exchange assets', icon: RefreshCw, gradient: 'from-indigo-500 to-purple-500' },
            { key: 'lending', title: 'Borrow', subtitle: 'Against BTC collateral', icon: DollarSign, gradient: 'from-green-500 to-emerald-500' },
            { key: 'staking', title: 'Stake', subtitle: 'Core blockchain', icon: Layers, gradient: 'from-blue-500 to-cyan-500' },
            { key: 'liquidity', title: 'Liquidity', subtitle: 'Pool rewards', icon: Gift, gradient: 'from-purple-500 to-pink-500' },
          ].map((action) => (
            <button 
              key={action.key}
              onClick={() => onQuickAction(action.key)}
              className="group bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer active:scale-95"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                {React.createElement(action.icon, { className: "w-6 h-6 text-white" })}
              </div>
              <h3 className="font-semibold text-slate-800 mb-1 text-sm">{action.title}</h3>
              <p className="text-slate-500 text-xs">{action.subtitle}</p>
            </button>
          ))}
        </div>

        {/* Asset Prices & Yield Rates */}
        <div className="bg-white/60 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-8 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse shadow-lg shadow-orange-500/50"></div>
              <h2 className="text-xl font-bold text-slate-800">Live Prices & Yields</h2>
            </div>
            <div className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-orange-700 font-medium">Live</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(exchangeRates)
              .slice(0, 4)
              .map(([currency, data], index) => {
                const typedData = data as { rate: number, change: number, positive: boolean | null };
                
                // Map to RemitX assets with yield info
                const assetDetails = {
                  'BTC': { icon: '🟠', name: 'wBTC', yield: '5.2%', type: 'Wrapped Bitcoin' },
                  'ETH': { icon: '🟡', name: 'lstBTC', yield: '8.4%', type: 'Liquid Staking' },
                  'USDT': { icon: '🟢', name: 'USDT', yield: '4.1%', type: 'Stablecoin' },
                  'USDC': { icon: '💚', name: 'cNGN', yield: '12.3%', type: 'Nigerian Naira' }
                };
                
                // Default to first currency if not found
                const assetKey = Object.keys(assetDetails)[index] || 'BTC';
                const details = assetDetails[assetKey as keyof typeof assetDetails];
                
                return (
                  <div key={index} className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{details.icon}</span>
                        <span className="font-medium text-slate-700">{details.name}</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${typedData.positive === true ? 'bg-emerald-500' : typedData.positive === false ? 'bg-red-500' : 'bg-slate-400'}`}></div>
                    </div>
                    <div className="text-xs text-slate-500 mb-2">{details.type}</div>
                    <div className="text-xl font-bold text-slate-900 mb-2">${typedData.rate.toFixed(6)}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                        APY {details.yield}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        typedData.positive === true ? 'text-emerald-700 bg-emerald-100' : 
                        typedData.positive === false ? 'text-red-700 bg-red-100' : 'text-slate-600 bg-slate-100'
                      }`}>
                        {typedData.positive === true ? '+' : typedData.positive === false ? '' : ''}{typedData.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Core Blockchain Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Bitcoin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-orange-800">Total BTC Locked</h3>
                <p className="text-sm text-orange-600">In protocol</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-orange-700">1,247 BTC</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Core Staking APY</h3>
                <p className="text-sm text-blue-600">Current rate</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-700">12.5%</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-purple-800">Protocol TVL</h3>
                <p className="text-sm text-purple-600">Total value locked</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-700">$42.3M</div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white/60 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-4 sm:p-8 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-6">Recent Activity</h2>
          {txError && (
            <div className="bg-red-100 text-red-700 rounded-lg px-2 sm:px-4 py-2 mb-2 sm:mb-4 text-center font-medium text-xs sm:text-base">{txError}</div>
          )}
          {txLoading ? (
            <div className="flex flex-col items-center py-8 sm:py-12">
              <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-3 sm:mb-4"></div>
              <p className="text-slate-500 text-xs sm:text-base">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Bitcoin className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 mb-2 sm:mb-4 text-xs sm:text-base">No transactions yet</p>
              <p className="text-xs sm:text-sm text-slate-400">Start earning yield with your first lstBTC deposit</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex flex-col gap-3 sm:gap-0 sm:divide-y sm:divide-slate-100">
                {transactions.map((tx, idx) => (
                  <div
                    key={tx.hash + idx}
                    className="sm:flex sm:items-center sm:justify-between sm:py-4 min-w-[260px] bg-white sm:bg-transparent rounded-2xl sm:rounded-none shadow-sm sm:shadow-none px-3 py-3 sm:px-0 sm:py-0"
                    style={{ marginBottom: '0.5rem' }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className={`w-10 h-10 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${tx.direction === 'sent' ? 'bg-orange-100' : 'bg-emerald-100'}`}> 
                        {tx.direction === 'sent' ? <ArrowUpRight className="w-5 h-5 text-orange-500" /> : <ArrowDownLeft className="w-5 h-5 text-emerald-500" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-base sm:text-base leading-tight">{tx.direction === 'sent' ? 'Sent' : 'Received'} {tx.amount} {tx.token}</span>
                        <span className="text-xs text-slate-500 font-medium mt-1">{tx.direction === 'sent' ? 'To' : 'From'} {shortenAddress(tx.counterparty)}</span>
                        <span className="text-[11px] text-slate-400 font-mono mt-1 block sm:hidden">{tx.hash.slice(0, 8)}...{tx.hash.slice(-4)}</span>
                        <span className="text-[11px] text-slate-400 mt-1 block sm:hidden">{tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleString() : ''}</span>
                      </div>
                    </div>
                    <div className="hidden sm:block text-right w-full sm:w-auto">
                      <div className="text-xs text-slate-400 font-mono">{tx.hash.slice(0, 8)}...{tx.hash.slice(-4)}</div>
                      <div className="text-xs text-slate-400">{tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleString() : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectedDashboard;