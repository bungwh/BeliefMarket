// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title BeliefMarket
 * @notice Privacy-preserving prediction market with FHE-encrypted confidence weights
 * @dev Based on AuroraPickem's proven implementation pattern
 *      - Markets have YES/NO outcomes instead of Team A/B
 *      - Users vote with encrypted confidence weights (1-100)
 *      - Permissionless market creation
 *      - Winners share prize pool equally (simplified distribution)
 */
contract BeliefMarket is ZamaEthereumConfig {
    struct Market {
        bool exists;
        address creator;
        string marketId;
        string title;
        string description;
        uint256 voteStake;
        uint256 expiryTime;
        uint256 prizePool;
        uint256 totalVoters;
        uint256[2] voteCounts; // [NO, YES]
        bool cancelled;
        bool isResolved;
        uint8 outcome; // 0 = NO won, 1 = YES won, 2 = tie/undecided
        address[] voters;
        euint64 yesWeightSum;
        euint64 noWeightSum;
        bytes32[2] decryptHandles;
        bool revealPending;
        uint64 revealedYes;
        uint64 revealedNo;
    }

    struct VoteInfo {
        bool exists;
        uint8 voteType; // 0 = NO, 1 = YES
        bool claimed;
        euint64 weightCipher;
    }

    uint256 public constant MIN_VOTE_STAKE = 0.005 ether;
    uint256 public constant MIN_DURATION = 5 minutes;
    uint256 public constant MAX_DURATION = 30 days;

    mapping(string => Market) private markets;
    mapping(string => mapping(address => VoteInfo)) private votes;
    string[] private allMarketIds;

    event BetCreated(
        string indexed marketId,
        address indexed creator,
        string title,
        uint256 voteStake,
        uint256 expiryTime
    );
    event VoteCast(string indexed marketId, address indexed voter, uint8 voteType);
    event BetResolved(string indexed marketId, uint8 outcome, uint256 prizePool);
    event TallyDecryptable(string indexed marketId, bytes32 yesHandle, bytes32 noHandle);
    event TallySubmitted(string indexed marketId, uint64 yesWeight, uint64 noWeight);
    event PrizeDistributed(string indexed marketId, address indexed winner, uint256 amount);
    event RefundIssued(string indexed marketId, address indexed voter, uint256 amount);
    event BetCancelled(string indexed marketId);

    error MarketNotFound();
    error MarketExpired();
    error MarketNotExpired();
    error MarketAlreadyResolved();
    error MarketCancelled();
    error InsufficientStake();
    error AlreadyVoted();
    error InvalidVoteType();
    error NotVoter();
    error AlreadyClaimed();
    error NotWinner();
    error InvalidDuration();
    error MarketExists();
    error RevealAlreadyPending();
    error RevealNotReady();

    function createReplicaBet(
        string memory marketId,
        string memory title,
        string memory description,
        uint256 voteStake,
        uint256 duration
    ) external {
        if (markets[marketId].exists) revert MarketExists();
        if (voteStake < MIN_VOTE_STAKE) revert InsufficientStake();
        if (duration < MIN_DURATION || duration > MAX_DURATION) revert InvalidDuration();

        uint256 expiryTime = block.timestamp + duration;

        markets[marketId] = Market({
            exists: true,
            creator: msg.sender,
            marketId: marketId,
            title: title,
            description: description,
            voteStake: voteStake,
            expiryTime: expiryTime,
            prizePool: 0,
            totalVoters: 0,
            voteCounts: [uint256(0), uint256(0)],
            cancelled: false,
            isResolved: false,
            outcome: 2,
            voters: new address[](0),
            yesWeightSum: FHE.asEuint64(0),
            noWeightSum: FHE.asEuint64(0),
            decryptHandles: [bytes32(0), bytes32(0)],
            revealPending: false,
            revealedYes: 0,
            revealedNo: 0
        });

        FHE.allowThis(markets[marketId].yesWeightSum);
        FHE.allowThis(markets[marketId].noWeightSum);

        allMarketIds.push(marketId);
        emit BetCreated(marketId, msg.sender, title, voteStake, expiryTime);
    }

    function castReplicaVote(
        string memory marketId,
        uint8 voteType,
        externalEuint64 encryptedWeight,
        bytes calldata inputProof
    ) external payable {
        Market storage market = markets[marketId];
        if (!market.exists) revert MarketNotFound();
        if (market.cancelled) revert MarketCancelled();
        if (market.isResolved) revert MarketAlreadyResolved();
        if (block.timestamp >= market.expiryTime) revert MarketExpired();
        if (msg.value != market.voteStake) revert InsufficientStake();
        if (votes[marketId][msg.sender].exists) revert AlreadyVoted();
        if (voteType > 1) revert InvalidVoteType();

        euint64 weight = FHE.fromExternal(encryptedWeight, inputProof);

        votes[marketId][msg.sender] = VoteInfo({
            exists: true,
            voteType: voteType,
            claimed: false,
            weightCipher: weight
        });

        FHE.allow(weight, msg.sender);
        FHE.allowThis(weight);

        if (voteType == 1) {
            market.yesWeightSum = FHE.add(market.yesWeightSum, weight);
            FHE.allowThis(market.yesWeightSum);
        } else {
            market.noWeightSum = FHE.add(market.noWeightSum, weight);
            FHE.allowThis(market.noWeightSum);
        }

        market.prizePool += msg.value;
        market.totalVoters += 1;
        market.voteCounts[voteType] += 1;
        market.voters.push(msg.sender);

        emit VoteCast(marketId, msg.sender, voteType);
    }

    function authorizeReplicaReveal(string memory marketId) external {
        Market storage market = markets[marketId];
        if (!market.exists) revert MarketNotFound();
        if (market.cancelled) revert MarketCancelled();
        if (market.isResolved) revert MarketAlreadyResolved();
        if (block.timestamp < market.expiryTime) revert MarketNotExpired();
        if (market.revealPending) revert RevealAlreadyPending();

        market.yesWeightSum = FHE.makePubliclyDecryptable(market.yesWeightSum);
        market.noWeightSum = FHE.makePubliclyDecryptable(market.noWeightSum);

        market.decryptHandles[0] = FHE.toBytes32(market.yesWeightSum);
        market.decryptHandles[1] = FHE.toBytes32(market.noWeightSum);
        market.revealPending = true;

        emit TallyDecryptable(marketId, market.decryptHandles[0], market.decryptHandles[1]);
    }

    function submitReplicaTally(
        string memory marketId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        Market storage market = markets[marketId];
        if (!market.exists) revert MarketNotFound();
        if (!market.revealPending) revert RevealNotReady();

        bytes32 yesHandle = market.decryptHandles[0];
        bytes32 noHandle = market.decryptHandles[1];
        if (yesHandle == bytes32(0) || noHandle == bytes32(0)) revert RevealNotReady();

        bytes32[] memory handles = new bytes32[](2);
        handles[0] = yesHandle;
        handles[1] = noHandle;

        FHE.checkSignatures(handles, cleartexts, decryptionProof);

        (uint64 clearYes, uint64 clearNo) = abi.decode(cleartexts, (uint64, uint64));

        market.revealPending = false;
        market.isResolved = true;
        market.decryptHandles[0] = bytes32(0);
        market.decryptHandles[1] = bytes32(0);
        market.revealedYes = clearYes;
        market.revealedNo = clearNo;

        if (clearYes > clearNo) {
            market.outcome = 1;
        } else if (clearNo > clearYes) {
            market.outcome = 0;
        } else {
            market.outcome = 2;
        }

        emit TallySubmitted(marketId, clearYes, clearNo);
        emit BetResolved(marketId, market.outcome, market.prizePool);
    }

    function cancelReplicaBet(string memory marketId) external {
        Market storage market = markets[marketId];
        if (!market.exists) revert MarketNotFound();
        if (market.cancelled) revert MarketCancelled();
        if (market.isResolved) revert MarketAlreadyResolved();
        if (market.totalVoters > 0) revert AlreadyVoted();

        market.cancelled = true;
        emit BetCancelled(marketId);
    }

    function claimReplicaPrize(string memory marketId) external {
        Market storage market = markets[marketId];
        if (!market.exists) revert MarketNotFound();
        if (market.cancelled) revert MarketCancelled();
        if (!market.isResolved) revert MarketNotExpired();

        VoteInfo storage vote = votes[marketId][msg.sender];
        if (!vote.exists) revert NotVoter();
        if (vote.claimed) revert AlreadyClaimed();

        // Check if user is a winner
        bool isWinner = (market.outcome == vote.voteType);
        if (!isWinner) revert NotWinner();

        vote.claimed = true;

        // Equal distribution among winners
        uint256 winnerCount = market.voteCounts[market.outcome];
        uint256 payout = market.prizePool / winnerCount;

        (bool sent, ) = payable(msg.sender).call{value: payout}("");
        require(sent, "Transfer failed");

        emit PrizeDistributed(marketId, msg.sender, payout);
    }

    function claimReplicaRefund(string memory marketId) external {
        Market storage market = markets[marketId];
        VoteInfo storage vote = votes[marketId][msg.sender];

        if (!vote.exists) revert NotVoter();
        if (vote.claimed) revert AlreadyClaimed();

        bool canRefund = market.cancelled ||
                        (market.isResolved && market.outcome == 2);
        require(canRefund, "Not refundable");

        vote.claimed = true;
        (bool sent, ) = payable(msg.sender).call{value: market.voteStake}("");
        require(sent, "Refund failed");

        emit RefundIssued(marketId, msg.sender, market.voteStake);
    }

    // ==== View Functions ====

    function getReplicaBet(string memory marketId)
        external
        view
        returns (
            string memory title,
            string memory description,
            address creator,
            uint256 platformStake,
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
        Market storage market = markets[marketId];
        if (!market.exists) revert MarketNotFound();

        return (
            market.title,
            market.description,
            market.creator,
            0, // No platform stake
            market.voteStake,
            market.expiryTime,
            market.isResolved,
            market.revealedYes,
            market.revealedNo,
            market.prizePool,
            market.outcome == 1,
            market.revealPending
        );
    }

    function getReplicaBetIds() external view returns (string[] memory) {
        return allMarketIds;
    }

    function hasReplicaUserVoted(string memory marketId, address user)
        external
        view
        returns (bool)
    {
        return votes[marketId][user].exists;
    }

    function hasReplicaUserClaimed(string memory marketId, address user)
        external
        view
        returns (bool)
    {
        return votes[marketId][user].claimed;
    }

    function getReplicaUserVoteType(string memory marketId, address user)
        external
        view
        returns (bool exists, uint8 voteType, bool claimed)
    {
        VoteInfo storage vote = votes[marketId][user];
        return (vote.exists, vote.voteType, vote.claimed);
    }

    function getReplicaRevealStatus(string memory marketId)
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
        Market storage market = markets[marketId];
        return (
            market.isResolved,
            market.revealPending,
            market.revealedYes,
            market.revealedNo,
            0 // No decryption request ID
        );
    }

    function getReplicaDecryptionRequestId(string memory marketId)
        external
        pure
        returns (uint256)
    {
        return 0; // No decryption requests in this simplified version
    }

    function getReplicaDecryptHandles(string memory marketId)
        external
        view
        returns (bytes32 yesHandle, bytes32 noHandle, bool pending)
    {
        Market storage market = markets[marketId];
        if (!market.exists) revert MarketNotFound();
        return (market.decryptHandles[0], market.decryptHandles[1], market.revealPending);
    }

    // Stubs for admin functions (not used in permissionless version)
    function setReplicaTesting(bool) external pure {}
    function setReplicaPlatformStake(uint256) external pure {}
    function withdrawReplicaPlatformFees(address) external pure {}
    function replicaTestingMarkVoted(string memory, address, uint8) external pure {}
    function replicaTestingFundPrizePool(string memory) external payable {}
    function replicaTestingResolve(string memory, uint64, uint64) external pure {}
}
