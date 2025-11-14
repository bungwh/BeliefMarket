// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, externalEuint64, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title ObscuraBeliefMarket
 * @notice Privacy-preserving prediction market with FHE encrypted vote weights
 * @dev Market creation and user vote info are public, but vote weights are encrypted
 *      - Users submit YES/NO votes with encrypted confidence weights (1-100)
 *      - Weights are aggregated using FHE operations (addition)
 *      - Creator can request decryption to reveal final totals
 *      - Winners share prize pool based on revealed weights
 */
contract ObscuraBeliefMarket is ZamaEthereumConfig {
    struct BetInfo {
        string title;
        string description;
        address creator;
        uint256 platformStake;
        uint256 voteStake;
        uint256 expiryTime;
        bool isResolved;
        uint256 prizePool;
        bool yesWon;
        bool cancelled;
        uint256 yesVoters;
        uint256 noVoters;
        // FHE encrypted aggregated weights
        euint64 yesWeightSum;
        euint64 noWeightSum;
        // Decryption state
        bool revealPending;
        uint256 decryptionRequestId;
        uint64 revealedYes;
        uint64 revealedNo;
    }

    uint256 public platformStake = 0.001 ether;
    uint256 public constant MIN_VOTE_STAKE = 0.005 ether;
    uint256 public constant MIN_DURATION = 5 minutes;
    uint256 public constant MAX_DURATION = 30 days;

    mapping(string => BetInfo) private bets;
    mapping(string => mapping(address => bool)) public hasVoted;
    mapping(string => mapping(address => uint8)) internal userVoteType;  // 0 = NO, 1 = YES
    mapping(string => mapping(address => euint64)) internal userVoteWeight;  // FHE encrypted weight
    mapping(string => mapping(address => bool)) internal hasClaimed;
    string[] private allBetIds;

    uint256 public platformFees;
    address public owner;
    bool public isTesting;

    event BetCreated(
        string indexed betId,
        address indexed creator,
        string title,
        uint256 voteStake,
        uint256 expiryTime
    );
    event VoteCast(string indexed betId, address indexed voter, uint8 voteType);
    event TallyRevealed(string indexed betId, uint64 yesTotal, uint64 noTotal);
    event BetResolved(
        string indexed betId,
        bool yesWon,
        uint256 prizePool
    );
    event PrizeDistributed(string indexed betId, address indexed winner, uint256 amount);
    event RefundIssued(string indexed betId, address indexed user, uint256 amount);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);
    event BetCancelled(string indexed betId);

    error InvalidVoteStake();
    error InvalidVoteType();

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ==== Admin Controls ====

    function setReplicaTesting(bool enabled) external onlyOwner {
        isTesting = enabled;
    }

    function setReplicaPlatformStake(uint256 newStake) external onlyOwner {
        require(newStake > 0, "Stake must be positive");
        platformStake = newStake;
    }

    function withdrawReplicaPlatformFees(address to) external onlyOwner {
        require(platformFees > 0, "No fees");
        uint256 amount = platformFees;
        platformFees = 0;
        (bool sent, ) = payable(to).call{value: amount}("");
        require(sent, "Withdraw failed");
        emit PlatformFeesWithdrawn(to, amount);
    }

    // ==== Public Actions ====

    function createReplicaBet(
        string memory betId,
        string memory title,
        string memory description,
        uint256 voteStake,
        uint256 duration
    ) external payable {
        require(bets[betId].creator == address(0), "Bet exists");
        require(voteStake >= MIN_VOTE_STAKE, "Stake too low");
        require(duration >= MIN_DURATION && duration <= MAX_DURATION, "Duration out of range");
        require(msg.value == platformStake, "Platform stake mismatch");

        uint256 expiryTime = block.timestamp + duration;

        bets[betId] = BetInfo({
            title: title,
            description: description,
            creator: msg.sender,
            platformStake: msg.value,
            voteStake: voteStake,
            expiryTime: expiryTime,
            isResolved: false,
            prizePool: 0,
            yesWon: false,
            cancelled: false,
            yesVoters: 0,
            noVoters: 0,
            yesWeightSum: FHE.asEuint64(0),
            noWeightSum: FHE.asEuint64(0),
            revealPending: false,
            decryptionRequestId: 0,
            revealedYes: 0,
            revealedNo: 0
        });

        allBetIds.push(betId);
        platformFees += msg.value;

        emit BetCreated(betId, msg.sender, title, voteStake, expiryTime);
    }

    function castReplicaVote(
        string memory betId,
        uint8 voteType,
        externalEuint64 encryptedWeight,
        bytes calldata inputProof
    ) external payable {
        BetInfo storage bet = bets[betId];
        require(bet.creator != address(0), "Bet missing");
        require(!bet.cancelled, "Cancelled");
        require(!bet.isResolved, "Settled");
        require(block.timestamp < bet.expiryTime, "Expired");
        require(msg.value == bet.voteStake, "Stake mismatch");
        require(!hasVoted[betId][msg.sender], "Already voted");
        if (voteType > 1) revert InvalidVoteType();

        // Convert FHE encrypted weight (1-100) from user input
        euint64 weight = FHE.fromExternal(encryptedWeight, inputProof);

        // Store encrypted weight for this user
        userVoteWeight[betId][msg.sender] = weight;

        // Aggregate weights using FHE addition
        if (voteType == 1) {
            // YES vote
            if (bet.yesVoters == 0) {
                bet.yesWeightSum = weight;
            } else {
                bet.yesWeightSum = FHE.add(bet.yesWeightSum, weight);
            }
            FHE.allowThis(bet.yesWeightSum);
            bet.yesVoters += 1;
        } else {
            // NO vote
            if (bet.noVoters == 0) {
                bet.noWeightSum = weight;
            } else {
                bet.noWeightSum = FHE.add(bet.noWeightSum, weight);
            }
            FHE.allowThis(bet.noWeightSum);
            bet.noVoters += 1;
        }

        // Allow this contract and the user to access the encrypted value
        FHE.allowThis(weight);
        FHE.allow(weight, msg.sender);

        hasVoted[betId][msg.sender] = true;
        userVoteType[betId][msg.sender] = voteType;
        bet.prizePool += msg.value;

        emit VoteCast(betId, msg.sender, voteType);
    }

    /**
     * @notice Request decryption of aggregated vote weights (manual trigger for now)
     * @dev In production, this would use Gateway async decryption
     * @dev For testing, creator can manually input revealed values after off-chain decryption
     */
    function requestReplicaTallyReveal(string memory betId) external {
        BetInfo storage bet = bets[betId];
        require(bet.creator == msg.sender || isTesting, "Only creator or testing");
        require(bet.creator != address(0), "Bet missing");
        require(block.timestamp >= bet.expiryTime, "Not expired");
        require(!bet.isResolved, "Already settled");
        require(!bet.revealPending, "Reveal pending");
        require(!bet.cancelled, "Cancelled");

        bet.revealPending = true;
        bet.decryptionRequestId = block.timestamp; // Use timestamp as request ID for now
    }

    /**
     * @notice Settle bet after expiry
     * @dev Simplified version - uses basic comparison of voter counts
     * @dev In production, this would use revealed weights from async decryption
     */
    function settleReplicaBet(string memory betId) external {
        BetInfo storage bet = bets[betId];
        require(bet.creator != address(0), "Bet missing");
        require(block.timestamp >= bet.expiryTime, "Not expired");
        require(!bet.isResolved, "Already settled");
        require(!bet.cancelled, "Cancelled");

        // For now, use a simple heuristic: side with more voters wins
        // In production, this would use revealed decrypted weights
        bet.yesWon = bet.yesVoters > bet.noVoters;
        bet.isResolved = true;
        bet.revealPending = false;

        // Set placeholder revealed values (in production these would come from decryption)
        bet.revealedYes = uint64(bet.yesVoters * 50); // Placeholder
        bet.revealedNo = uint64(bet.noVoters * 50);   // Placeholder

        emit TallyRevealed(betId, bet.revealedYes, bet.revealedNo);
        emit BetResolved(betId, bet.yesWon, bet.prizePool);
    }

    function cancelReplicaBet(string memory betId) external {
        BetInfo storage bet = bets[betId];
        require(bet.creator == msg.sender, "Not creator");
        require(!bet.cancelled, "Cancelled");
        require(!bet.isResolved, "Settled");
        require(bet.yesVoters + bet.noVoters == 0, "Already started");

        bet.cancelled = true;
        emit BetCancelled(betId);
    }

    function claimReplicaPrize(string memory betId) external {
        BetInfo storage bet = bets[betId];
        require(bet.isResolved, "Not resolved");
        require(!bet.cancelled, "Cancelled");
        require(hasVoted[betId][msg.sender], "Did not vote");
        require(!hasClaimed[betId][msg.sender], "Claimed");

        bool isWinner = (bet.yesWon && userVoteType[betId][msg.sender] == 1) ||
            (!bet.yesWon && userVoteType[betId][msg.sender] == 0);
        require(isWinner, "Not winner");

        hasClaimed[betId][msg.sender] = true;

        // Equal distribution among winners (simplified for now)
        // In production, this would be weighted by decrypted individual weights
        uint256 winnerCount = bet.yesWon ? bet.yesVoters : bet.noVoters;
        require(winnerCount > 0, "No winners");
        uint256 payout = bet.prizePool / winnerCount;

        (bool sent, ) = payable(msg.sender).call{value: payout}("");
        require(sent, "Payout failed");

        emit PrizeDistributed(betId, msg.sender, payout);
    }

    function claimReplicaRefund(string memory betId) external {
        BetInfo storage bet = bets[betId];
        require(bet.cancelled, "Not cancelled");
        require(hasVoted[betId][msg.sender], "Did not vote");
        require(!hasClaimed[betId][msg.sender], "Claimed");

        hasClaimed[betId][msg.sender] = true;
        (bool sent, ) = payable(msg.sender).call{value: bet.voteStake}("");
        require(sent, "Refund failed");

        emit RefundIssued(betId, msg.sender, bet.voteStake);
    }

    // ==== View Helpers ====

    function getReplicaBet(string memory betId)
        external
        view
        returns (
            string memory title,
            string memory description,
            address creator,
            uint256 platformStakeValue,
            uint256 voteStake,
            uint256 expiryTime,
            bool isResolved,
            uint64 revealedYes,
            uint64 revealedNo,
            uint256 prizePool,
            bool yesWon,
            bool revealPending
        )
    {
        BetInfo storage bet = bets[betId];
        return (
            bet.title,
            bet.description,
            bet.creator,
            bet.platformStake,
            bet.voteStake,
            bet.expiryTime,
            bet.isResolved,
            bet.revealedYes,
            bet.revealedNo,
            bet.prizePool,
            bet.yesWon,
            bet.revealPending
        );
    }

    function getReplicaRevealStatus(string memory betId)
        external
        view
        returns (
            bool isResolved,
            bool pending,
            uint64 revealedYes,
            uint64 revealedNo,
            uint256 decryptionRequestId
        )
    {
        BetInfo storage bet = bets[betId];
        return (
            bet.isResolved,
            bet.revealPending,
            bet.revealedYes,
            bet.revealedNo,
            bet.decryptionRequestId
        );
    }

    function getReplicaDecryptionRequestId(string memory betId) external view returns (uint256) {
        return bets[betId].decryptionRequestId;
    }

    function getReplicaBetIds() external view returns (string[] memory) {
        return allBetIds;
    }

    function hasReplicaUserVoted(string memory betId, address user) external view returns (bool) {
        return hasVoted[betId][user];
    }

    function hasReplicaUserClaimed(string memory betId, address user) external view returns (bool) {
        return hasClaimed[betId][user];
    }

    function getReplicaUserVoteType(string memory betId, address user)
        external
        view
        returns (
            bool exists,
            uint8 voteType,
            bool claimed
        )
    {
        return (
            hasVoted[betId][user],
            userVoteType[betId][user],
            hasClaimed[betId][user]
        );
    }
}
