'use client'

import { useState, useEffect } from 'react'
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AUCTION_CONTRACT_ADDRESS, AUCTION_ABI, AuctionStatus } from '@/lib/auctionContract'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function AuctionDetailPage() {
  const params = useParams()
  const auctionId = params.id as string
  const { isConnected, address } = useAccount()
  
  const [bidAmount, setBidAmount] = useState('')
  const [timeLeft, setTimeLeft] = useState('')

  // Demo auction data (replace with real contract data)
  const demoAuction = {
    id: BigInt(auctionId || 1),
    creator: '0x20ce27B140A0EEECceF880e01D2082558400FDd6',
    itemDescription: 'Rare Digital Artwork #1234',
    highestBidder: '0x0000000000000000000000000000000000000000',
    endTime: BigInt(Math.floor(Date.now() / 1000) + 86400),
    status: AuctionStatus.Active,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    totalBids: 3n,
  }

  // Fetch auction data from contract
  const { data: auctionData, isLoading: isLoadingAuction } = useContractRead({
    address: AUCTION_CONTRACT_ADDRESS as `0x${string}`,
    abi: AUCTION_ABI,
    functionName: 'getAuction',
    args: [BigInt(auctionId || 0)],
    enabled: AUCTION_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
  })

  // Use demo data if contract not deployed
  const auction = auctionData ? {
    id: auctionData[0],
    creator: auctionData[1],
    itemDescription: auctionData[2],
    highestBidder: auctionData[3],
    endTime: auctionData[4],
    status: auctionData[5] as AuctionStatus,
    createdAt: auctionData[6],
    totalBids: auctionData[7],
  } : demoAuction

  // Convert bid to uint64
  const bidAmountUint64 = bidAmount ? BigInt(Math.floor(parseFloat(bidAmount) * 1e9)) : 0n

  // Prepare place bid
  const { config: bidConfig, error: bidPrepareError } = usePrepareContractWrite({
    address: AUCTION_CONTRACT_ADDRESS as `0x${string}`,
    abi: AUCTION_ABI,
    functionName: 'placeBid',
    args: [BigInt(auctionId || 0), bidAmountUint64],
    enabled: isConnected && bidAmount.length > 0 && AUCTION_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
  })

  const { data: bidData, write: placeBid, error: bidWriteError } = useContractWrite(bidConfig)

  const { isLoading: isBidding, isSuccess: bidSuccess } = useWaitForTransaction({
    hash: bidData?.hash,
  })

  // Prepare end auction
  const { config: endConfig } = usePrepareContractWrite({
    address: AUCTION_CONTRACT_ADDRESS as `0x${string}`,
    abi: AUCTION_ABI,
    functionName: 'endAuction',
    args: [BigInt(auctionId || 0)],
    enabled: isConnected && address?.toLowerCase() === auction.creator.toLowerCase(),
  })

  const { data: endData, write: endAuction } = useContractWrite(endConfig)

  const { isLoading: isEnding, isSuccess: endSuccess } = useWaitForTransaction({
    hash: endData?.hash,
  })

  // Update time left
  useEffect(() => {
    const updateTimeLeft = () => {
      const now = BigInt(Math.floor(Date.now() / 1000))
      const diff = auction.endTime - now
      
      if (diff <= 0n) {
        setTimeLeft('Ended')
        return
      }
      
      const hours = Number(diff / 3600n)
      const minutes = Number((diff % 3600n) / 60n)
      const seconds = Number(diff % 60n)
      
      if (hours > 24) {
        setTimeLeft(`${Math.floor(hours / 24)}d ${hours % 24}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [auction.endTime])

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault()
    if (placeBid) {
      placeBid()
    }
  }

  const isCreator = address?.toLowerCase() === auction.creator.toLowerCase()
  const isActive = auction.status === AuctionStatus.Active && timeLeft !== 'Ended'
  const isContractDeployed = AUCTION_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000"

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/auction" className="text-zinc-400 hover:text-white mb-2 inline-block">
            ← Back to Auctions
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Auction Info */}
            <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-zinc-500">Auction #{auction.id.toString()}</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  isActive 
                    ? 'bg-green-500/20 text-green-400' 
                    : auction.status === AuctionStatus.Ended 
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-red-500/20 text-red-400'
                }`}>
                  {isActive ? '🟢 Active' : auction.status === AuctionStatus.Ended ? '🏁 Ended' : '❌ Cancelled'}
                </span>
              </div>

              <h1 className="text-3xl font-bold mb-4">{auction.itemDescription}</h1>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-400">Creator</p>
                  <p className="font-mono">{auction.creator.slice(0, 6)}...{auction.creator.slice(-4)}</p>
                </div>
                <div>
                  <p className="text-zinc-400">Total Bids</p>
                  <p className="text-purple-400 font-semibold">{auction.totalBids.toString()} 🔐</p>
                </div>
              </div>
            </div>

            {/* Time Left */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6">
              <p className="text-zinc-400 text-sm mb-2">Time Remaining</p>
              <p className={`text-4xl font-bold ${isActive ? 'text-green-400' : 'text-zinc-500'}`}>
                {timeLeft}
              </p>
            </div>

            {/* Bidders List */}
            <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">🔐 Encrypted Bids</h3>
              
              {auction.totalBids > 0n ? (
                <div className="space-y-3">
                  {Array.from({ length: Number(auction.totalBids) }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center bg-zinc-800/50 rounded-lg p-3">
                      <span className="font-mono text-sm text-zinc-400">Bidder #{i + 1}</span>
                      <span className="text-purple-400">🔐 ••••••</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-4">No bids yet</p>
              )}
              
              <p className="text-zinc-500 text-xs mt-4">
                All bid amounts are encrypted. Only the auction creator can decrypt them when the auction ends.
              </p>
            </div>

            {/* FHE Explanation */}
            <div className="bg-zinc-800/30 border border-zinc-700 rounded-xl p-6">
              <h3 className="font-semibold mb-4">🔐 How FHE Privacy Works</h3>
              <div className="space-y-3 text-sm text-zinc-400">
                <p>• Your bid is encrypted using <span className="text-purple-400">Fully Homomorphic Encryption</span></p>
                <p>• The contract stores encrypted values (euint64)</p>
                <p>• Nobody can see the actual bid amounts - not even other bidders</p>
                <p>• Only the auction creator can decrypt bids when the auction ends</p>
                <p>• This ensures a <span className="text-green-400">fair sealed-bid auction</span></p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {!isConnected ? (
              <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6 text-center">
                <p className="text-zinc-400 mb-4">Connect wallet to bid</p>
                <ConnectButton />
              </div>
            ) : !isContractDeployed ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                <p className="text-yellow-400 text-sm">⚠️ Contract not deployed</p>
              </div>
            ) : isCreator ? (
              /* Creator Actions */
              <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4">👑 Creator Actions</h3>
                
                {isActive ? (
                  <div className="space-y-4">
                    <p className="text-zinc-400 text-sm">
                      You can end the auction early if there are bids, or wait for it to expire.
                    </p>
                    <button
                      onClick={() => endAuction?.()}
                      disabled={isEnding || auction.totalBids === 0n}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl font-semibold transition-all"
                    >
                      {isEnding ? 'Ending...' : '🏁 End Auction'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-green-400 mb-2">✅ Auction Ended</p>
                    <p className="text-zinc-400 text-sm">
                      Winner: {auction.highestBidder.slice(0, 6)}...{auction.highestBidder.slice(-4)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Bidder Actions */
              <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4">🔐 Place Encrypted Bid</h3>
                
                {isActive ? (
                  <form onSubmit={handlePlaceBid} className="space-y-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Your Bid (ETH)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder="0.1"
                          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                          required
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">ETH</span>
                      </div>
                    </div>
                    
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                      <p className="text-purple-300 text-xs">
                        🔐 Your bid will be encrypted using FHE. Nobody can see it until the auction ends.
                      </p>
                    </div>

                    {(bidPrepareError || bidWriteError) && (
                      <p className="text-red-400 text-xs">
                        {(bidPrepareError || bidWriteError)?.message}
                      </p>
                    )}

                    {bidSuccess && (
                      <p className="text-green-400 text-xs">
                        ✅ Bid placed successfully!
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={!placeBid || isBidding || !bidAmount}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 rounded-xl font-semibold transition-all"
                    >
                      {isBidding ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Placing Bid...
                        </span>
                      ) : (
                        '🔐 Place Encrypted Bid'
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-zinc-400">Auction has ended</p>
                  </div>
                )}
              </div>
            )}

            {/* Transaction Links */}
            {(bidData?.hash || endData?.hash) && (
              <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-4">
                <a
                  href={`https://sepolia.etherscan.io/tx/${bidData?.hash || endData?.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-2"
                >
                  View on Etherscan →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

