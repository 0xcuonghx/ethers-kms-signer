import { EthersGcpKmsSignerConfig } from "@cuonghx.gu-tech/ethers-gcp-kms-signer";
import { ethers } from "ethers";
import "hardhat/types/config";

declare module "hardhat/types/config" {
  export interface HttpNetworkUserConfig {
    gcpKmsConfigs: EthersGcpKmsSignerConfig[];
  }

  export interface HardhatNetworkUserConfig {
    gcpKmsConfigs: EthersGcpKmsSignerConfig[];
  }

  export interface HttpNetworkConfig {
    gcpKmsConfigs: EthersGcpKmsSignerConfig[];
  }

  export interface HardhatNetworkConfig {
    gcpKmsConfigs: EthersGcpKmsSignerConfig[];
  }
}

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    getKmsSigners: () => Promise<ethers.Signer[]>;
  }
}
