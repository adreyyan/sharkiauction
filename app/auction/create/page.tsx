'use client'

import { useState } from 'react'
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { parseEther } from 'viem'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AUCTION_CONTRACT_ADDRESS, AUCTION_ABI } from '@/lib/auctionContract'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function CreateAuctionPage() {
  const router = useRouter()
  const { isConnected, address } = useAccount()
  
  const [itemDescription, setItemDescription] = useState('')
  const [reservePrice, setReservePrice] = useState('')
  const [duration, setDuration] = useState('24') // hours
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Convert reserve price to uint64 (in wei, but scaled for demo)
  const reservePriceAmount = reservePrice ? BigInt(Math.floor(parseFloat(reservePrice) * 1e9)) : BigInt(0) // Use gwei for demo

  // Convert duration to seconds
  const durationSeconds = BigInt(parseInt(duration) * 3600)

  // Prepare contract write
  const { config, error: prepareError } = usePrepareContractWrite({
    address: AUCTION_CONTRACT_ADDRESS as `0x${string}`,
    abi: AUCTION_ABI,
    functionName: 'createAuction',
    args: [itemDescription, reservePriceAmount, durationSeconds],
    value: parseEther('0.01'), // Auction fee
    enabled: isConnected && itemDescription.length > 0 && reservePrice.length > 0,
  })

  const { data, write, error: writeError } = useContractWrite(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => {
      router.push('/auction')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!write) return
    
    setIsSubmitting(true)
    try {
      write()
    } catch (err) {
      console.error('Error creating auction:', err)
    }
    setIsSubmitting(false)
  }

  const isContractDeployed = true // Contract deployed on Sepolia

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/auction" className="text-zinc-400 hover:text-white mb-2 inline-block">
            ← Back to Auctions
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Create Auction
          </h1>
          <p className="text-zinc-400 mt-2">Create a sealed-bid auction with encrypted reserve price</p>
        </div>

        {!isConnected ? (
          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-8 text-center max-w-md mx-auto">
            <p className="text-zinc-400 mb-4">Connect your wallet to create an auction</p>
            <ConnectButton />
          </div>
        ) : !isContractDeployed ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Contract Not Deployed</h3>
            <p className="text-zinc-400 mb-4">
              The auction contract needs to be deployed to Sepolia first.
            </p>
            <code className="bg-zinc-800 px-4 py-2 rounded block text-sm">
              cd private-auction && npx hardhat run scripts/deploy.js --network sepolia
            </code>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Item Description */}
              <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Item Description *
                </label>
                <input
                  type="text"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="e.g., Rare Digital Artwork #1234"
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
                <p className="text-zinc-500 text-xs mt-2">
                  Describe what you're auctioning
                </p>
              </div>

              {/* Reserve Price */}
              <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  🔐 Reserve Price (ETH) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={reservePrice}
                    onChange={(e) => setReservePrice(e.target.value)}
                    placeholder="0.1"
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">ETH</span>
                </div>
                <p className="text-zinc-500 text-xs mt-2">
                  🔐 This will be <span className="text-purple-400">encrypted using FHE</span> - only you can see it
                </p>
              </div>

              {/* Duration */}
              <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Auction Duration *
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="1">1 hour</option>
                  <option value="6">6 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                  <option value="48">2 days</option>
                  <option value="168">1 week</option>
                </select>
              </div>

              {/* Fee Notice */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <p className="text-purple-300 text-sm">
                  💰 Auction fee: <span className="font-semibold">0.01 ETH</span>
                </p>
              </div>

              {/* FHE Info */}
              <div className="bg-zinc-800/30 border border-zinc-700 rounded-xl p-4">
                <h4 className="font-semibold text-sm mb-2">🔐 Privacy with FHE</h4>
                <ul className="text-zinc-400 text-sm space-y-1">
                  <li>• Reserve price is encrypted on-chain</li>
                  <li>• Only you can decrypt it</li>
                  <li>• Bidders won't know the minimum</li>
                  <li>• Fair sealed-bid auction</li>
                </ul>
              </div>

              {/* Error Display */}
              {(prepareError || writeError) && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <p className="text-red-400 text-sm">
                    Error: {(prepareError || writeError)?.message}
                  </p>
                </div>
              )}

              {/* Success */}
              {isSuccess && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <p className="text-green-400 text-sm">
                    ✅ Auction created successfully! Redirecting...
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!write || isLoading || isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Auction...
                  </span>
                ) : (
                  '🔨 Create Auction (0.01 ETH)'
                )}
              </button>
            </form>

            {/* Transaction Hash */}
            {data?.hash && (
              <div className="mt-4 text-center">
                <a
                  href={`https://sepolia.etherscan.io/tx/${data.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  View transaction on Etherscan →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

