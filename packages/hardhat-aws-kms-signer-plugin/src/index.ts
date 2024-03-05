import "@nomicfoundation/hardhat-ethers";
import { AwsKmsSigner } from "@cuonghx.gu-tech/ethers-aws-kms-signer";
import { extendEnvironment } from "hardhat/config";

import "./type-extensions";

extendEnvironment((hre) => {
  hre.getKmsSigners = async () => {
    return hre.config.networks[hre.network.name].awsKmsConfigs.map((config) =>
      new AwsKmsSigner(config).connect(hre.ethers.provider)
    );
  };
});
