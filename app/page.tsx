'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import Link from 'next/link'

export default function Home() {
  const { isConnected, address } = useAccount()

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              🔨 Private Auction System
            </h1>
            <p className="text-xl text-zinc-400 mb-8">
              Sealed-bid auctions with encrypted bids using Zama's FHEVM
            </p>
            
            {/* Wallet Connect */}
            <div className="flex justify-center mb-8">
              <ConnectButton />
            </div>
          </div>

          {/* Main Content */}
          {isConnected ? (
            <div className="space-y-6">
              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/auction"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl p-6 text-center transition-all transform hover:scale-105"
                >
                  <div className="text-3xl mb-2">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">Browse Auctions</h3>
                  <p className="text-zinc-300 text-sm">View and bid on active auctions</p>
                </Link>
                
                <Link
                  href="/auction/create"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl p-6 text-center transition-all transform hover:scale-105"
                >
                  <div className="text-3xl mb-2">➕</div>
                  <h3 className="text-xl font-semibold mb-2">Create Auction</h3>
                  <p className="text-zinc-300 text-sm">Start a new sealed-bid auction</p>
                </Link>
              </div>

              {/* Welcome Card */}
              <div className="bg-zinc-900/50 backdrop-blur-lg border border-zinc-800 rounded-2xl p-8">
                <h2 className="text-2xl font-semibold mb-6">Welcome, {address?.slice(0, 6)}...{address?.slice(-4)}</h2>
                
                <div className="space-y-4">
                  <div className="bg-zinc-800/50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">🎯 What is Private Auction?</h3>
                    <p className="text-zinc-300">
                      A sealed-bid auction system where all bids are encrypted on-chain using FHEVM. 
                      Only the auction creator can decrypt bids when the auction ends.
                    </p>
                  </div>

                  <div className="bg-zinc-800/50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">🔐 Privacy Features</h3>
                    <ul className="list-disc list-inside text-zinc-300 space-y-2">
                      <li>Encrypted reserve prices</li>
                      <li>Encrypted bid storage</li>
                      <li>Homomorphic bid comparisons</li>
                      <li>Permission-based decryption</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-800/50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">⚡ How It Works</h3>
                    <div className="grid grid-cols-4 gap-4 text-center text-sm">
                      <div>
                        <div className="text-2xl mb-1">1️⃣</div>
                        <p className="text-zinc-400">Create auction with encrypted reserve</p>
                      </div>
                      <div>
                        <div className="text-2xl mb-1">2️⃣</div>
                        <p className="text-zinc-400">Bidders place encrypted bids</p>
                      </div>
                      <div>
                        <div className="text-2xl mb-1">3️⃣</div>
                        <p className="text-zinc-400">Bids stay private</p>
                      </div>
                      <div>
                        <div className="text-2xl mb-1">4️⃣</div>
                        <p className="text-zinc-400">Winner revealed at end</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/50 backdrop-blur-lg border border-zinc-800 rounded-2xl p-8 text-center">
              <p className="text-zinc-400 text-lg mb-6">
                Connect your wallet to get started
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-zinc-800/50 p-4 rounded-xl">
                  <div className="text-2xl mb-2">🔐</div>
                  <p className="text-zinc-400">Encrypted Bids</p>
                </div>
                <div className="bg-zinc-800/50 p-4 rounded-xl">
                  <div className="text-2xl mb-2">🛡️</div>
                  <p className="text-zinc-400">Fair Auctions</p>
                </div>
                <div className="bg-zinc-800/50 p-4 rounded-xl">
                  <div className="text-2xl mb-2">⚡</div>
                  <p className="text-zinc-400">On-Chain Privacy</p>
                </div>
              </div>
            </div>
          )}

          {/* Built with Zama */}
          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-sm">
              Built with <span className="text-purple-400">Zama FHEVM</span> • Powered by Fully Homomorphic Encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
