import "@nomicfoundation/hardhat-ethers";
import { GcpKmsSigner } from "@cuonghx.gu-tech/ethers-gcp-kms-signer";
import { extendEnvironment } from "hardhat/config";

import "./type-extensions";

extendEnvironment((hre) => {
  hre.getKmsSigners = async () => {
    return hre.config.networks[hre.network.name].gcpKmsConfigs.map((config) =>
      new GcpKmsSigner(config).connect(hre.ethers.provider)
    );
  };
});
