import { expect } from "chai";
import { ethers } from "hardhat";
import { MockMocaNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("MockMocaNFT", function () {
  
  // Fixture to deploy contract
  async function deployMocaNFTFixture() {
    const [owner, user1, user2]: SignerWithAddress[] = await ethers.getSigners();
    
    const MockMocaNFT = await ethers.getContractFactory("MockMocaNFT");
    const mocaNFT: MockMocaNFT = await MockMocaNFT.deploy();
    await mocaNFT.waitForDeployment();
    
    return { mocaNFT, owner, user1, user2 };
  }
  
  describe("Deployment", function () {
    it("Should deploy with correct name and symbol", async function () {
      const { mocaNFT } = await deployMocaNFTFixture();
      
      expect(await mocaNFT.name()).to.equal("Mock Moca NFT");
      expect(await mocaNFT.symbol()).to.equal("MOCA");
    });
    
    it("Should set the correct owner", async function () {
      const { mocaNFT, owner } = await deployMocaNFTFixture();
      expect(await mocaNFT.owner()).to.equal(owner.address);
    });
  });
  
  describe("Minting", function () {
    it("Should mint NFT with incremental token IDs", async function () {
      const { mocaNFT, user1 } = await deployMocaNFTFixture();
      
      await mocaNFT.mint(user1.address, "https://example.com/1");
      expect(await mocaNFT.ownerOf(0)).to.equal(user1.address);
      expect(await mocaNFT.totalSupply()).to.equal(1);
      
      await mocaNFT.mint(user1.address, "https://example.com/2");
      expect(await mocaNFT.ownerOf(1)).to.equal(user1.address);
      expect(await mocaNFT.totalSupply()).to.equal(2);
    });
    
    it("Should emit NFTMinted event", async function () {
      const { mocaNFT, user1 } = await deployMocaNFTFixture();
      
      await expect(mocaNFT.mint(user1.address, "https://example.com/1"))
        .to.emit(mocaNFT, "NFTMinted")
        .withArgs(0, user1.address, "https://example.com/1");
    });

    it("Should only allow owner to mint", async function () {
      const { mocaNFT, user1 } = await deployMocaNFTFixture();
      
      await expect(mocaNFT.connect(user1).mint(user1.address, "https://example.com/1"))
        .to.be.revertedWithCustomError(mocaNFT, "OwnableUnauthorizedAccount")
        .withArgs(user1.address);
    });
  });

  describe("Token URI", function () {
    it("Should return correct token URI", async function () {
      const { mocaNFT, user1 } = await deployMocaNFTFixture();
      
      await mocaNFT.mint(user1.address, "https://example.com/metadata/1");
      expect(await mocaNFT.tokenURI(0)).to.equal("https://example.com/metadata/1");
    });

    it("Should revert for non-existent token", async function () {
      const { mocaNFT } = await deployMocaNFTFixture();
      
      await expect(mocaNFT.tokenURI(999))
        .to.be.revertedWithCustomError(mocaNFT, "ERC721NonexistentToken")
        .withArgs(999);
    });
  });

  describe("Batch Minting", function () {
    it("Should batch mint multiple NFTs", async function () {
      const { mocaNFT, user1 } = await deployMocaNFTFixture();
      
      const uris = [
        "https://example.com/1",
        "https://example.com/2", 
        "https://example.com/3"
      ];
      
      await mocaNFT.batchMint(user1.address, uris);
      
      expect(await mocaNFT.ownerOf(0)).to.equal(user1.address);
      expect(await mocaNFT.ownerOf(1)).to.equal(user1.address);
      expect(await mocaNFT.ownerOf(2)).to.equal(user1.address);
      expect(await mocaNFT.totalSupply()).to.equal(3);
    });
  });

  describe("Total Supply", function () {
    it("Should return correct total supply", async function () {
      const { mocaNFT, user1 } = await deployMocaNFTFixture();
      
      expect(await mocaNFT.totalSupply()).to.equal(0);
      
      await mocaNFT.mint(user1.address, "https://example.com/1");
      expect(await mocaNFT.totalSupply()).to.equal(1);
      
      await mocaNFT.mint(user1.address, "https://example.com/2");
      expect(await mocaNFT.totalSupply()).to.equal(2);
    });
  });
});