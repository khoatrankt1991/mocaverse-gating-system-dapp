import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

// Environment variables
const ALCHEMY_KEY = process.env.ALCHEMY_KEY || ''
const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY || ''
// Scan API keys to verify contracts on other networks
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ''


const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
    hardhat: {
      chainId: 31337
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY || ""
  }
};

export default config;

