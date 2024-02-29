import { Provider, defineProperties, ethers, keccak256 } from "ethers";
import { GetPublicKeyCommand, KMSClient } from "@aws-sdk/client-kms";

export interface EthersKmsSignerConfig {
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  region: string;
  keyId: string;
}

export class AwsKmsSigner<P extends null | Provider = null | Provider>
  implements ethers.Signer
{
  private config: EthersKmsSignerConfig;
  private client: KMSClient;
  provider!: P;

  constructor(config: EthersKmsSignerConfig, provider?: P) {
    defineProperties<AwsKmsSigner>(this, {
      provider: provider || null,
    });
    this.config = config;
    this.client = this._createKMSClient(config.region, config.credentials);
  }

  connect(provider: ethers.Provider | null): AwsKmsSigner {
    return new AwsKmsSigner(this.config, provider);
  }

  async getAddress(): Promise<string> {
    const command = new GetPublicKeyCommand({ KeyId: this.config.keyId });
    const response = await this.client.send(command);

    const publicKey = response.PublicKey;
    if (!publicKey) {
      throw new Error(`Could not get Public Key from KMS.`);
    }

    return "";
  }
  getNonce(blockTag?: ethers.BlockTag | undefined): Promise<number> {
    throw new Error("Method not implemented.");
  }
  populateCall(
    tx: ethers.TransactionRequest
  ): Promise<ethers.TransactionLike<string>> {
    throw new Error("Method not implemented.");
  }
  populateTransaction(
    tx: ethers.TransactionRequest
  ): Promise<ethers.TransactionLike<string>> {
    throw new Error("Method not implemented.");
  }
  estimateGas(tx: ethers.TransactionRequest): Promise<bigint> {
    throw new Error("Method not implemented.");
  }
  call(tx: ethers.TransactionRequest): Promise<string> {
    throw new Error("Method not implemented.");
  }
  resolveName(name: string): Promise<string | null> {
    throw new Error("Method not implemented.");
  }
  signTransaction(tx: ethers.TransactionRequest): Promise<string> {
    throw new Error("Method not implemented.");
  }
  sendTransaction(
    tx: ethers.TransactionRequest
  ): Promise<ethers.TransactionResponse> {
    throw new Error("Method not implemented.");
  }
  signMessage(message: string | Uint8Array): Promise<string> {
    throw new Error("Method not implemented.");
  }
  signTypedData(
    domain: ethers.TypedDataDomain,
    types: Record<string, ethers.TypedDataField[]>,
    value: Record<string, any>
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }

  private _createKMSClient(
    region: string,
    credentials?: {
      accessKeyId: string;
      secretAccessKey: string;
    }
  ) {
    return new KMSClient({
      credentials,
      region,
    });
  }
}
