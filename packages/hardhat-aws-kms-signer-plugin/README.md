# ethers-aws-kms-signer

Hardhat plugin for @aws-sdk/client-kms integration with ethers@v6 signer

## Feature

- ethers@v6 signer compatible
- hardhat plugin

## Install

```sh
npm install @cuonghx.gu-tech/hardhat-aws-kms-signer-plugin
```

And add the following statement to your hardhat.config.js:

```js
require("@cuonghx.gu-tech/hardhat-aws-kms-signer-plugin");
```

Or, if you are using TypeScript, add this to your hardhat.config.ts:

```js
import "@cuonghx.gu-tech/hardhat-aws-kms-signer-plugin";
```

## Usage

Provide AWS KMS credentials

```javascript
const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 50,
      },
    },
  },
  networks: {
    "custom-network": {
      url: process.env.JOC_TESTNET_ENDPOINT_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 107000000000,
      awsKmsConfigs: [
        {
          keyId: process.env.AWS_KMS_KEY_ID!,
          region: process.env.AWS_KMS_REGION!,
          credentials: {
            accessKeyId: process.env.AWS_KMS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_KMS_SECRET_ACCESS_KEY!,
          },
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
