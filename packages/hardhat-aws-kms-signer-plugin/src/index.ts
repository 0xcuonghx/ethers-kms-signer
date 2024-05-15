import "@nomicfoundation/hardhat-ethers";
import { AwsKmsSigner } from "../../ethers-aws-kms-signer/src/aws-kms-signer";
import { extendEnvironment } from "hardhat/config";

import "./type-extensions";

extendEnvironment((hre) => {
  // eslint-disable-next-line @typescript-eslint/require-await
  hre.getKmsSigners = async () => {
    if (!hre.config.networks[hre.network.name].awsKmsConfigs) {
      throw new Error(`No awsKmsConfigs found for network ${hre.network.name}`);
    }

    return (hre.config.networks[hre.network.name].awsKmsConfigs ?? []).map(
      (config) => new AwsKmsSigner(config).connect(hre.ethers.provider)
    );
  };
});
