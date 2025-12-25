// Private Auction Contract Configuration
// Deploy this contract and update the address below

export const AUCTION_CONTRACT_ADDRESS = "0x3bC9876Aa5836e62DF707474E2238B06c84321f9"; // ✅ Deployed on Sepolia!

export const AUCTION_ABI = [
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "auctionId", "type": "uint256" },
      { "indexed": true, "name": "creator", "type": "address" },
      { "indexed": false, "name": "itemDescription", "type": "string" },
      { "indexed": false, "name": "endTime", "type": "uint256" }
    ],
    "name": "AuctionCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "auctionId", "type": "uint256" },
      { "indexed": true, "name": "bidder", "type": "address" },
      { "indexed": false, "name": "bidIndex", "type": "uint256" }
    ],
    "name": "BidPlaced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "auctionId", "type": "uint256" },
      { "indexed": true, "name": "winner", "type": "address" },
      { "indexed": false, "name": "winningBid", "type": "uint256" }
    ],
    "name": "AuctionEnded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "auctionId", "type": "uint256" }
    ],
    "name": "AuctionCancelled",
    "type": "event"
  },

  // Read functions
  {
    "inputs": [],
    "name": "auctionCount",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "auctionFee",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "auctionId", "type": "uint256" }],
    "name": "getAuction",
    "outputs": [
      { "name": "id", "type": "uint256" },
      { "name": "creator", "type": "address" },
      { "name": "itemDescription", "type": "string" },
      { "name": "highestBidder", "type": "address" },
      { "name": "endTime", "type": "uint256" },
      { "name": "status", "type": "uint8" },
      { "name": "createdAt", "type": "uint256" },
      { "name": "totalBids", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "auctionId", "type": "uint256" }],
    "name": "getBidders",
    "outputs": [{ "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "auctionId", "type": "uint256" }],
    "name": "getWinner",
    "outputs": [{ "name": "winner", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "auctionId", "type": "uint256" }],
    "name": "bidCount",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },

  // Write functions
  {
    "inputs": [
      { "name": "itemDescription", "type": "string" },
      { "name": "reservePriceAmount", "type": "uint64" },
      { "name": "duration", "type": "uint256" }
    ],
    "name": "createAuction",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "auctionId", "type": "uint256" },
      { "name": "bidAmount", "type": "uint64" }
    ],
    "name": "placeBid",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "auctionId", "type": "uint256" }],
    "name": "endAuction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "auctionId", "type": "uint256" }],
    "name": "cancelAuction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Auction status enum
export enum AuctionStatus {
  Active = 0,
  Ended = 1,
  Cancelled = 2
}

// Type for auction data
export interface AuctionData {
  id: bigint;
  creator: string;
  itemDescription: string;
  highestBidder: string;
  endTime: bigint;
  status: AuctionStatus;
  createdAt: bigint;
  totalBids: bigint;
}

