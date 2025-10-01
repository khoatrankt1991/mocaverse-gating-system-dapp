import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { MockMocaNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("MockMocaNFT", function () {
  
  // Fixture to deploy contract and mint NFTs
  async function deployMocaNFTFixture() {
    const [owner, user1, user2]: SignerWithAddress[] = await ethers.getSigners();
    
    const MockMocaNFT = await ethers.getContractFactory("MockMocaNFT");
    const mocaNFT: MockMocaNFT = await MockMocaNFT.deploy();
    await mocaNFT.waitForDeployment();
    
    return { mocaNFT, owner, user1, user2 };
  }
  
  describe("Deployment", function () {
    it("Should deploy with correct name and symbol", async function () {
      const { mocaNFT } = await loadFixture(deployMocaNFTFixture);
      
      expect(await mocaNFT.name()).to.equal("Mock Moca NFT");
      expect(await mocaNFT.symbol()).to.equal("MOCA");
    });
    
    it("Should set the correct owner", async function () {
      const { mocaNFT, owner } = await loadFixture(deployMocaNFTFixture);
      expect(await mocaNFT.owner()).to.equal(owner.address);
    });
  });
  
  describe("Minting", function () {
    it("Should mint NFT with incremental token IDs", async function () {
      const { mocaNFT, user1 } = await loadFixture(deployMocaNFTFixture);
      
      await mocaNFT.mint(user1.address);
      expect(await mocaNFT.ownerOf(1)).to.equal(user1.address);
      expect(await mocaNFT.totalSupply()).to.equal(1);
      
      await mocaNFT.mint(user1.address);
      expect(await mocaNFT.ownerOf(2)).to.equal(user1.address);
      expect(await mocaNFT.totalSupply()).to.equal(2);
    });
    
    it("Should emit NFTMinted event", async function () {
      const { mocaNFT, user1 } = await loadFixture(deployMocaNFTFixture);
      
      await expect(mocaNFT.mint(user1.address))
        .to.emit(mocaNFT, "NFTMinted")
        .withArgs(1, user1.address);
    });
  });
  
  describe("Staking", function () {
    it("Should stake NFT successfully", async function () {
      const { mocaNFT, user1 } = await loadFixture(deployMocaNFTFixture);
      
      await mocaNFT.mint(user1.address);
      await mocaNFT.connect(user1).stake(1);
      
      const stakeInfo = await mocaNFT.getStakeInfo(1);
      expect(stakeInfo.isStaked).to.be.true;
      expect(stakeInfo.stakedAt).to.be.greaterThan(0);
    });
    
    it("Should emit NFTStaked event", async function () {
      const { mocaNFT, user1 } = await loadFixture(deployMocaNFTFixture);
      
      await mocaNFT.mint(user1.address);
      
      await expect(mocaNFT.connect(user1).stake(1))
        .to.emit(mocaNFT, "NFTStaked")
        .withArgs(1, user1.address, await time.latest() + 1);
    });
    
    it("Should revert if non-owner tries to stake", async function () {
      const { mocaNFT, user1, user2 } = await loadFixture(deployMocaNFTFixture);
      
      await mocaNFT.mint(user1.address);
      
      await expect(mocaNFT.connect(user2).stake(1))
        .to.be.revertedWith("Not the owner");
    });
    
    it("Should revert if already staked", async function () {
      const { mocaNFT, user1 } = await loadFixture(deployMocaNFTFixture);
      
      await mocaNFT.mint(user1.address);
      await mocaNFT.connect(user1).stake(1);
      
      await expect(mocaNFT.connect(user1).stake(1))
        .to.be.revertedWith("Already staked");
    });
    
    it("Should prevent transfer of staked NFT", async function () {
      const { mocaNFT, user1, user2 } = await loadFixture(deployMocaNFTFixture);
      
      await mocaNFT.mint(user1.address);
      await mocaNFT.connect(user1).stake(1);
      
      await expect(
        mocaNFT.connect(user1).transferFrom(user1.address, user2.address, 1)
      ).to.be.revertedWith("Cannot transfer staked NFT");
    });
  });
  
  describe("Unstaking", function () {
    it("Should unstake NFT successfully", async function () {
      const { mocaNFT, user1 } = await loadFixture(deployMocaNFTFixture);
      
      await mocaNFT.mint(user1.address);
      await mocaNFT.connect(user1).stake(1);
      await mocaNFT.connect(user1).unstake(1);
      
      const stakeInfo = await mocaNFT.getStakeInfo(1);
      expect(stakeInfo.isStaked).to.be.false;
    });
    
    it("Should emit NFTUnstaked event", async function () {
      const { mocaNFT, user1 } = await loadFixture(deployMocaNFTFixture);
      
      await mocaNFT.mint(user1.address);
      await mocaNFT.connect(user1).stake(1);
      
      await expect(mocaNFT.connect(user1).unstake(1))
        .to.emit(mocaNFT, "NFTUnstaked")
        .withArgs(1, user1.address, await time.latest() + 1);
    });
    
    it("Should allow transfer after unstaking", async function () {
      const { mocaNFT, user1, user2 } = await loadFixture(deployMocaNFTFixture);
      
      await mocaNFT.mint(user1.address);
      await mocaNFT.connect(user1).stake(1);
      await mocaNFT.connect(user1).unstake(1);
      
      await expect(
        mocaNFT.connect(user1).transferFrom(user1.address, user2.address, 1)
      ).to.not.be.reverted;
      
      expect(await mocaNFT.ownerOf(1)).to.equal(user2.address);
    });
    
    it("Should revert if not staked", async function () {
      const { mocaNFT, user1 } = await loadFixture(deployMocaNFTFixture);
      
      await mocaNFT.mint(user1.address);
      
      await expect(mocaNFT.connect(user1).unstake(1))
        .to.be.revertedWith("Not staked");
    });
  });
  
  describe("Eligibility Check", function () {
    it("Should return false for non-staked NFT", async function () {
      const { mocaNFT, user1 } = await loadFixture(deployMocaNFTFixture);
      
      await mocaNFT.mint(user1.address);
      expect(await mocaNFT.isStakedLongEnough(1)).to.be.false;
    });
    
    it("Should return false if staked less than 7 days", async function () {
      const { mocaNFT, user1 } = await loadFixture(deployMocaNFTFixture);
      
      await mocaNFT.mint(user1.address);
      await mocaNFT.connect(user1).stake(1);
      
      // Advance time by 6 days
      await time.increase(6 * 24 * 60 * 60);
      
      expect(await mocaNFT.isStakedLongEnough(1)).to.be.false;
    });
    
    it("Should return true if staked exactly 7 days", async function () {
      const { mocaNFT, user1 } = await loadFixture(deployMocaNFTFixture);
      
      await mocaNFT.mint(user1.address);
      await mocaNFT.connect(user1).stake(1);
      
      // Advance time by exactly 7 days
      await time.increase(7 * 24 * 60 * 60);
      
      expect(await mocaNFT.isStakedLongEnough(1)).to.be.true;
    });
    
    it("Should return true if staked more than 7 days", async function () {
      const { mocaNFT, user1 } = await loadFixture(deployMocaNFTFixture);
      
      await mocaNFT.mint(user1.address);
      await mocaNFT.connect(user1).stake(1);
      
      // Advance time by 14 days
      await time.increase(14 * 24 * 60 * 60);
      
      expect(await mocaNFT.isStakedLongEnough(1)).to.be.true;
    });
  });
  
  describe("hasEligibleNFT", function () {
    it("Should return false if user has no NFTs", async function () {
      const { mocaNFT, user1 } = await loadFixture(deployMocaNFTFixture);
      
      expect(await mocaNFT.hasEligibleNFT(user1.address)).to.be.false;
    });
    
    it("Should return false if user has NFT but not staked", async function () {
      const { mocaNFT, user1 } = await loadFixture(deployMocaNFTFixture);
      
      await mocaNFT.mint(user1.address);
      expect(await mocaNFT.hasEligibleNFT(user1.address)).to.be.false;
    });
    
    it("Should return false if staked less than 7 days", async function () {
      const { mocaNFT, user1 } = await loadFixture(deployMocaNFTFixture);
      
      await mocaNFT.mint(user1.address);
      await mocaNFT.connect(user1).stake(1);
      
      await time.increase(3 * 24 * 60 * 60); // 3 days
      
      expect(await mocaNFT.hasEligibleNFT(user1.address)).to.be.false;
    });
    
    it("Should return true if user has at least one eligible NFT", async function () {
      const { mocaNFT, user1 } = await loadFixture(deployMocaNFTFixture);
      
      // Mint and stake multiple NFTs
      await mocaNFT.mint(user1.address); // token 1
      await mocaNFT.mint(user1.address); // token 2
      await mocaNFT.mint(user1.address); // token 3
      
      await mocaNFT.connect(user1).stake(2); // Only stake token 2
      
      // Advance time by 7 days
      await time.increase(7 * 24 * 60 * 60);
      
      expect(await mocaNFT.hasEligibleNFT(user1.address)).to.be.true;
    });
    
    it("Should work correctly with multiple users", async function () {
      const { mocaNFT, user1, user2 } = await loadFixture(deployMocaNFTFixture);
      
      // User1 has eligible NFT
      await mocaNFT.mint(user1.address);
      await mocaNFT.connect(user1).stake(1);
      await time.increase(7 * 24 * 60 * 60);
      
      // User2 has NFT but not staked
      await mocaNFT.mint(user2.address);
      
      expect(await mocaNFT.hasEligibleNFT(user1.address)).to.be.true;
      expect(await mocaNFT.hasEligibleNFT(user2.address)).to.be.false;
    });
  });
  
  describe("Edge Cases", function () {
    it("Should handle multiple stake/unstake cycles", async function () {
      const { mocaNFT, user1 } = await loadFixture(deployMocaNFTFixture);
      
      await mocaNFT.mint(user1.address);
      
      // First stake
      await mocaNFT.connect(user1).stake(1);
      await time.increase(3 * 24 * 60 * 60);
      await mocaNFT.connect(user1).unstake(1);
      
      // Second stake
      await mocaNFT.connect(user1).stake(1);
      await time.increase(7 * 24 * 60 * 60);
      
      // Should be eligible based on second stake
      expect(await mocaNFT.isStakedLongEnough(1)).to.be.true;
    });
    
    it("Should return correct stake duration", async function () {
      const { mocaNFT, user1 } = await loadFixture(deployMocaNFTFixture);
      
      await mocaNFT.mint(user1.address);
      await mocaNFT.connect(user1).stake(1);
      
      const daysToAdvance = 10;
      await time.increase(daysToAdvance * 24 * 60 * 60);
      
      const stakeInfo = await mocaNFT.getStakeInfo(1);
      expect(stakeInfo.duration).to.be.closeTo(
        BigInt(daysToAdvance * 24 * 60 * 60),
        BigInt(2) // Allow 2 seconds tolerance
      );
    });
  });
});

