import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { MockMocaNFT, MocaStaking } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("MocaStaking", function () {
  let nft: MockMocaNFT;
  let staking: MocaStaking;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy NFT contract
    const MockMocaNFT = await ethers.getContractFactory("MockMocaNFT");
    nft = await MockMocaNFT.deploy() as unknown as MockMocaNFT;
    await nft.waitForDeployment();

    // Deploy Staking contract
    const MocaStaking = await ethers.getContractFactory("MocaStaking");
    staking = await MocaStaking.deploy(await nft.getAddress()) as unknown as MocaStaking;
    await staking.waitForDeployment();

    // Set short duration for testing (10 seconds)
    await staking.setMinStakeDuration(10);
  });

  describe("Deployment", function () {
    it("Should set the correct NFT contract address", async function () {
      expect(await staking.mocaNFT()).to.equal(await nft.getAddress());
    });

    it("Should set the correct owner", async function () {
      expect(await staking.owner()).to.equal(owner.address);
    });

    it("Should set initial MIN_STAKE_DURATION to 604800 seconds", async function () {
      const MocaStaking = await ethers.getContractFactory("MocaStaking");
      const newStaking = await MocaStaking.deploy(await nft.getAddress());
      await newStaking.waitForDeployment();
      
      expect(await newStaking.MIN_STAKE_DURATION()).to.equal(604800);
    });
  });

  describe("setMinStakeDuration", function () {
    it("Should allow owner to set minimum stake duration", async function () {
      await staking.setMinStakeDuration(30);
      expect(await staking.MIN_STAKE_DURATION()).to.equal(30);
    });

    it("Should revert when non-owner tries to set duration", async function () {
      await expect(
        staking.connect(user1).setMinStakeDuration(30)
      ).to.be.revertedWithCustomError(staking, "OwnableUnauthorizedAccount");
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      // Clean state - deploy fresh contracts for each test
      const MockMocaNFT = await ethers.getContractFactory("MockMocaNFT");
      nft = await MockMocaNFT.deploy() as unknown as MockMocaNFT;
      await nft.waitForDeployment();

      const MocaStaking = await ethers.getContractFactory("MocaStaking");
      staking = await MocaStaking.deploy(await nft.getAddress()) as unknown as MocaStaking;
      await staking.waitForDeployment();

      await staking.setMinStakeDuration(10);
      
      // Mint NFT to user1 (tokenId starts from 0)
      await nft.mint(user1.address, "https://example.com/token1.json");
    });

    it("Should allow user to stake NFT", async function () {
      const tokenId = 0;
      
      // Approve staking contract
      await nft.connect(user1).approve(await staking.getAddress(), tokenId);
      
      // Stake NFT
      await expect(staking.connect(user1).stake(tokenId))
        .to.emit(staking, "NFTStaked")
        .withArgs(await nft.getAddress(), tokenId, user1.address, await time.latest());

      // Check NFT ownership transferred
      expect(await nft.ownerOf(tokenId)).to.equal(await staking.getAddress());
      
      // Check stake recorded
      const stakes = await staking.getUserStakes(user1.address);
      expect(stakes.length).to.equal(1);
      expect(stakes[0].tokenId).to.equal(tokenId);
      expect(stakes[0].claimed).to.equal(false);
    });

    it("Should revert when trying to stake already staked NFT", async function () {
      const tokenId = 0;
      
      // First stake
      await nft.connect(user1).approve(await staking.getAddress(), tokenId);
      await staking.connect(user1).stake(tokenId);
      
      // Try to stake again (should revert because already staked)
      await expect(
        staking.connect(user1).stake(tokenId)
      ).to.be.revertedWith("Already staked");
    });

    it("Should allow user to stake multiple NFTs", async function () {
      // Mint second NFT
      await nft.mint(user1.address, "https://example.com/token2.json");
      
      const tokenId1 = 0;
      const tokenId2 = 1;
      
      // Approve both NFTs
      await nft.connect(user1).approve(await staking.getAddress(), tokenId1);
      await nft.connect(user1).approve(await staking.getAddress(), tokenId2);
      
      // Stake both NFTs
      await staking.connect(user1).stake(tokenId1);
      await staking.connect(user1).stake(tokenId2);
      
      // Check both stakes recorded
      const stakes = await staking.getUserStakes(user1.address);
      expect(stakes.length).to.equal(2);
      expect(stakes[0].tokenId).to.equal(tokenId1);
      expect(stakes[1].tokenId).to.equal(tokenId2);
    });

    it("Should revert when user doesn't own the NFT", async function () {
      const tokenId = 0;
      
      await expect(
        staking.connect(user2).stake(tokenId)
      ).to.be.revertedWithCustomError(nft, "ERC721InsufficientApproval");
    });
  });

  describe("Unstaking", function () {
    beforeEach(async function () {
      // Clean state - deploy fresh contracts for each test
      const MockMocaNFT = await ethers.getContractFactory("MockMocaNFT");
      nft = await MockMocaNFT.deploy() as unknown as MockMocaNFT;
      await nft.waitForDeployment();

      const MocaStaking = await ethers.getContractFactory("MocaStaking");
      staking = await MocaStaking.deploy(await nft.getAddress()) as unknown as MocaStaking;
      await staking.waitForDeployment();

      await staking.setMinStakeDuration(10);
      
      // Mint and stake NFT
      await nft.mint(user1.address, "https://example.com/token1.json");
      await nft.connect(user1).approve(await staking.getAddress(), 0);
      await staking.connect(user1).stake(0);
    });

    it("Should allow user to unstake NFT by index", async function () {
      const index = 0;
      
      await expect(staking.connect(user1).unstake(index))
        .to.emit(staking, "NFTUnstaked");

      // Check NFT ownership returned
      expect(await nft.ownerOf(0)).to.equal(user1.address);
      
      // Check stake marked as claimed
      const stakes = await staking.getUserStakes(user1.address);
      expect(stakes[0].claimed).to.equal(true);
    });

    it("Should revert when trying to unstake with invalid index", async function () {
      await expect(
        staking.connect(user1).unstake(1)
      ).to.be.revertedWith("Invalid index");
    });

    it("Should revert when trying to unstake already claimed NFT", async function () {
      // First unstake
      await staking.connect(user1).unstake(0);
      
      // Try to unstake again
      await expect(
        staking.connect(user1).unstake(0)
      ).to.be.revertedWith("Already claimed");
    });

    it("Should revert when non-owner tries to unstake", async function () {
      await expect(
        staking.connect(user2).unstake(0)
      ).to.be.revertedWith("Invalid index");
    });
  });

  describe("Eligibility Check", function () {
    beforeEach(async function () {
      // Clean state - deploy fresh contracts for each test
      const MockMocaNFT = await ethers.getContractFactory("MockMocaNFT");
      nft = await MockMocaNFT.deploy() as unknown as MockMocaNFT;
      await nft.waitForDeployment();

      const MocaStaking = await ethers.getContractFactory("MocaStaking");
      staking = await MocaStaking.deploy(await nft.getAddress()) as unknown as MocaStaking;
      await staking.waitForDeployment();

      await staking.setMinStakeDuration(10);
      
      // Mint and stake NFT
      await nft.mint(user1.address, "https://example.com/token1.json");
      await nft.connect(user1).approve(await staking.getAddress(), 0);
      await staking.connect(user1).stake(0);
    });

    it("Should return false for newly staked NFT", async function () {
      expect(await staking.hasEligibleNFT(user1.address)).to.equal(false);
    });

    it("Should return true after minimum duration", async function () {
      // Fast forward time
      await time.increase(20); // 11 seconds > 10 seconds minimum
      
      expect(await staking.hasEligibleNFT(user1.address)).to.equal(true);
    });

    it("Should return false for user with no stakes", async function () {
      expect(await staking.hasEligibleNFT(user2.address)).to.equal(false);
    });

    it("Should return true if user has at least one eligible NFT", async function () {
      // Fast forward time to make first NFT eligible
      await time.increase(20);
      
      // Should return true because first NFT is now eligible
      expect(await staking.hasEligibleNFT(user1.address)).to.equal(true);
    });
  });

  describe("isStakedLongEnough", function () {
    beforeEach(async function () {
      // Clean state - deploy fresh contracts for each test
      const MockMocaNFT = await ethers.getContractFactory("MockMocaNFT");
      nft = await MockMocaNFT.deploy() as unknown as MockMocaNFT;
      await nft.waitForDeployment();

      const MocaStaking = await ethers.getContractFactory("MocaStaking");
      staking = await MocaStaking.deploy(await nft.getAddress()) as unknown as MocaStaking;
      await staking.waitForDeployment();

      await staking.setMinStakeDuration(10);
      
      // Mint and stake NFT
      await nft.mint(user1.address, "https://example.com/token1.json");
      await nft.connect(user1).approve(await staking.getAddress(), 0);
      await staking.connect(user1).stake(0);
    });

    it("Should return false for newly staked NFT", async function () {
      expect(await staking.isStakedLongEnough(user1.address, 0)).to.equal(false);
    });

    it("Should return true after minimum duration", async function () {
      await time.increase(20);
      expect(await staking.isStakedLongEnough(user1.address, 0)).to.equal(true);
    });

    it("Should return false for non-staked token", async function () {
      // Test with user who has no stakes
      await expect(
        staking.isStakedLongEnough(user2.address, 0)
      ).to.be.revertedWith("Invalid index");
    });
  });

  describe("getUserStakes", function () {
    it("Should return empty array for user with no stakes", async function () {
      const stakes = await staking.getUserStakes(user1.address);
      expect(stakes.length).to.equal(0);
    });

    it("Should return correct stakes for user", async function () {
      // Mint and stake NFT
      await nft.mint(user1.address, "https://example.com/token1.json");
      await nft.connect(user1).approve(await staking.getAddress(), 0);
      await staking.connect(user1).stake(0);
      
      const stakes = await staking.getUserStakes(user1.address);
      expect(stakes.length).to.equal(1);
      expect(stakes[0].tokenId).to.equal(0);
      expect(stakes[0].claimed).to.equal(false);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple users staking different NFTs", async function () {
      // Mint NFTs to different users
      await nft.mint(user1.address, "https://example.com/token1.json");
      await nft.mint(user2.address, "https://example.com/token2.json");
      
      // Both users stake
      await nft.connect(user1).approve(await staking.getAddress(), 0);
      await nft.connect(user2).approve(await staking.getAddress(), 1);
      await staking.connect(user1).stake(0);
      await staking.connect(user2).stake(1);
      
      // Check both users have stakes
      const user1Stakes = await staking.getUserStakes(user1.address);
      const user2Stakes = await staking.getUserStakes(user2.address);
      
      expect(user1Stakes.length).to.equal(1);
      expect(user2Stakes.length).to.equal(1);
      expect(user1Stakes[0].tokenId).to.equal(0);
      expect(user2Stakes[0].tokenId).to.equal(1);
    });

    it("Should handle unstaking and re-staking", async function () {
      // Mint and stake
      await nft.mint(user1.address, "https://example.com/token1.json");
      await nft.connect(user1).approve(await staking.getAddress(), 0);
      await staking.connect(user1).stake(0);
      
      // Unstake
      await staking.connect(user1).unstake(0);
      
      // Try to re-stake same tokenId (should fail because record still exists)
      await nft.connect(user1).approve(await staking.getAddress(), 0);
      await expect(
        staking.connect(user1).stake(0)
      ).to.be.revertedWith("Already staked");
      
      const stakes = await staking.getUserStakes(user1.address);
      expect(stakes.length).to.equal(1); // Only old (claimed) stake
      expect(stakes[0].claimed).to.equal(true);
    });
  });
});
