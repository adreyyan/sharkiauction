'use client'

import { useState, useEffect } from 'react'
import { useAccount, useContractRead } from 'wagmi'
import Link from 'next/link'
import { AUCTION_CONTRACT_ADDRESS, AUCTION_ABI, AuctionStatus, AuctionData } from '@/lib/auctionContract'

export default function AuctionsPage() {
  const { isConnected } = useAccount()
  const [auctions, setAuctions] = useState<AuctionData[]>([])
  const [loading, setLoading] = useState(true)

  // Get auction count
  const { data: auctionCount } = useContractRead({
    address: AUCTION_CONTRACT_ADDRESS as `0x${string}`,
    abi: AUCTION_ABI,
    functionName: 'auctionCount',
    watch: true,
  })

  // Fetch all auctions
  useEffect(() => {
    const fetchAuctions = async () => {
      if (!auctionCount || AUCTION_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
        setLoading(false)
        return
      }

      const count = Number(auctionCount)
      const auctionList: AuctionData[] = []

      // This would need to be done via multicall or individual reads
      // For demo, we'll show placeholder data
      setLoading(false)
    }

    fetchAuctions()
  }, [auctionCount])

  const getStatusBadge = (status: AuctionStatus) => {
    switch (status) {
      case AuctionStatus.Active:
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">🟢 Active</span>
      case AuctionStatus.Ended:
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">🏁 Ended</span>
      case AuctionStatus.Cancelled:
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">❌ Cancelled</span>
    }
  }

  const formatTimeLeft = (endTime: bigint) => {
    const now = BigInt(Math.floor(Date.now() / 1000))
    const diff = endTime - now
    if (diff <= 0n) return 'Ended'
    
    const hours = Number(diff / 3600n)
    const minutes = Number((diff % 3600n) / 60n)
    
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  // Demo auctions for UI preview
  const demoAuctions = [
    {
      id: 1n,
      creator: '0x20ce...FDd6',
      itemDescription: 'Rare Digital Artwork #1234',
      highestBidder: '0x0000000000000000000000000000000000000000',
      endTime: BigInt(Math.floor(Date.now() / 1000) + 86400),
      status: AuctionStatus.Active,
      createdAt: BigInt(Math.floor(Date.now() / 1000)),
      totalBids: 3n,
    },
    {
      id: 2n,
      creator: '0x1234...5678',
      itemDescription: 'Exclusive NFT Collection Access',
      highestBidder: '0x9876...5432',
      endTime: BigInt(Math.floor(Date.now() / 1000) + 3600),
      status: AuctionStatus.Active,
      createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400),
      totalBids: 7n,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-zinc-400 hover:text-white mb-2 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              🔨 Auctions
            </h1>
            <p className="text-zinc-400 mt-2">Browse and bid on sealed-bid auctions</p>
          </div>
          
          {isConnected && (
            <Link
              href="/auction/create"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-semibold transition-all"
            >
              + Create Auction
            </Link>
          )}
        </div>

        {/* Contract Status Banner */}
        {AUCTION_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <p className="text-yellow-400">
              ⚠️ Contract not deployed yet. Deploy to Sepolia and update the address in <code className="bg-zinc-800 px-2 py-1 rounded">lib/auctionContract.ts</code>
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 text-sm">Total Auctions</p>
            <p className="text-3xl font-bold">{auctionCount?.toString() || '0'}</p>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 text-sm">Active Auctions</p>
            <p className="text-3xl font-bold text-green-400">{demoAuctions.filter(a => a.status === AuctionStatus.Active).length}</p>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 text-sm">Auction Fee</p>
            <p className="text-3xl font-bold">0.01 ETH</p>
          </div>
        </div>

        {/* Auctions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Live Auctions</h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : demoAuctions.length === 0 ? (
            <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-12 text-center">
              <p className="text-zinc-400 text-lg">No auctions yet</p>
              <p className="text-zinc-500 mt-2">Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoAuctions.map((auction) => (
                <Link
                  key={auction.id.toString()}
                  href={`/auction/${auction.id}`}
                  className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6 hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-zinc-500 text-sm">#{auction.id.toString()}</span>
                    {getStatusBadge(auction.status)}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                    {auction.itemDescription}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-zinc-400">
                    <div className="flex justify-between">
                      <span>Creator</span>
                      <span className="font-mono">{auction.creator}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bids</span>
                      <span className="text-purple-400 font-semibold">{auction.totalBids.toString()} 🔐</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Left</span>
                      <span className={auction.status === AuctionStatus.Active ? 'text-green-400' : 'text-zinc-500'}>
                        {formatTimeLeft(auction.endTime)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500">
                      🔐 All bids are encrypted using FHE
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">🔐 How FHE Auctions Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">1️⃣</div>
              <p className="text-zinc-400">Creator sets encrypted reserve price</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">2️⃣</div>
              <p className="text-zinc-400">Bidders place encrypted bids</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">3️⃣</div>
              <p className="text-zinc-400">Nobody can see bid amounts</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">4️⃣</div>
              <p className="text-zinc-400">Winner revealed when auction ends</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

