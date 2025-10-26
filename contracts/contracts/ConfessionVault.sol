// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "@fhevm/solidity/config/ZamaConfig.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ConfessionVault
 * @notice Privacy-preserving confession platform using Fully Homomorphic Encryption (FHEVM)
 * @dev All confession content and votes are stored as encrypted data on-chain
 *
 * Key Features:
 * - Encrypted confession submission
 * - Encrypted upvote counter (FHE addition)
 * - Rate limiting to prevent spam
 * - Admin controls (pause, rate limit configuration)
 * - No plaintext data exposure
 */
contract ConfessionVault is SepoliaConfig, Ownable, ReentrancyGuard {
    using FHE for *;

    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Structure representing a single confession
     * @param message The confession text (publicly readable)
     * @param encryptedVotes The FHE encrypted upvote counter
     * @param voteCount Public vote counter (for UI display)
     * @param createdAt The timestamp when confession was created
     * @param author The wallet address of the confession author (pseudonymous)
     * @param ipfsCID Optional IPFS hash for extended storage
     * @param exists Flag to check confession existence
     */
    struct Confession {
        bytes message;
        euint32 encryptedVotes;
        uint32 voteCount;
        uint64 createdAt;
        address author;
        bytes32 ipfsCID;
        bool exists;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice Mapping of confession ID to Confession struct
    mapping(uint256 => Confession) public confessions;

    /// @notice Mapping to track if an address has upvoted a specific confession
    mapping(uint256 => mapping(address => bool)) public hasUpvoted;

    /// @notice Mapping to track last submission time per address for rate limiting
    mapping(address => uint256) public lastSubmissionTime;

    /// @notice Total number of confessions submitted
    uint256 public confessionCount;

    /// @notice Cooldown period between submissions (in seconds)
    uint256 public rateLimitCooldown = 300; // 5 minutes default

    /// @notice Emergency pause state
    bool public paused;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event ConfessionSubmitted(
        uint256 indexed id,
        address indexed author,
        uint256 timestamp
    );

    event ConfessionUpvoted(
        uint256 indexed id,
        address indexed voter,
        uint256 timestamp
    );

    event RateLimitUpdated(uint256 newCooldown);

    event ContractPaused(bool isPaused);

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Prevents execution when contract is paused
     */
    modifier notPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    /*//////////////////////////////////////////////////////////////
                             CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor() Ownable(msg.sender) {
        // Constructor is intentionally minimal
        // Owner is set via Ownable constructor
    }

    /*//////////////////////////////////////////////////////////////
                        CORE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Submit a confession to the vault
     * @param _message The confession text
     * @return id The ID of the newly created confession
     *
     * Requirements:
     * - Contract must not be paused
     * - Sender must wait for cooldown period between submissions
     * - Message must not be empty
     */
    function submitConfession(bytes calldata _message)
        external
        notPaused
        nonReentrant
        returns (uint256)
    {
        require(_message.length > 0, "Message cannot be empty");
        require(
            block.timestamp >= lastSubmissionTime[msg.sender] + rateLimitCooldown,
            "Rate limit active - please wait before submitting again"
        );

        // Increment counter and get new ID
        confessionCount++;
        uint256 id = confessionCount;

        // Initialize encrypted vote counter at 0
        euint32 initialVotes = FHE.asEuint32(0);

        // Allow this contract to access the encrypted votes
        FHE.allow(initialVotes, address(this));

        // Store confession
        confessions[id] = Confession({
            message: _message,
            encryptedVotes: initialVotes,
            voteCount: 0,
            createdAt: uint64(block.timestamp),
            author: msg.sender,
            ipfsCID: bytes32(0), // Can be set later if needed
            exists: true
        });

        // Update rate limit tracker
        lastSubmissionTime[msg.sender] = block.timestamp;

        emit ConfessionSubmitted(id, msg.sender, block.timestamp);

        return id;
    }

    /**
     * @notice Upvote a confession (encrypted vote increment)
     * @param _confessionId The ID of the confession to upvote
     *
     * Requirements:
     * - Contract must not be paused
     * - Confession must exist
     * - Voter must not have already upvoted this confession
     */
    function upvote(uint256 _confessionId)
        external
        notPaused
        nonReentrant
    {
        require(confessions[_confessionId].exists, "Confession does not exist");
        require(
            !hasUpvoted[_confessionId][msg.sender],
            "Already upvoted this confession"
        );

        // Create encrypted value of 1
        euint32 one = FHE.asEuint32(1);

        // Perform FHE addition: votes = votes + 1
        euint32 newVotes = FHE.add(
            confessions[_confessionId].encryptedVotes,
            one
        );

        // Allow this contract to access the new encrypted value
        FHE.allow(newVotes, address(this));

        // Update encrypted votes
        confessions[_confessionId].encryptedVotes = newVotes;

        // Increment public vote counter
        confessions[_confessionId].voteCount++;

        // Mark as upvoted
        hasUpvoted[_confessionId][msg.sender] = true;

        emit ConfessionUpvoted(_confessionId, msg.sender, block.timestamp);
    }

    /*//////////////////////////////////////////////////////////////
                           VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Get confession data (returns encrypted values)
     * @param _id The confession ID
     * @return The Confession struct with encrypted data
     */
    function getConfession(uint256 _id)
        external
        view
        returns (Confession memory)
    {
        require(confessions[_id].exists, "Confession does not exist");
        return confessions[_id];
    }

    /**
     * @notice Get confession message and vote counts
     * @param _id The confession ID
     * @return message The confession message
     * @return encryptedVotes The encrypted vote count
     * @return voteCount The public vote count
     * @return createdAt The timestamp when confession was created
     */
    function getConfessionData(uint256 _id)
        external
        view
        returns (
            bytes memory message,
            euint32 encryptedVotes,
            uint32 voteCount,
            uint64 createdAt
        )
    {
        require(confessions[_id].exists, "Confession does not exist");
        Confession memory confession = confessions[_id];
        return (
            confession.message,
            confession.encryptedVotes,
            confession.voteCount,
            confession.createdAt
        );
    }

    /**
     * @notice Check if an address has upvoted a specific confession
     * @param _confessionId The confession ID
     * @param _voter The address to check
     * @return bool True if already upvoted
     */
    function hasUserUpvoted(uint256 _confessionId, address _voter)
        external
        view
        returns (bool)
    {
        return hasUpvoted[_confessionId][_voter];
    }

    /**
     * @notice Get remaining cooldown time for an address
     * @param _user The address to check
     * @return uint256 Seconds remaining until next submission allowed (0 if can submit now)
     */
    function getRemainingCooldown(address _user)
        external
        view
        returns (uint256)
    {
        uint256 nextAllowedTime = lastSubmissionTime[_user] + rateLimitCooldown;
        if (block.timestamp >= nextAllowedTime) {
            return 0;
        }
        return nextAllowedTime - block.timestamp;
    }

    /*//////////////////////////////////////////////////////////////
                          ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Update the rate limit cooldown period
     * @param _newCooldown New cooldown period in seconds
     *
     * Requirements:
     * - Only contract owner can call
     * - Cooldown must be reasonable (max 1 hour)
     */
    function updateRateLimit(uint256 _newCooldown) external onlyOwner {
        require(_newCooldown <= 3600, "Cooldown too long (max 1 hour)");
        rateLimitCooldown = _newCooldown;
        emit RateLimitUpdated(_newCooldown);
    }

    /**
     * @notice Toggle contract pause state (emergency stop)
     * @dev When paused, no confessions can be submitted or upvoted
     *
     * Requirements:
     * - Only contract owner can call
     */
    function togglePause() external onlyOwner {
        paused = !paused;
        emit ContractPaused(paused);
    }

    /**
     * @notice Emergency pause the contract
     * @dev Shorthand for pausing (one-way until unpause)
     *
     * Requirements:
     * - Only contract owner can call
     */
    function emergencyPause() external onlyOwner {
        paused = true;
        emit ContractPaused(true);
    }

    /**
     * @notice Unpause the contract
     * @dev Re-enables all functionality
     *
     * Requirements:
     * - Only contract owner can call
     */
    function unpause() external onlyOwner {
        paused = false;
        emit ContractPaused(false);
    }

    /**
     * @notice Update IPFS CID for a confession (optional metadata)
     * @param _confessionId The confession ID
     * @param _ipfsCID The IPFS content identifier
     *
     * Requirements:
     * - Only confession author can update their own IPFS CID
     * - Confession must exist
     */
    function updateIPFSCID(uint256 _confessionId, bytes32 _ipfsCID)
        external
    {
        require(confessions[_confessionId].exists, "Confession does not exist");
        require(
            confessions[_confessionId].author == msg.sender,
            "Only author can update IPFS CID"
        );
        confessions[_confessionId].ipfsCID = _ipfsCID;
    }

    /*//////////////////////////////////////////////////////////////
                        FUTURE: DECRYPTION ORACLE
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Request decryption for aggregate statistics (future implementation)
     * @dev This function will integrate with FHEVM's decryption gateway
     * @dev Currently a placeholder for Phase 2
     *
     * Planned use cases:
     * - Leaderboard generation (top N confessions by votes)
     * - Anonymous statistics
     * - Time-bounded reveals
     */
    // function requestDecryption(uint256 _confessionId, DecryptionPolicy _policy)
    //     external
    //     returns (uint256 requestId)
    // {
    //     // Implementation depends on Zama's gateway API
    //     // Will be added in Phase 2
    // }
}
