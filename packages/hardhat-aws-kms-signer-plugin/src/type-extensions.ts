import { EthersAwsKmsSignerConfig } from "@cuonghx.gu-tech/ethers-aws-kms-signer";
import { ethers } from "ethers";
import "hardhat/types/config";

declare module "hardhat/types/config" {
  export interface HttpNetworkUserConfig {
    awsKmsConfigs: EthersAwsKmsSignerConfig[];
  }

  export interface HardhatNetworkUserConfig {
    awsKmsConfigs: EthersAwsKmsSignerConfig[];
  }

  export interface HttpNetworkConfig {
    awsKmsConfigs: EthersAwsKmsSignerConfig[];
  }

  export interface HardhatNetworkConfig {
    awsKmsConfigs: EthersAwsKmsSignerConfig[];
  }
}

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    getKmsSigners: () => Promise<ethers.Signer[]>;
  }
}
