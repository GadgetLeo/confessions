import { expect } from "chai";
import { ethers } from "hardhat";
import { ConfessionVault } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ConfessionVault", function () {
  let confessionVault: ConfessionVault;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  // Mock encrypted data (in production, use actual FHEVM encryption)
  const mockEncryptedMessage = ethers.hexlify(ethers.randomBytes(32));
  const mockEncryptedOne = ethers.hexlify(ethers.toBeArray(1));

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy contract
    const ConfessionVaultFactory = await ethers.getContractFactory(
      "ConfessionVault"
    );
    confessionVault = await ConfessionVaultFactory.deploy();
    await confessionVault.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await confessionVault.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero confessions", async function () {
      expect(await confessionVault.confessionCount()).to.equal(0);
    });

    it("Should not be paused initially", async function () {
      expect(await confessionVault.paused()).to.equal(false);
    });

    it("Should have default rate limit of 300 seconds", async function () {
      expect(await confessionVault.rateLimitCooldown()).to.equal(300);
    });
  });

  describe("Confession Submission", function () {
    it("Should allow submitting a confession", async function () {
      const tx = await confessionVault
        .connect(user1)
        .submitConfession(mockEncryptedMessage);
      await tx.wait();

      expect(await confessionVault.confessionCount()).to.equal(1);

      // Check confession exists
      const confession = await confessionVault.getConfession(1);
      expect(confession.exists).to.equal(true);
      expect(confession.author).to.equal(user1.address);
    });

    it("Should emit ConfessionSubmitted event", async function () {
      await expect(
        confessionVault.connect(user1).submitConfession(mockEncryptedMessage)
      )
        .to.emit(confessionVault, "ConfessionSubmitted")
        .withArgs(1, user1.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
    });

    it("Should increment confession count correctly", async function () {
      await confessionVault
        .connect(user1)
        .submitConfession(mockEncryptedMessage);
      await ethers.provider.send("evm_increaseTime", [301]); // Wait for cooldown
      await ethers.provider.send("evm_mine", []);

      await confessionVault
        .connect(user1)
        .submitConfession(mockEncryptedMessage);

      expect(await confessionVault.confessionCount()).to.equal(2);
    });

    it("Should reject empty message", async function () {
      await expect(
        confessionVault.connect(user1).submitConfession("0x")
      ).to.be.revertedWith("Message cannot be empty");
    });

    it("Should enforce rate limiting", async function () {
      // Submit first confession
      await confessionVault
        .connect(user1)
        .submitConfession(mockEncryptedMessage);

      // Try to submit second confession immediately
      await expect(
        confessionVault.connect(user1).submitConfession(mockEncryptedMessage)
      ).to.be.revertedWith("Rate limit active - please wait before submitting again");
    });

    it("Should allow submission after cooldown period", async function () {
      // Submit first confession
      await confessionVault
        .connect(user1)
        .submitConfession(mockEncryptedMessage);

      // Fast forward time by 301 seconds
      await ethers.provider.send("evm_increaseTime", [301]);
      await ethers.provider.send("evm_mine", []);

      // Should now succeed
      await expect(
        confessionVault.connect(user1).submitConfession(mockEncryptedMessage)
      ).to.not.be.reverted;
    });

    it("Should prevent submission when paused", async function () {
      await confessionVault.connect(owner).togglePause();

      await expect(
        confessionVault.connect(user1).submitConfession(mockEncryptedMessage)
      ).to.be.revertedWith("Contract is paused");
    });

    it("Should allow different users to submit simultaneously", async function () {
      await confessionVault
        .connect(user1)
        .submitConfession(mockEncryptedMessage);
      await confessionVault
        .connect(user2)
        .submitConfession(mockEncryptedMessage);

      expect(await confessionVault.confessionCount()).to.equal(2);
    });
  });

  describe("Upvoting", function () {
    beforeEach(async function () {
      // Submit a confession first
      await confessionVault
        .connect(user1)
        .submitConfession(mockEncryptedMessage);
    });

    it("Should allow upvoting a confession", async function () {
      await expect(
        confessionVault.connect(user2).upvote(1, mockEncryptedOne)
      ).to.not.be.reverted;

      // Check upvote tracking
      expect(
        await confessionVault.hasUserUpvoted(1, user2.address)
      ).to.equal(true);
    });

    it("Should emit ConfessionUpvoted event", async function () {
      await expect(confessionVault.connect(user2).upvote(1, mockEncryptedOne))
        .to.emit(confessionVault, "ConfessionUpvoted")
        .withArgs(1, user2.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
    });

    it("Should prevent double voting", async function () {
      await confessionVault.connect(user2).upvote(1, mockEncryptedOne);

      await expect(
        confessionVault.connect(user2).upvote(1, mockEncryptedOne)
      ).to.be.revertedWith("Already upvoted this confession");
    });

    it("Should allow multiple users to upvote same confession", async function () {
      await confessionVault.connect(user2).upvote(1, mockEncryptedOne);
      await confessionVault.connect(user3).upvote(1, mockEncryptedOne);

      expect(
        await confessionVault.hasUserUpvoted(1, user2.address)
      ).to.equal(true);
      expect(
        await confessionVault.hasUserUpvoted(1, user3.address)
      ).to.equal(true);
    });

    it("Should reject upvote for non-existent confession", async function () {
      await expect(
        confessionVault.connect(user2).upvote(999, mockEncryptedOne)
      ).to.be.revertedWith("Confession does not exist");
    });

    it("Should prevent upvoting when paused", async function () {
      await confessionVault.connect(owner).togglePause();

      await expect(
        confessionVault.connect(user2).upvote(1, mockEncryptedOne)
      ).to.be.revertedWith("Contract is paused");
    });

    it("Should allow author to upvote their own confession", async function () {
      await expect(
        confessionVault.connect(user1).upvote(1, mockEncryptedOne)
      ).to.not.be.reverted;
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await confessionVault
        .connect(user1)
        .submitConfession(mockEncryptedMessage);
    });

    it("Should return correct confession data", async function () {
      const confession = await confessionVault.getConfession(1);
      expect(confession.exists).to.equal(true);
      expect(confession.author).to.equal(user1.address);
    });

    it("Should revert when getting non-existent confession", async function () {
      await expect(
        confessionVault.getConfession(999)
      ).to.be.revertedWith("Confession does not exist");
    });

    it("Should return confession ciphertext", async function () {
      const [message, votes, timestamp] =
        await confessionVault.getConfessionCiphertext(1);
      expect(message).to.not.be.undefined;
      expect(votes).to.not.be.undefined;
      expect(timestamp).to.not.be.undefined;
    });

    it("Should correctly track upvote status", async function () {
      expect(
        await confessionVault.hasUserUpvoted(1, user2.address)
      ).to.equal(false);

      await confessionVault.connect(user2).upvote(1, mockEncryptedOne);

      expect(
        await confessionVault.hasUserUpvoted(1, user2.address)
      ).to.equal(true);
    });

    it("Should return correct remaining cooldown", async function () {
      const cooldown = await confessionVault.getRemainingCooldown(
        user1.address
      );
      expect(cooldown).to.be.greaterThan(0);
      expect(cooldown).to.be.lessThanOrEqual(300);
    });

    it("Should return zero cooldown after waiting", async function () {
      await ethers.provider.send("evm_increaseTime", [301]);
      await ethers.provider.send("evm_mine", []);

      const cooldown = await confessionVault.getRemainingCooldown(
        user1.address
      );
      expect(cooldown).to.equal(0);
    });
  });

  describe("Admin Functions", function () {
    describe("Rate Limit Updates", function () {
      it("Should allow owner to update rate limit", async function () {
        await confessionVault.connect(owner).updateRateLimit(600);
        expect(await confessionVault.rateLimitCooldown()).to.equal(600);
      });

      it("Should emit RateLimitUpdated event", async function () {
        await expect(confessionVault.connect(owner).updateRateLimit(600))
          .to.emit(confessionVault, "RateLimitUpdated")
          .withArgs(600);
      });

      it("Should reject rate limit update from non-owner", async function () {
        await expect(
          confessionVault.connect(user1).updateRateLimit(600)
        ).to.be.revertedWithCustomError(confessionVault, "OwnableUnauthorizedAccount");
      });

      it("Should reject rate limit longer than 1 hour", async function () {
        await expect(
          confessionVault.connect(owner).updateRateLimit(3601)
        ).to.be.revertedWith("Cooldown too long (max 1 hour)");
      });
    });

    describe("Pause Functionality", function () {
      it("Should allow owner to toggle pause", async function () {
        await confessionVault.connect(owner).togglePause();
        expect(await confessionVault.paused()).to.equal(true);

        await confessionVault.connect(owner).togglePause();
        expect(await confessionVault.paused()).to.equal(false);
      });

      it("Should emit ContractPaused event", async function () {
        await expect(confessionVault.connect(owner).togglePause())
          .to.emit(confessionVault, "ContractPaused")
          .withArgs(true);
      });

      it("Should allow emergency pause", async function () {
        await confessionVault.connect(owner).emergencyPause();
        expect(await confessionVault.paused()).to.equal(true);
      });

      it("Should allow unpause", async function () {
        await confessionVault.connect(owner).togglePause();
        await confessionVault.connect(owner).unpause();
        expect(await confessionVault.paused()).to.equal(false);
      });

      it("Should reject pause from non-owner", async function () {
        await expect(
          confessionVault.connect(user1).togglePause()
        ).to.be.revertedWithCustomError(confessionVault, "OwnableUnauthorizedAccount");
      });
    });

    describe("IPFS CID Updates", function () {
      const mockIPFSCID = ethers.keccak256(ethers.toUtf8Bytes("QmTest"));

      beforeEach(async function () {
        await confessionVault
          .connect(user1)
          .submitConfession(mockEncryptedMessage);
      });

      it("Should allow author to update IPFS CID", async function () {
        await confessionVault.connect(user1).updateIPFSCID(1, mockIPFSCID);
        const confession = await confessionVault.getConfession(1);
        expect(confession.ipfsCID).to.equal(mockIPFSCID);
      });

      it("Should reject IPFS CID update from non-author", async function () {
        await expect(
          confessionVault.connect(user2).updateIPFSCID(1, mockIPFSCID)
        ).to.be.revertedWith("Only author can update IPFS CID");
      });

      it("Should reject IPFS CID update for non-existent confession", async function () {
        await expect(
          confessionVault.connect(user1).updateIPFSCID(999, mockIPFSCID)
        ).to.be.revertedWith("Confession does not exist");
      });
    });
  });

  describe("Edge Cases and Security", function () {
    it("Should handle confession ID overflow safely", async function () {
      // This test is conceptual - in practice, hitting max uint256 is impossible
      // Just verify counter increments correctly
      await confessionVault
        .connect(user1)
        .submitConfession(mockEncryptedMessage);
      expect(await confessionVault.confessionCount()).to.equal(1);
    });

    it("Should maintain separate rate limits per user", async function () {
      await confessionVault
        .connect(user1)
        .submitConfession(mockEncryptedMessage);

      // user2 should still be able to submit
      await expect(
        confessionVault.connect(user2).submitConfession(mockEncryptedMessage)
      ).to.not.be.reverted;
    });

    it("Should preserve state across multiple operations", async function () {
      // Submit confession
      await confessionVault
        .connect(user1)
        .submitConfession(mockEncryptedMessage);

      // Upvote
      await confessionVault.connect(user2).upvote(1, mockEncryptedOne);

      // Pause and unpause
      await confessionVault.connect(owner).togglePause();
      await confessionVault.connect(owner).togglePause();

      // State should still be intact
      const confession = await confessionVault.getConfession(1);
      expect(confession.exists).to.equal(true);
      expect(
        await confessionVault.hasUserUpvoted(1, user2.address)
      ).to.equal(true);
    });
  });
});
