import React from 'react';
import { ArrowRight, Shield, Users, Gift, Wallet, AlertCircle, Bitcoin, Layers, Globe, RefreshCw } from 'lucide-react';

interface FeaturesProps {
  onPageChange?: (page: string) => void;
}

const Features: React.FC<FeaturesProps> = ({ onPageChange }) => {
  const handleGetStarted = () => {
    if (onPageChange) {
      onPageChange('dashboard');
    }
  };

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-full text-sm font-medium text-orange-700 mb-6">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            Revolutionary Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Unlock Bitcoin's Full
            <span className="bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 bg-clip-text text-transparent"> Potential</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The first comprehensive Bitcoin yield ecosystem on Core blockchain, bridging wrapped Bitcoin with liquid staking and regional stablecoins.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: Bitcoin,
              title: 'lstBTC Conversion',
              description: 'Revolutionary conversion mechanism transforming wBTC and stablecoins into yield-bearing lstBTC with compound optimization.',
              gradient: 'from-orange-500 to-red-500'
            },
            {
              icon: Layers,
              title: 'Core Blockchain Native',
              description: 'Built for Core\'s Satoshi Plus consensus with native BTC staking integration and stCORE utilization.',
              gradient: 'from-yellow-500 to-orange-500'
            },
            {
              icon: Globe,
              title: 'Regional Stablecoins',
              description: 'Borrow local currencies (cNGN, cKES, cGHS) using Bitcoin collateral for emerging market access.',
              gradient: 'from-purple-500 to-pink-500'
            },
            {
              icon: Shield,
              title: 'Custodian-Secured',
              description: 'Enterprise-grade security with transparent, verifiable asset conversion and custodian infrastructure.',
              gradient: 'from-green-500 to-emerald-500'
            },
            {
              icon: Wallet,
              title: 'Dual Staking Benefits',
              description: 'Simultaneously earn from Bitcoin exposure and Core network rewards through integrated staking mechanisms.',
              gradient: 'from-blue-500 to-cyan-500'
            },
            {
              icon: RefreshCw,
              title: 'Instant Swap Engine',
              description: 'Lightning-fast swaps between wBTC, lstBTC, stablecoins, and regional currencies with minimal slippage.',
              gradient: 'from-indigo-500 to-purple-500'
            },
            {
              icon: AlertCircle,
              title: 'Liquidity Pools',
              description: 'Deep liquidity pools ensuring seamless conversions and optimal rates for all supported assets.',
              gradient: 'from-teal-500 to-green-500'
            }
          ].map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Swap Feature Highlight */}
        <div className="mb-20">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-1">
            <div className="bg-white rounded-3xl p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-sm font-medium text-indigo-700 mb-6">
                  <RefreshCw className="w-4 h-4" />
                  Swap Engine
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Seamless Asset Exchange</h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                  Instantly swap between Bitcoin, stablecoins, and regional currencies with enterprise-grade liquidity
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Bitcoin className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Bitcoin Assets</h4>
                  <p className="text-sm text-gray-600">wBTC, lstBTC</p>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Instant Swap</span>
                  </div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Regional Stablecoins</h4>
                  <p className="text-sm text-gray-600">USDT, cNGN, cKES, cGHS</p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-indigo-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Minimal Slippage</span>
                  </div>
                  <div className="w-px h-4 bg-indigo-200"></div>
                  <div className="flex items-center gap-2 text-sm text-indigo-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Deep Liquidity</span>
                  </div>
                  <div className="w-px h-4 bg-indigo-200"></div>
                  <div className="flex items-center gap-2 text-sm text-indigo-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Best Rates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Technical Architecture</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Modular, scalable design built specifically for Core blockchain's unique capabilities
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 overflow-x-auto">
            <div className="flex items-center justify-between min-w-max gap-4 text-center">
              {[
                { name: 'User Deposits', icon: Wallet, color: 'from-blue-500 to-cyan-500' },
                { name: 'Yield Vault', icon: Shield, color: 'from-green-500 to-emerald-500' },
                { name: 'lstBTC Conversion', icon: Bitcoin, color: 'from-orange-500 to-red-500' },
                { name: 'Staking Rewards', icon: Gift, color: 'from-purple-500 to-pink-500' },
                { name: 'Lending Pool', icon: Users, color: 'from-indigo-500 to-purple-500' }
              ].map((step, index) => (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-3 shadow-lg`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-20">{step.name}</span>
                  </div>
                  {index < 4 && (
                    <ArrowRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-12 text-center relative">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-purple-500/5 to-blue-500/5 rounded-3xl"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] rounded-3xl"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/80 mb-6">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                Live on Core Testnet
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Bridge to Bitcoin's Future
              </h3>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join the revolution in Bitcoin utility. Generate yield, access liquidity, and unlock real-world value from your Bitcoin holdings.
              </p>
              <button 
                onClick={handleGetStarted}
                className="group bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
              >
                <span className="flex items-center gap-2">
                  Start Earning with lstBTC
                  <Bitcoin className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;