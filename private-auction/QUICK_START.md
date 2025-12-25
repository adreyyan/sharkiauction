# 🚀 Quick Start Guide - Private Auction System

## 📦 Setup

### 1. Install Dependencies

```bash
cd private-auction
npm install
```

### 2. Configure Environment

Create `.env` file:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_private_key_here
```

### 3. Compile Contract

```bash
npm run compile
```

---

## 🚀 Deployment

### Deploy to Sepolia

```bash
npm run deploy sepolia
```

### Deploy Locally (for testing)

```bash
# Terminal 1: Start Hardhat node
npm run node

# Terminal 2: Deploy
npm run deploy localhost
```

---

## 🧪 Testing

### Test Contract Locally

```bash
# Start local node
npm run node

# In another terminal, run tests
npm test
```

---

## 📝 Contract Usage

### 1. Create Auction

```typescript
import { encryptAmount } from './lib/fhevm';
import { ethers } from 'ethers';

// Connect to contract
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const auction = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

// Encrypt reserve price
const reservePrice = ethers.parseEther("1.0");
const { encryptedData, inputProof } = await encryptAmount(
  reservePrice.toString(),
  provider
);

// Create auction
const tx = await auction.createAuction(
  "Rare NFT #1234",
  encryptedData,
  inputProof,
  86400 // 24 hours
);

await tx.wait();
console.log("✅ Auction created!");
```

### 2. Place Bid

```typescript
// Encrypt bid
const bidAmount = ethers.parseEther("1.5");
const { encryptedData, inputProof } = await encryptAmount(
  bidAmount.toString(),
  provider
);

// Place bid
const tx = await auction.placeBid(
  auctionId,
  encryptedData,
  inputProof
);

await tx.wait();
console.log("✅ Bid placed!");
```

### 3. End Auction

```typescript
// Only creator can end
const tx = await auction.endAuction(auctionId);
await tx.wait();

// Get winner
const [winner, winningBid] = await auction.getWinner(auctionId);
console.log(`Winner: ${winner}, Bid: ${ethers.formatEther(winningBid)} ETH`);
```

---

## 🔐 Privacy Features Demonstrated

### What's Encrypted:
- ✅ Reserve price
- ✅ All bid amounts
- ✅ Highest bid

### What's Public:
- ✅ Auction description
- ✅ Creator address
- ✅ Bidder addresses (but not amounts!)
- ✅ Auction end time
- ✅ Winner address (after auction ends)

### Homomorphic Operations:
- ✅ `FHE.gt()` - Compare bids without decrypting
- ✅ `FHE.gte()` - Check if bid meets reserve

---

## 📊 Example Flow

```
1. Creator creates auction
   - Reserve: 1.0 ETH (encrypted)
   - Duration: 24 hours
   - On Sepolia: Reserve shows as encrypted ciphertext

2. Bidder A places bid
   - Bid: 1.5 ETH (encrypted)
   - Contract compares: FHE.gt(1.5, 0) = true
   - Updates highest bidder (but amount stays encrypted)

3. Bidder B places bid
   - Bid: 2.0 ETH (encrypted)
   - Contract compares: FHE.gt(2.0, 1.5) = true
   - Updates highest bidder

4. Creator ends auction
   - Decrypts all bids
   - Finds winner: Bidder B with 2.0 ETH
   - Winner revealed on-chain
```

---

## 🎬 Demo Script

### For Hackathon Judges:

1. **Show Problem**
   - "Traditional auctions expose all bids"
   - "This allows bid sniping and manipulation"

2. **Show Solution**
   - Create auction with encrypted reserve
   - Show on Sepolia explorer (encrypted data)

3. **Show Privacy**
   - Multiple bidders place encrypted bids
   - Show all bids are encrypted
   - Try to decrypt as unauthorized user → Fails

4. **Show Homomorphic Magic**
   - "Contract compares bids without decrypting"
   - Show `FHE.gt()` operation

5. **Show Winner Reveal**
   - Creator ends auction
   - Decrypts and reveals winner
   - Winner announced

---

## 🐛 Troubleshooting

### "Cannot find module 'fhevmjs'"
```bash
npm install fhevmjs
```

### "Invalid proof"
- Check you're using correct chain ID
- Verify gateway URL is correct
- Ensure FHEVM is properly initialized

### "Cannot decrypt"
- Only auction creator can decrypt
- Check you have proper permissions
- Verify you're using creator's wallet

---

## 📚 Next Steps

1. ✅ Deploy contract
2. ✅ Test locally
3. ✅ Create frontend UI
4. ✅ Record demo video
5. ✅ Submit to hackathon!

---

**Good luck! 🏆**

