// Token interface
export interface Token {
  id: number
  symbol: string;
  name: string;
  balance: number;
  address?: string;
  pool:string[];
  poolId?: number[];
  img?: string; // Optional image URL for the token
}


// Token array
const tokens: Token[] = [
  { 
    id: 1,
    symbol: 'TCORE2', 
    name: 'Test Core', 
    balance: 0.5,
    address: '0xdcc703c0E500B653Ca82273B7BFAd8045D85a470', // Native token address
    pool: ["AFR", "USDT","WBTC"],
    poolId: [1, 2],
    img: "https://assets.pancakeswap.finance/web/native/1.png"
  },
  { 
    id: 2,
    symbol: 'USDT', 
    name: 'USDT', 
    balance: 2,
    address: '0x6765e788d5652E22691C6c3385c401a9294B9375', // Correct USDT address
    pool: ["TCORE2", "AFX"],
    poolId: [2, 6],
    img: 'https://coin-images.coingecko.com/coins/images/39963/large/usdt.png?1724952731'
  },
  { 
    id: 3,
    symbol: 'WETH', 
    name: 'Wrapped Ethereum', 
    balance: 1250,
    address: '0x25a8e2d1e9883D1909040b6B3eF2bb91feAB2e2f', // Correct WETH address
    pool: [],
    poolId: [],
    img: 'https://coin-images.coingecko.com/coins/images/39810/large/weth.png?1724139790',
  }, 
  { 
    id: 4,
    symbol: 'AFR', 
    name: 'AfriRemit', 
    balance: 1250,
    address: '0xC7d68ce9A8047D4bF64E6f7B79d388a11944A06E', // Correct AFR address
    pool: ["TCORE2"],
    poolId: [1],
    img: 'https://cdn.moralis.io/TCORE2/0x6b3595068778dd592e39a122f4f5a5cf09c90fe2.png',
  },
  { 
    id: 5,
    symbol: 'AFX', 
    name: 'AfriStable', 
    balance: 1250,
    address: '0x2B2068a831e7C7B2Ac4D97Cd293F934d2625aB69', // Correct AFX address
    pool: ["cZAR", "USDT"],
    poolId: [5, 6],
    img: 'https://www.xe.com/svgs/flags/ngn.static.svg',
  },
  { 
    id: 6,
    symbol: 'cNGN', 
    name: 'Crypto Naira', 
    balance: 1250,
    address: '0x48D2210bd4E72c741F74E6c0E8f356b2C36ebB7A', // Correct cNGN address
    pool: ["cZAR","WBTC"],
    poolId: [3],
    img: 'https://www.xe.com/svgs/flags/ngn.static.svg',
  },
  { 
    id: 7,
    symbol: 'cZAR', 
    name: 'Crypto South African Rand', 
    balance: 1250,
    address: '0x7dd1aD415F58D91BbF76BcC2640cc6FdD44Aa94b', // Correct cZAR address
    pool: ["cNGN", "AFX"],
    poolId: [3, 5],
    img: 'https://www.xe.com/svgs/flags/zar.static.svg',
  },
  { 
    id: 8,
    symbol: 'cGHS', 
    name: 'Crypto Ghanaian Cedi', 
    balance: 1250,
    address: '0x8F11F588B1Cc0Bc88687F7d07d5A529d34e5CD84', // Correct cGHS address
    pool: ["cKES"],
    poolId: [4],
    img: 'https://www.xe.com/svgs/flags/ghs.static.svg',
  },
  { 
    id: 9,
    symbol: 'cKES', 
    name: 'Crypto Kenyan Shilling', 
    balance: 1250,
    address: '0xaC56E37f70407f279e27cFcf2E31EdCa888EaEe4', // Correct cKES address
    pool: ["cGHS"],
    poolId: [4],
    img: 'https://www.xe.com/svgs/flags/kes.static.svg',
  },
  { 
   id : 10,
    symbol: 'WBTC', 
    name: 'Wrapped Bitcoin', 
    balance: 1250,
    address: '0xF12D5E4D561000F1F464E4576bb27eA0e83931da', 
    pool: ["cNGN","TCORE2"],
    poolId: [4],
    img: '/btc.png',
  }

];

export default tokens;


export const mock_btc=  { 

    symbol: 'WBTC', 
    name: 'Wrapped Bitcoin', 
    address: '0xF12D5E4D561000F1F464E4576bb27eA0e83931da', 
    img: '/btc.png',
  }



