import React, { useEffect, useState } from 'react';
import { ArrowRight, Globe, TrendingUp, Shield, Users, Bitcoin, Coins, Zap, Star, RefreshCw } from 'lucide-react';

interface HeroSectionProps {
  onPageChange?: (page: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onPageChange }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleStartTrading = () => {
    if (onPageChange) {
      onPageChange('dashboard');
    }
    setIsMenuOpen(false);
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white">
      {/* Crypto Assets Background */}
      <div className="absolute inset-0 select-none">
        {/* wBTC */}
        <div className="absolute top-24 left-32 w-16 h-16 flex items-center justify-center transition-all duration-500 cursor-pointer opacity-40 hover:opacity-100 hover:scale-110 hover:shadow-lg pointer-events-auto animate-float-1">
          <span className="text-5xl">🟠</span>
        </div>
        {/* lstBTC */}
        <div className="absolute top-1/3 right-40 w-16 h-16 flex items-center justify-center transition-all duration-500 cursor-pointer opacity-40 hover:opacity-100 hover:scale-110 hover:shadow-lg pointer-events-auto animate-float-2">
          <span className="text-5xl">🟡</span>
        </div>
        {/* USDT */}
        <div className="absolute bottom-32 left-1/4 w-16 h-16 flex items-center justify-center transition-all duration-500 cursor-pointer opacity-40 hover:opacity-100 hover:scale-110 hover:shadow-lg pointer-events-auto animate-float-3">
          <span className="text-5xl">🟢</span>
        </div>
        {/* cNGN */}
        <div className="absolute bottom-20 right-32 w-16 h-16 flex items-center justify-center transition-all duration-500 cursor-pointer opacity-40 hover:opacity-100 hover:scale-110 hover:shadow-lg pointer-events-auto animate-float-4">
          <span className="text-5xl">💚</span>
        </div>
        {/* stCORE */}
        <div className="absolute top-1/4 right-1/4 w-16 h-16 flex items-center justify-center transition-all duration-500 cursor-pointer opacity-40 hover:opacity-100 hover:scale-110 hover:shadow-lg pointer-events-auto animate-float-5">
          <span className="text-5xl">⚫</span>
        </div>
        {/* cKES */}
        <div className="absolute bottom-1/4 left-1/3 w-16 h-16 flex items-center justify-center transition-all duration-500 cursor-pointer opacity-40 hover:opacity-100 hover:scale-110 hover:shadow-lg pointer-events-auto animate-float-6">
          <span className="text-5xl">🟣</span>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
        <div className="text-center">
          {/* Premium Badge */}
          <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-amber-500/10 backdrop-blur-xl border border-orange-200/30 text-orange-700 rounded-full text-sm font-semibold mb-12 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 transform -translate-x-full transition-transform duration-500"></div>
            <Bitcoin className="w-4 h-4 text-orange-500 mr-3 animate-spin-slow relative z-10" />
            <span className="relative z-10">🚀 Next-Generation Bitcoin Yield & Liquidity Protocol</span>
            <Zap className="w-4 h-4 text-amber-500 ml-3 animate-pulse relative z-10" />
          </div>

          {/* Hero Title with 3D Effect */}
          <div className="relative mb-12">
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-8 leading-none tracking-tight">
              <span className="block transform hover:scale-105 transition-transform duration-300">
                Unlock Bitcoin's
              </span>
              <span className="block bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 bg-clip-text text-transparent">
                <span>Full Potential</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-amber-500/20 blur-3xl animate-pulse"></div>
              </span>
            </h1>
          </div>

          {/* Enhanced Subheading */}
          <p className="text-2xl md:text-3xl text-gray-600 mb-16 max-w-5xl mx-auto leading-relaxed font-light">
            Generate yield from your Bitcoin, access regional liquidity, and bridge to
            <span className="text-orange-600 font-semibold"> emerging markets </span>
            on Core blockchain's revolutionary lstBTC ecosystem.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <button 
              onClick={handleStartTrading}  
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <span>Start Earning lstBTC</span>
              <Bitcoin className="w-5 h-5" />
            </button>
            
            <a
              href="#features"
              className="inline-block border border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-orange-400 hover:text-orange-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>Explore Features</span>
              <RefreshCw className="w-5 h-5" />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="group text-center">
              <div className="bg-white/80 backdrop-blur-sm border border-orange-100 rounded-3xl p-8 hover:bg-white hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 border border-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Bitcoin className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">lstBTC</div>
                <div className="text-gray-600 text-base">Yield Generation</div>
              </div>
            </div>
            <div className="group text-center">
              <div className="bg-white/80 backdrop-blur-sm border border-red-100 rounded-3xl p-8 hover:bg-white hover:border-red-200 hover:shadow-xl hover:shadow-red-100/50 transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Globe className="w-8 h-8 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300">3+</div>
                <div className="text-gray-600 text-base">Regional Currencies</div>
              </div>
            </div>
            <div className="group text-center">
              <div className="bg-white/80 backdrop-blur-sm border border-amber-100 rounded-3xl p-8 hover:bg-white hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <RefreshCw className="w-8 h-8 text-amber-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors duration-300">Instant</div>
                <div className="text-gray-600 text-base">Swaps Available</div>
              </div>
            </div>
            <div className="group text-center">
              <div className="bg-white/80 backdrop-blur-sm border border-orange-100 rounded-3xl p-8 hover:bg-white hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 border border-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">Core</div>
                <div className="text-gray-600 text-base">Native Built</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-20px) translateX(15px) rotate(5deg); }
          50% { transform: translateY(-10px) translateX(-10px) rotate(-3deg); }
          75% { transform: translateY(-30px) translateX(8px) rotate(8deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          30% { transform: translateY(-25px) translateX(-12px) rotate(-5deg); }
          60% { transform: translateY(-15px) translateX(18px) rotate(3deg); }
          90% { transform: translateY(-35px) translateX(-8px) rotate(-8deg); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          20% { transform: translateY(-35px) translateX(8px) rotate(7deg); }
          40% { transform: translateY(-5px) translateX(-20px) rotate(-4deg); }
          80% { transform: translateY(-40px) translateX(15px) rotate(6deg); }
        }
        @keyframes float-4 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          35% { transform: translateY(-20px) translateX(15px) rotate(-6deg); }
          70% { transform: translateY(-25px) translateX(-10px) rotate(4deg); }
          100% { transform: translateY(-30px) translateX(12px) rotate(-7deg); }
        }
        @keyframes float-5 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          15% { transform: translateY(-30px) translateX(-5px) rotate(5deg); }
          45% { transform: translateY(-10px) translateX(25px) rotate(-3deg); }
          75% { transform: translateY(-45px) translateX(-15px) rotate(8deg); }
        }
        @keyframes float-6 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-28px) translateX(12px) rotate(-4deg); }
          50% { transform: translateY(-18px) translateX(-18px) rotate(6deg); }
          75% { transform: translateY(-38px) translateX(10px) rotate(-5deg); }
        }
        @keyframes node-0 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.8; }
          25% { transform: translateY(-20px) translateX(10px) scale(1.1); opacity: 1; }
          50% { transform: translateY(-10px) translateX(-15px) scale(0.9); opacity: 0.6; }
          75% { transform: translateY(-30px) translateX(5px) scale(1.2); opacity: 1; }
        }
        @keyframes node-1 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.7; }
          30% { transform: translateY(-25px) translateX(-12px) scale(1.15); opacity: 1; }
          60% { transform: translateY(-15px) translateX(18px) scale(0.85); opacity: 0.5; }
          90% { transform: translateY(-35px) translateX(-8px) scale(1.25); opacity: 1; }
        }
        @keyframes node-2 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.9; }
          20% { transform: translateY(-35px) translateX(8px) scale(1.05); opacity: 1; }
          40% { transform: translateY(-5px) translateX(-20px) scale(0.95); opacity: 0.7; }
          80% { transform: translateY(-40px) translateX(15px) scale(1.3); opacity: 1; }
        }
        @keyframes node-3 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.6; }
          35% { transform: translateY(-20px) translateX(15px) scale(1.2); opacity: 1; }
          70% { transform: translateY(-25px) translateX(-10px) scale(0.8); opacity: 0.4; }
          100% { transform: translateY(-30px) translateX(12px) scale(1.1); opacity: 1; }
        }
        @keyframes node-4 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.8; }
          15% { transform: translateY(-30px) translateX(-5px) scale(1.1); opacity: 1; }
          45% { transform: translateY(-10px) translateX(25px) scale(0.9); opacity: 0.6; }
          75% { transform: translateY(-45px) translateX(-15px) scale(1.35); opacity: 1; }
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
        @keyframes float-3d {
          0%, 100% { transform: translateY(0px) rotateY(0deg) rotateX(0deg); }
          50% { transform: translateY(-30px) rotateY(180deg) rotateX(15deg); }
        }
        @keyframes float-3d-delayed {
          0%, 100% { transform: translateY(0px) rotateY(0deg) rotateX(0deg); }
          50% { transform: translateY(-25px) rotateY(-180deg) rotateX(-15deg); }
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float-1 { animation: float-1 8s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 10s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 12s ease-in-out infinite; }
        .animate-float-4 { animation: float-4 9s ease-in-out infinite; }
        .animate-float-5 { animation: float-5 11s ease-in-out infinite; }
        .animate-float-6 { animation: float-6 7s ease-in-out infinite; }
        .animate-node-0 { animation: node-0 6s ease-in-out infinite; }
        .animate-node-1 { animation: node-1 7s ease-in-out infinite; }
        .animate-node-2 { animation: node-2 8s ease-in-out infinite; }
        .animate-node-3 { animation: node-3 5s ease-in-out infinite; }
        .animate-node-4 { animation: node-4 9s ease-in-out infinite; }
        .animate-dash { animation: dash 2s linear infinite; }
        .animate-float-3d { animation: float-3d 12s ease-in-out infinite; }
        .animate-float-3d-delayed { animation: float-3d-delayed 10s ease-in-out infinite; }
        .animate-gradient-x {
          background-size: 400% 400%;
          animation: gradient-x 4s ease infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .transform-gpu {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;