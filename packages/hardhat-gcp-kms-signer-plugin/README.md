# ethers-gcp-kms-signer

Hardhat plugin for @google-cloud/kms integration with ethers@v6 signer

## Feature

- ethers@v6 signer compatible
- hardhat plugin

## Install

```sh
npm install @cuonghx.gu-tech/hardhat-gcp-kms-signer-plugin
```

And add the following statement to your hardhat.config.js:

```js
require("@cuonghx.gu-tech/hardhat-gcp-kms-signer-plugin");
```

Or, if you are using TypeScript, add this to your hardhat.config.ts:

```js
import "@cuonghx.gu-tech/hardhat-gcp-kms-signer-plugin";
```

## Usage

Provide AWS KMS credentials

```javascript
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 50,
      },
    },
  },
  networks: {
    "custom-network": {
      url: process.env.JOC_TESTNET_ENDPOINT_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 107000000000,
      gcpKmsConfigs: [
        {
          credentials: {
            client_email: process.env.GCP_KMS_CLIENT_ID!,
            private_key:  process.env.GCP_KMS_PRIVATE_KEY!,
          },
          projectId:  process.env.GCP_KMS_PROJECT_ID!,
          locationId:  process.env.GCP_KMS_LOCATION_ID!,
          keyRingId:  process.env.GCP_KMS_KEY_RING_ID!,
          keyId:  process.env.GCP_KMS_KEY_ID!,
          versionId:  process.env.GCP_KMS_VERSION_ID!,
        },
      ],
    },
  },
};
```

Use signers

```js
const [deployer] = await getKmsSigners();
const Factory = await ethers.getContractFactory("Contract", deployer);
```
