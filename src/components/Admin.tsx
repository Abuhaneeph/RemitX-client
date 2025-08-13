import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Settings, Info, X, Droplets, Plus, DollarSign } from 'lucide-react';
import tokens, { mock_btc } from '@/lib/Tokens/tokens';
import { addTokenToMetamask } from '@/lib/utils.ts';
import { useContractInstances } from '@/provider/ContractInstanceProvider';
import { roundToTwoDecimalPlaces, roundToFiveDecimalPlaces } from '../lib/utils';
import { ethers, formatEther, parseEther } from 'ethers';
import { toast } from 'react-toastify';
import { CONTRACT_ADDRESSES } from '@/provider/ContractInstanceProvider';

// Create Pool Component
const CreatePoolComponent = () => {
   const { SWAP_CONTRACT_INSTANCE } = useContractInstances();
   const [token1, setToken1] = useState('TCORE2');
  const [token2, setToken2] = useState('WBTC');
  const[isCreatePool,setCreatePool]=useState(false)

  
        const token1Address = tokens.find(t => t.symbol === token1)?.address;
        const token2Address = tokens.find(t => t.symbol === token2)?.address;
const CREATE_POOL = async () => {
  try {
    const SWAP_CONTRACT = await SWAP_CONTRACT_INSTANCE();

    setCreatePool(true);
  console.log(token1Address, token2Address);

  
    // Check if the pool already exists
    const creatingPool = await SWAP_CONTRACT.createPool(token1Address, token2Address);
    console.log(`Loading - ${creatingPool.hash}`);

    await creatingPool.wait();
    console.log(`Success - ${creatingPool.hash}`);

    // Get the Pool ID
    const poolId = await SWAP_CONTRACT.getPoolId();
    console.log(`Pool ID: ${poolId}`);

    alert(`Pool created successfully! ID: ${poolId.toString()}`);

    // Show toast with token pair and pool ID
    toast.success(`✅ Pool Created: ${token1}/${token2} → ID: ${poolId.toString()}`);

    setCreatePool(false);
  } catch (error) {
    setCreatePool(false);
    console.error(error);
    toast.error('❌ Pool creation failed.');
  }
};
 const getAllLiquidityPools = () => {
     const pools: string[] = [];
     tokens.forEach(token => {
       if (Array.isArray(token.pool)) {
         token.pool.forEach(poolToken => {
           const pair = `${token.symbol}/${poolToken}`;
           const reversePair = `${poolToken}/${token.symbol}`;
           if (!pools.includes(pair) && !pools.includes(reversePair)) {
             pools.push(pair);
           }
         });
       }
     });
     return pools;
   };

  return (
   <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Create Pool</h1>
        <p className="text-stone-600">Create a new liquidity pool</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        <div className="space-y-4">
          {/* Token 1 */}
          <div className="bg-stone-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-stone-500 text-sm">Base Token</span>
              
            </div>
            
            <div className="flex items-center space-x-3">
             
              
              <select
                value={token1}
                onChange={(e) => setToken1(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 font-medium"
              >
                {tokens.map(token => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Plus Icon */}
          <div className="flex justify-center">
            <div className="bg-stone-200 rounded-full p-2">
              <Plus className="w-4 h-4 text-stone-600" />
            </div>
          </div>

          {/* Token 2 */}
          <div className="bg-stone-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-stone-500 text-sm">Quote Token</span>
              
            </div>
            
            <div className="flex items-center space-x-3">
             
              
              <select
                value={token2}
                onChange={(e) => setToken2(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 font-medium"
              >
                {tokens.map(token => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
    {/* Available Pools Info */}
           <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
             <div className="flex items-center space-x-2 mb-2">
               <Info className="w-4 h-4 text-blue-600" />
               <span className="text-blue-800 font-medium text-sm">Available Pools</span>
             </div>
             <div className="flex flex-wrap gap-2">
               {getAllLiquidityPools().map(pool => (
                 <span key={pool} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                   {pool}
                 </span>
               ))}
             </div>
           </div>
        <button
          disabled={!token1 || !token2 || isCreatePool}
          onClick={CREATE_POOL}
          className="w-full mt-6 bg-gradient-to-r from-terracotta to-sage text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatePool ? 'Creating Pool...' : 'Create Pool'}
        </button>
      </div>
    </div>
  );
};

// Set Price Component
const SetPriceComponent = () => {
  const [baseToken, setBaseToken] = useState('WBTC');
  const [price, setPrice] = useState('');
  const [isSettingPrice, setSettingPrice] = useState(false);

  const { PRICEAPI_CONTRACT_INSTANCE, isConnected } = useContractInstances();

  // Combine tokens with mock_btc
  const localTokens = [mock_btc, ...tokens];
  const tokenAddress = localTokens.find(t => t.symbol === baseToken)?.address;
    const  setTokenPrice = async() =>{
       
      console.log(`Setting price for ${tokenAddress} at ${price}`);
      try{
          
           const PRICE_CONTRACT=await PRICEAPI_CONTRACT_INSTANCE()
            const settingPrice =await PRICE_CONTRACT.createMockAggregator(tokenAddress, price,18);
            setSettingPrice(true) 
            console.log(`Loading - ${settingPrice.hash}`);
                 await settingPrice.wait();
                 console.log(`Success - ${settingPrice.hash}`);
                 setSettingPrice(false);
        }catch(error){
            setSettingPrice(false);
       console.log(error)
      }
       
     } 


  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Set Price</h1>
        <p className="text-stone-600">Set token pair price</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        <div className="space-y-4">
          {/* Base Token */}
          <div className="bg-stone-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-stone-500 text-sm">Base Token</span>
            </div>
            
            <div className="flex items-center space-x-3">
            <select
  value={baseToken}
  onChange={(e) => setBaseToken(e.target.value)}
  className="bg-white border border-stone-300 rounded-lg px-3 py-2 font-medium w-full"
>
  {localTokens.map(token => (
    <option key={token.symbol} value={token.symbol}>
      {token.symbol}
    </option>
  ))}
</select>

            </div>
          </div>

          {/* Arrow Icon */}
          <div className="flex justify-center">
            <div className="bg-stone-200 rounded-full p-2">
              <DollarSign className="w-4 h-4 text-stone-600" />
            </div>
          </div>

         

          {/* Price Input */}
          <div className="bg-stone-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-stone-500 text-sm">Price Amount</span>
              {price && (
                <span className="text-xs text-stone-400">
                  Wei: {parseEther(price || '0').toString()}
                </span>
              )}
            </div>
            
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full text-2xl font-semibold bg-transparent border-none outline-none"
              placeholder="0.0"
            />
            
            {price && parseFloat(price) > 0 && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs text-blue-700">
                  <span className="font-medium">Conversion:</span> {price} → {parseEther(price).toString()} wei
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          disabled={!price || isSettingPrice || !baseToken || !isConnected}
          onClick={setTokenPrice}
          className="w-full mt-6 bg-gradient-to-r from-terracotta to-sage text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSettingPrice ? 'Setting Price...' : 'Set Price'}
        </button>
      </div>
    </div>
  );
};

// Add Liquidity Component
const AddLiquidityComponent = () => {
  const { 
    SWAP_CONTRACT_INSTANCE, 
    LENDING_CONTRACT_INSTANCE,
    MOCK_BTC_CONTRACT_INSTANCE,
    TEST_TOKEN_CONTRACT_INSTANCE,
    isConnected 
  } = useContractInstances();

  const [selectedToken, setSelectedToken] = useState('AFR');
  const [tokenAmount, setTokenAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [hasApproved, setHasApproved] = useState(false);
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);
  const [tokenReserve, setTokenReserve] = useState('0');
  const [isLoadingReserve, setIsLoadingReserve] = useState(false);

  // Mock BTC configuration
  const mock_btc = { 
    symbol: 'WBTC', 
    name: 'Wrapped Bitcoin', 
    address: '0xF12D5E4D561000F1F464E4576bb27eA0e83931da', 
    img: '/btc.png',
  };

  // Contract addresses
  const MOCK_BTC_ADDRESS =  CONTRACT_ADDRESSES.mockBtcAddress; // CONTRACT_ADDRESSES.mockBtcAddress
  const LENDING_CONTRACT_ADDRESS = CONTRACT_ADDRESSES.lendingProtocolAddress; // CONTRACT_ADDRESSES.lendingProtocolAddress - you'll need to add this

  const allTokens = [mock_btc, ...tokens];
  const tokenAddress = allTokens.find(t => t.symbol === selectedToken)?.address;

  // Reset approval state when token or amount changes
  useEffect(() => {
    setHasApproved(false);
  }, [selectedToken, tokenAmount]);

  // Fetch token reserve
 
const fetchTokenReserve = async () => {
  if (!tokenAddress) return;
  
  try {
    setIsLoadingReserve(true);
    const LENDING_CONTRACT = await LENDING_CONTRACT_INSTANCE();
    const reserve = await LENDING_CONTRACT.tokenReserves(tokenAddress);
    
    // Convert to Ether and round to 2 decimal places
    const parsedReserve = Number(formatEther(reserve)).toFixed(2);
    
    setTokenReserve(parsedReserve);
  } catch (error) {
    console.error('Error fetching token reserve:', error);
    setTokenReserve('0.00');
  } finally {
    setIsLoadingReserve(false);
  }
};

  // Fetch reserve when token changes
  useEffect(() => {
    if (tokenAddress) {
      fetchTokenReserve();
    }
  }, [tokenAddress]);

  // Approve token function
  const approveToken = async () => {
    if (!tokenAmount || parseFloat(tokenAmount) <= 0) return;
    
    try {
      setIsApproving(true);
      
      let tokenContract;
      let approveTx;
      const amountInWei = parseEther(tokenAmount);
      
      console.log(`Approving ${selectedToken}`);
      console.log(`Amount: ${tokenAmount} → Wei: ${amountInWei.toString()}`);
      
      if (selectedToken === 'WBTC') {
        // Handle WBTC approval
        tokenContract = await MOCK_BTC_CONTRACT_INSTANCE();
        approveTx = await tokenContract.approve(LENDING_CONTRACT_ADDRESS, amountInWei);
        console.log(`Approving WBTC - ${approveTx.hash}`);
      } else {
        // Handle other tokens
        console.log(`Using TEST_TOKEN_CONTRACT_INSTANCE for ${tokenAddress}`);
        tokenContract = await TEST_TOKEN_CONTRACT_INSTANCE(tokenAddress);
        approveTx = await tokenContract.approve(LENDING_CONTRACT_ADDRESS, amountInWei);
        console.log(`Approving ${selectedToken} - ${approveTx.hash}`);
      }
      
      await approveTx.wait();
      console.log(`${selectedToken} Approved - ${approveTx.hash}`);
      
      setHasApproved(true);
      toast.success(`✅ Approved ${tokenAmount} ${selectedToken} (${amountInWei.toString()} wei)`);
    } catch (error) {
      console.error('Error approving token:', error);
      toast.error(`❌ Failed to approve ${selectedToken}`);
    } finally {
      setIsApproving(false);
    }
  };

  // Add liquidity function
  const addLiquidity = async () => {
    if (!tokenAmount || parseFloat(tokenAmount) <= 0 || !hasApproved) return;
    
    try {
      setIsAddingLiquidity(true);
      const LENDING_CONTRACT = await LENDING_CONTRACT_INSTANCE();
      const amountInWei = parseEther(tokenAmount);
      
      console.log(`Adding liquidity for ${selectedToken}`);
      console.log(`Amount: ${tokenAmount} → Wei: ${amountInWei.toString()}`);
      
      // Call addLiquidity function - adjust parameters based on your contract
      const addLiquidityTx = await LENDING_CONTRACT.addLiquidity(tokenAddress, amountInWei);
      console.log(`Adding liquidity - ${addLiquidityTx.hash}`);
      
      await addLiquidityTx.wait();
      console.log(`Liquidity added - ${addLiquidityTx.hash}`);
      
      toast.success(`✅ Added ${tokenAmount} ${selectedToken} (${amountInWei.toString()} wei) to liquidity pool!`);
      
      // Reset form and refresh reserve
      setTokenAmount('');
      setHasApproved(false);
      fetchTokenReserve();
      
    } catch (error) {
      console.error('Error adding liquidity:', error);
      toast.error('❌ Failed to add liquidity');
    } finally {
      setIsAddingLiquidity(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Add Liquidity</h1>
        <p className="text-stone-600">Add tokens to the liquidity pool</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        <div className="space-y-4">
          {/* Token Selection */}
          <div className="bg-stone-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-stone-500 text-sm">Select Token</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 font-medium"
              >
                {allTokens.map(token => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Droplets Icon */}
          <div className="flex justify-center">
            <div className="bg-blue-200 rounded-full p-2">
              <Droplets className="w-4 h-4 text-blue-600" />
            </div>
          </div>

          {/* Amount Input */}
          <div className="bg-stone-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-stone-500 text-sm">Amount</span>
              {tokenAmount && (
                <span className="text-xs text-stone-400">
                  Wei: {parseEther(tokenAmount || '0').toString()}
                </span>
              )}
            </div>
            
            <input
              type="number"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              className="w-full text-2xl font-semibold bg-transparent border-none outline-none"
              placeholder="0.0"
            />
            
            {tokenAmount && parseFloat(tokenAmount) > 0 && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs text-blue-700">
                  <span className="font-medium">Conversion:</span> {tokenAmount} {selectedToken} → {parseEther(tokenAmount).toString()} wei
                </div>
              </div>
            )}
          </div>

          {/* Token Reserve Info */}
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-green-600" />
                <span className="text-green-800 font-medium text-sm">Current Reserve</span>
              </div>
              <div className="text-green-800 font-semibold">
                {isLoadingReserve ? (
                  <span className="text-xs">Loading...</span>
                ) : (
                  <span>{roundToFiveDecimalPlaces(tokenReserve)} {selectedToken}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mt-6">
          {!hasApproved ? (
            <button
              disabled={!tokenAmount || parseFloat(tokenAmount) <= 0 || isApproving || !isConnected}
              onClick={approveToken}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApproving ? `Approving ${selectedToken}...` : `Approve ${selectedToken}`}
            </button>
          ) : (
            <button
              disabled={!tokenAmount || parseFloat(tokenAmount) <= 0 || isAddingLiquidity || !hasApproved}
              onClick={addLiquidity}
              className="w-full bg-gradient-to-r from-terracotta to-sage text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingLiquidity ? 'Adding Liquidity...' : 'Add Liquidity'}
            </button>
          )}
        </div>

        {hasApproved && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-800 text-sm font-medium">
                {selectedToken} approved. Ready to add liquidity.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Tabbed Interface Component
const AdminInterface = () => {
  const [activeTab, setActiveTab] = useState('createPool');

  const adminTabs = [
    { id: 'createPool', label: 'Create Pool', icon: Plus },
    { id: 'setPrice', label: 'Set Price', icon: DollarSign },
    { id: 'addLiquidity', label: 'Add Liquidity', icon: Droplets }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'createPool':
        return <CreatePoolComponent />;
      case 'setPrice':
        return <SetPriceComponent />;
      case 'addLiquidity':
        return <AddLiquidityComponent />;
      default:
        return <CreatePoolComponent />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* Tab Navigation */}
        <div className="flex flex-col space-y-6 mb-8">

          {/* Admin Tools */}
          <div>
            <h2 className="text-stone-500 text-sm font-semibold mb-2 px-2">Admin Tools</h2>
            <div className="flex space-x-2 bg-white rounded-2xl p-2 shadow-sm border border-stone-200">
              {adminTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-terracotta to-sage text-white shadow-md'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminInterface;