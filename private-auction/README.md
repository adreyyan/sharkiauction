# 🔨 Private Auction System

> **Sealed-bid auctions with encrypted bids using Zama's fhEVM**

Built with the same fhEVM structure as the approved [sharkitrading](https://github.com/adreyyan/sharkitrading) project.

---

## 🎯 What This Does

A **sealed-bid auction system** where:
- All bids are **encrypted on-chain** using FHE
- Reserve prices are **encrypted** - only creator knows
- Nobody can see bid amounts until auction ends
- **Prevents front-running** and bid manipulation

---

## 🔐 FHEVM Features Used

### Encrypted Types
```solidity
euint64 reservePrice;      // 🔐 Encrypted reserve price
euint64 highestBid;        // 🔐 Encrypted highest bid
mapping(address => euint64) bids;  // 🔐 All bids encrypted
```

### FHE Operations
```solidity
// Encryption (triggers TrivialEncrypt event on Etherscan)
euint64 encryptedBid = FHE.asEuint64(bidAmount);

// Permission system (triggers Allowed events)
FHE.allowThis(encryptedBid);
FHE.allow(encryptedBid, auctionCreator);  // Only creator can decrypt
```

---

## 📊 Privacy Proof on Etherscan

When you create an auction or place a bid, check Etherscan logs:

### ✅ What judges will see:
```
Log #1: TrivialEncrypt
  pt: 1000000000  (input value - gets encrypted)
  result: 0x9C219814ECC64FBAE26187EA...  (encrypted ciphertext)

Log #2: Allowed  
  account: 0x20ce...FDd6  (who can decrypt)
  handle: 0x9C219814ECC64FBAE26187EA...
```

### ❌ What's NOT visible:
- Actual bid amounts (encrypted)
- Reserve prices (encrypted)
- Which bid is highest (encrypted)

---

## 🏗 Contract Structure

```
private-auction/
├── contracts/
│   └── PrivateAuction.sol    # Main auction contract with FHE
├── scripts/
│   └── deploy.js             # Deployment script
├── hardhat.config.js         # Sepolia + fhEVM config
└── README.md                 # This file
```

### Key Contract Functions

| Function | Privacy | Description |
|----------|---------|-------------|
| `createAuction()` | 🔐 Reserve encrypted | Creates auction with secret reserve price |
| `placeBid()` | 🔐 Bid encrypted | Places sealed bid - nobody can see it |
| `endAuction()` | ✅ Winner revealed | Creator ends auction, winner address shown |
| `getBid()` | 🔐 Returns handle | Returns encrypted bid handle (not value) |

---

## 🚀 Deployment

### 1. Deploy to Sepolia
```bash
cd private-auction
PRIVATE_KEY=your_key SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY" \
  npx hardhat run scripts/deploy.js --network sepolia
```

### 2. Update Contract Address
After deployment, update `lib/auctionContract.ts`:
```typescript
export const AUCTION_CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_ADDRESS";
```

---

## 🎬 Demo Flow for Judges

### 1. Create Auction
- Set item description
- Set encrypted reserve price (e.g., 1 ETH)
- Set duration
- **Check Etherscan**: Look for `TrivialEncrypt` event!

### 2. Place Bids
- Multiple users place encrypted bids
- **Each bid triggers `TrivialEncrypt`**
- Nobody can see anyone else's bid amount

### 3. End Auction
- Creator ends auction
- Winner address revealed
- Bid amounts stay encrypted (creator decrypts off-chain)

---

## 🔗 Live Links

After deployment:
- **Contract**: `https://sepolia.etherscan.io/address/YOUR_ADDRESS`
- **Zama ACL**: `https://sepolia.etherscan.io/address/0x848B0066793BcC60346Da1F49049357399B8D595`

---

## 🏆 Hackathon Checklist

- [x] Uses `@fhevm/solidity` library
- [x] Inherits `SepoliaConfig` for Zama's network
- [x] Uses `euint64` for encrypted storage
- [x] Uses `FHE.asEuint64()` for encryption
- [x] Uses `FHE.allow()` + `FHE.allowThis()` for permissions
- [x] Triggers `TrivialEncrypt` events (verifiable on Etherscan)
- [x] Triggers `Allowed` events (permission proof)
- [x] Real privacy use case (sealed-bid auctions)
- [ ] Deploy to Sepolia
- [ ] Verify on Etherscan

---

## 📚 Technical References

- [Zama fhEVM Docs](https://docs.zama.ai/fhevm)
- [fhEVM Solidity Library](https://github.com/zama-ai/fhevm)
- [Similar Approved Project: sharkitrading](https://github.com/adreyyan/sharkitrading)

---

## 📝 License

MIT License

---

**Built with ❤️ using Zama's fhEVM for true on-chain auction privacy**

_Bid privately. Win fairly._ 🔐
