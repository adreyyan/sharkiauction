# 🚀 Deployment Instructions

## ✅ Contract Compiled Successfully!

The PrivateAuction contract is ready to deploy to Sepolia.

---

## 📋 Deployment Steps

### 1. Set Your Private Key

**Option A: Set in terminal (recommended for one-time deploy)**
```bash
export PRIVATE_KEY=your_private_key_here
export SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/4Bf12QaQ6tjN7-92DiLEO"
```

**Option B: Create `.env` file** (if you want to keep it)
```bash
cd private-auction
echo "PRIVATE_KEY=your_private_key_here" > .env
echo "SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/4Bf12QaQ6tjN7-92DiLEO" >> .env
```

### 2. Deploy to Sepolia

```bash
cd private-auction
npx hardhat run scripts/deploy.js --network sepolia
```

---

## ⚠️ Important Notes

1. **Private Key Security**
   - Never commit your private key to git
   - Use a test wallet with minimal funds
   - The `.env` file is in `.gitignore`

2. **Sepolia ETH Required**
   - You need Sepolia testnet ETH for gas
   - Get it from: https://sepoliafaucet.com/

3. **After Deployment**
   - Save the contract address
   - Update it in your frontend
   - Verify on Etherscan (optional)

---

## 📝 Expected Output

```
🔨 Deploying Private Auction Contract...

Deploying with account: 0xYourAddress...
Account balance: 1000000000000000000

📝 Deploying PrivateAuction...
✅ PrivateAuction deployed to: 0xContractAddress...

📋 Contract Details:
   Network: sepolia
   Address: 0xContractAddress...
   Explorer: https://sepolia.etherscan.io/address/0xContractAddress...

✅ Deployment complete!
```

---

## 🔍 Verify Contract (Optional)

After deployment, verify on Etherscan:

```bash
npx hardhat verify --network sepolia 0xContractAddress
```

---

## 🎯 Next Steps

1. ✅ Deploy contract (you're here!)
2. Update frontend with contract address
3. Test creating auctions
4. Test placing bids
5. Record demo video
6. Submit to hackathon!

---

**Ready to deploy! Just set your PRIVATE_KEY and run the deploy command! 🚀**

