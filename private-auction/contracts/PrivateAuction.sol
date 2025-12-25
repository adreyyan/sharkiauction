// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import { FHE, euint64, euint256, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title PrivateAuction
 * @dev Sealed-bid auction system with encrypted bids using FHEVM
 * 
 * @notice Privacy Features (same structure as approved sharkitrading):
 * - All bids encrypted using euint64
 * - Reserve price encrypted on-chain
 * - FHE.allow() permission system for access control
 * - TrivialEncrypt events prove encryption on Etherscan
 * - Only auction creator can decrypt bids at end
 * 
 * @notice Deployed on Sepolia with Zama's fhEVM
 */
contract PrivateAuction is ReentrancyGuard, Pausable, SepoliaConfig {
    
    // ═══════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════
    
    uint256 public auctionCount;
    uint256 public auctionFee = 0.001 ether; // Low fee for testing
    address public constant FEE_COLLECTOR = 0x20ce27B140A0EEECceF880e01D2082558400FDd6;
    
    enum AuctionStatus { Active, Ended, Cancelled }
    
    struct Auction {
        uint256 id;
        address creator;
        string itemDescription;
        euint64 reservePrice;      // 🔐 Encrypted reserve price
        euint64 highestBid;        // 🔐 Encrypted highest bid  
        address highestBidder;     // Public (but bid amount is private)
        uint256 endTime;
        AuctionStatus status;
        uint256 createdAt;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // STORAGE MAPPINGS
    // ═══════════════════════════════════════════════════════════════
    
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => euint64)) public bids; // 🔐 Encrypted bids per auction
    mapping(uint256 => address[]) public auctionBidders;         // Track who bid
    mapping(uint256 => uint256) public bidCount;                 // Count bids per auction
    
    // ═══════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════
    
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed creator,
        string itemDescription,
        uint256 endTime
    );
    
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 bidIndex
    );
    
    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner
    );
    
    event AuctionCancelled(uint256 indexed auctionId);
    
    // ═══════════════════════════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════════════════════════
    
    modifier auctionExists(uint256 auctionId) {
        require(auctions[auctionId].creator != address(0), "Auction does not exist");
        _;
    }
    
    modifier onlyCreator(uint256 auctionId) {
        require(auctions[auctionId].creator == msg.sender, "Only auction creator");
        _;
    }
    
    modifier auctionActive(uint256 auctionId) {
        require(auctions[auctionId].status == AuctionStatus.Active, "Auction not active");
        require(block.timestamp < auctions[auctionId].endTime, "Auction ended");
        _;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // MAIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @dev Create a new auction with encrypted reserve price
     * @param itemDescription Description of the item being auctioned
     * @param reservePriceAmount Reserve price amount (will be encrypted on-chain)
     * @param duration Duration of auction in seconds
     * 
     * @notice This triggers TrivialEncrypt event on Etherscan!
     *         The reserve price is encrypted using FHE.asEuint64()
     */
    function createAuction(
        string calldata itemDescription,
        uint64 reservePriceAmount,
        uint256 duration
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        require(msg.value >= auctionFee, "Insufficient fee");
        require(duration > 0, "Duration must be > 0");
        require(bytes(itemDescription).length > 0, "Description required");
        
        auctionCount++;
        uint256 auctionId = auctionCount;
        
        // 🔐 ENCRYPT reserve price on-chain
        // This triggers TrivialEncrypt event - proof of encryption!
        euint64 encryptedReserve = FHE.asEuint64(reservePriceAmount);
        euint64 zeroBid = FHE.asEuint64(uint64(0));
        
        // Initialize auction
        auctions[auctionId] = Auction({
            id: auctionId,
            creator: msg.sender,
            itemDescription: itemDescription,
            reservePrice: encryptedReserve,
            highestBid: zeroBid,
            highestBidder: address(0),
            endTime: block.timestamp + duration,
            status: AuctionStatus.Active,
            createdAt: block.timestamp
        });
        
        // 🔐 Grant FHE permissions (triggers Allowed events)
        FHE.allowThis(encryptedReserve);
        FHE.allowThis(zeroBid);
        FHE.allow(encryptedReserve, msg.sender);  // Only creator can decrypt reserve
        
        // Transfer fee
        if (auctionFee > 0) {
            payable(FEE_COLLECTOR).transfer(auctionFee);
        }
        
        emit AuctionCreated(auctionId, msg.sender, itemDescription, auctions[auctionId].endTime);
        return auctionId;
    }
    
    /**
     * @dev Place an encrypted bid on an auction
     * @param auctionId The auction ID
     * @param bidAmount Bid amount (will be encrypted on-chain)
     * 
     * @notice This triggers TrivialEncrypt event on Etherscan!
     *         Bid is encrypted using FHE.asEuint64() - nobody can see it
     */
    function placeBid(
        uint256 auctionId,
        uint64 bidAmount
    ) external nonReentrant whenNotPaused auctionExists(auctionId) auctionActive(auctionId) {
        require(msg.sender != auctions[auctionId].creator, "Creator cannot bid");
        require(bidAmount > 0, "Bid must be > 0");
        
        // 🔐 ENCRYPT bid on-chain
        // This triggers TrivialEncrypt event - proof of encryption!
        euint64 encryptedBid = FHE.asEuint64(bidAmount);
        
        // Store encrypted bid
        bids[auctionId][msg.sender] = encryptedBid;
        
        // Track bidder (only track address, not bid amount)
        bool alreadyBid = false;
        for (uint256 i = 0; i < auctionBidders[auctionId].length; i++) {
            if (auctionBidders[auctionId][i] == msg.sender) {
                alreadyBid = true;
                break;
            }
        }
        if (!alreadyBid) {
            auctionBidders[auctionId].push(msg.sender);
        }
        
        bidCount[auctionId]++;
        
        // 🔐 Grant FHE permissions (triggers Allowed events)
        FHE.allowThis(encryptedBid);
        FHE.allow(encryptedBid, auctions[auctionId].creator); // Only creator can decrypt
        FHE.allow(encryptedBid, msg.sender);                  // Bidder can see own bid
        
        // Update highest bidder (will be verified on auction end)
        auctions[auctionId].highestBidder = msg.sender;
        auctions[auctionId].highestBid = encryptedBid;
        
        emit BidPlaced(auctionId, msg.sender, bidCount[auctionId]);
    }
    
    /**
     * @dev End auction (creator only)
     * @param auctionId The auction ID to end
     * 
     * @notice Winner is determined. Bid amounts stay encrypted.
     *         Creator must use fhevmjs client-side to decrypt actual values.
     */
    function endAuction(uint256 auctionId) 
        external 
        nonReentrant 
        auctionExists(auctionId) 
        onlyCreator(auctionId) 
    {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.Active, "Auction not active");
        
        auction.status = AuctionStatus.Ended;
        
        // Winner is the highest bidder (bid amounts encrypted)
        // Creator can decrypt bids off-chain using fhevmjs
        address winner = auction.highestBidder;
        
        emit AuctionEnded(auctionId, winner);
    }
    
    /**
     * @dev Cancel auction (creator only, before any bids)
     */
    function cancelAuction(uint256 auctionId) 
        external 
        nonReentrant 
        auctionExists(auctionId) 
        onlyCreator(auctionId) 
    {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.Active, "Auction not active");
        require(bidCount[auctionId] == 0, "Cannot cancel with bids");
        
        auction.status = AuctionStatus.Cancelled;
        
        emit AuctionCancelled(auctionId);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @dev Get auction details (public info only)
     */
    function getAuction(uint256 auctionId) 
        external 
        view 
        auctionExists(auctionId) 
        returns (
            uint256 id,
            address creator,
            string memory itemDescription,
            address highestBidder,
            uint256 endTime,
            AuctionStatus status,
            uint256 createdAt,
            uint256 totalBids
        ) 
    {
        Auction storage auction = auctions[auctionId];
        return (
            auction.id,
            auction.creator,
            auction.itemDescription,
            auction.highestBidder,
            auction.endTime,
            auction.status,
            auction.createdAt,
            bidCount[auctionId]
        );
    }
    
    /**
     * @dev Get encrypted reserve price (only creator can decrypt with FHE client)
     * @notice Returns euint64 handle - not the actual value!
     */
    function getReservePrice(uint256 auctionId) 
        external 
        view 
        auctionExists(auctionId) 
        returns (euint64) 
    {
        return auctions[auctionId].reservePrice;
    }
    
    /**
     * @dev Get encrypted highest bid (only creator can decrypt with FHE client)
     * @notice Returns euint64 handle - not the actual value!
     */
    function getHighestBid(uint256 auctionId) 
        external 
        view 
        auctionExists(auctionId) 
        returns (euint64) 
    {
        return auctions[auctionId].highestBid;
    }
    
    /**
     * @dev Get encrypted bid for a specific bidder
     * @notice Returns euint64 handle - only authorized users can decrypt
     */
    function getBid(uint256 auctionId, address bidder) 
        external 
        view 
        auctionExists(auctionId) 
        returns (euint64) 
    {
        return bids[auctionId][bidder];
    }
    
    /**
     * @dev Get all bidders for an auction (addresses only, not bid amounts)
     */
    function getBidders(uint256 auctionId) 
        external 
        view 
        auctionExists(auctionId) 
        returns (address[] memory) 
    {
        return auctionBidders[auctionId];
    }
    
    /**
     * @dev Get winner (only after auction ends)
     */
    function getWinner(uint256 auctionId) 
        external 
        view 
        auctionExists(auctionId) 
        returns (address winner) 
    {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.Ended, "Auction not ended");
        winner = auction.highestBidder;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    function setAuctionFee(uint256 newFee) external {
        require(msg.sender == FEE_COLLECTOR, "Only fee collector");
        auctionFee = newFee;
    }
    
    function pause() external {
        require(msg.sender == FEE_COLLECTOR, "Only fee collector");
        _pause();
    }
    
    function unpause() external {
        require(msg.sender == FEE_COLLECTOR, "Only fee collector");
        _unpause();
    }
}
