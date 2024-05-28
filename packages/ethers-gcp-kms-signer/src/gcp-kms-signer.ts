import { KeyManagementServiceClient } from "@google-cloud/kms";
import { ECDSASigValue } from "@peculiar/asn1-ecc";
import { AsnConvert } from "@peculiar/asn1-schema";
import { SubjectPublicKeyInfo } from "@peculiar/asn1-x509";
import {
  AbstractSigner,
  assert,
  assertArgument,
  BytesLike,
  dataLength,
  getAddress,
  getBytes,
  hashMessage,
  keccak256,
  N as secp256k1N,
  Provider,
  recoverAddress as recoverAddressFn,
  resolveAddress,
  resolveProperties,
  Signature,
  toBeHex,
  toBigInt,
  Transaction,
  TransactionLike,
  TransactionRequest,
  TypedDataDomain,
  TypedDataEncoder,
  TypedDataField,
} from "ethers";

export type EthersGcpKmsSignerConfig = {
  credentials?: {
    client_email: string;
    private_key: string;
  };
  projectId: string;
  locationId: string;
  keyRingId: string;
  keyId: string;
  versionId: string;
};

export class GcpKmsSigner<
  P extends null | Provider = null | Provider
> extends AbstractSigner {
  private config: EthersGcpKmsSignerConfig;
  private client: KeyManagementServiceClient;
  private versionName: string;
  address!: string;

  constructor(config: EthersGcpKmsSignerConfig, provider?: P) {
    super(provider);
    this.config = config;
    this.client = this._createKMSClient(config.credentials);
    this.versionName = this.client.cryptoKeyVersionPath(
      config.projectId,
      config.locationId,
      config.keyRingId,
      config.keyId,
      config.versionId
    );
  }

  connect(provider: Provider | null): GcpKmsSigner {
    return new GcpKmsSigner(this.config, provider);
  }

  async getAddress(): Promise<string> {
    if (!this.address) {
      // const command = new GetPublicKeyCommand({ KeyId: this.config.keyId });
      // const response = await this.client.send(command);
      const request = {
        name: this.versionName,
      };
      const [publicKeyHex] = await this.client.getPublicKey(request);

      if (!publicKeyHex || !publicKeyHex.pem) {
        throw new Error(`Could not get Public Key from KMS.`);
      }

      const base64Key = publicKeyHex.pem
        .replace(/-----BEGIN PUBLIC KEY-----/g, "")
        .replace(/-----END PUBLIC KEY-----/g, "")
        .replace(/\n/g, "")
        .trim();

      const ecPublicKey = AsnConvert.parse(
        Buffer.from(base64Key, "base64"),
        SubjectPublicKeyInfo
      ).subjectPublicKey;

      // The public key starts with a 0x04 prefix that needs to be removed
      // more info: https://www.oreilly.com/library/view/mastering-ethereum/9781491971932/ch04.html
      this.address = `0x${keccak256(
        new Uint8Array(ecPublicKey.slice(1, ecPublicKey.byteLength))
      ).slice(-40)}`;
    }

    return this.address;
  }

  async signTransaction(tx: TransactionRequest): Promise<string> {
    // Replace any Addressable or ENS name with an address
    const { to, from } = await resolveProperties({
      to: tx.to ? resolveAddress(tx.to, this.provider) : undefined,
      from: tx.from ? resolveAddress(tx.from, this.provider) : undefined,
    });

    if (to != null) {
      tx.to = to;
    }
    if (from != null) {
      tx.from = from;
    }

    const address = await this.getAddress();

    if (tx.from != null) {
      assertArgument(
        getAddress(tx.from as string) === address,
        "transaction from address mismatch",
        "tx.from",
        tx.from
      );
      delete tx.from;
    }

    // Build the transaction
    const btx = Transaction.from(tx as TransactionLike<string>);
    btx.signature = await this._sign(btx.unsignedHash);

    return btx.serialized;
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    const signature = await this._sign(hashMessage(message));
    return signature.serialized;
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, any>
  ): Promise<string> {
    // Populate any ENS names
    const populated = await TypedDataEncoder.resolveNames(
      domain,
      types,
      value,
      async (name: string) => {
        // @TODO: this should use resolveName; addresses don't
        //        need a provider

        assert(
          this.provider != null,
          "cannot resolve ENS names without a provider",
          "UNSUPPORTED_OPERATION",
          {
            operation: "resolveName",
            info: { name },
          }
        );

        const address = await this.provider.resolveName(name);
        assert(address != null, "unconfigured ENS name", "UNCONFIGURED_NAME", {
          value: name,
        });

        return address;
      }
    );

    const signature = await this._sign(
      TypedDataEncoder.hash(populated.domain, types, populated.value)
    );

    return signature.serialized;
  }

  private _createKMSClient(credentials?: {
    client_email: string;
    private_key: string;
  }) {
    return new KeyManagementServiceClient({ credentials });
  }

  private async _sign(digest: BytesLike): Promise<Signature> {
    assertArgument(
      dataLength(digest) === 32,
      "invalid digest length",
      "digest",
      digest
    );

    const [signatureHex] = await this.client.asymmetricSign({
      name: this.versionName,
      digest: {
        sha256: getBytes(digest),
      },
    });

    if (!signatureHex || !signatureHex.signature) {
      throw new Error("Could not fetch Signature from KMS.");
    }

    const signature = AsnConvert.parse(
      signatureHex.signature as Uint8Array,
      ECDSASigValue
    );

    let s = toBigInt(new Uint8Array(signature.s));
    s = s > secp256k1N / BigInt(2) ? secp256k1N - s : s;

    const recoverAddress = recoverAddressFn(digest, {
      r: toBeHex(toBigInt(new Uint8Array(signature.r)), 32),
      s: toBeHex(s, 32),
      v: 0x1b,
    });

    const address = await this.getAddress();

    return Signature.from({
      r: toBeHex(toBigInt(new Uint8Array(signature.r)), 32),
      s: toBeHex(s, 32),
      v: recoverAddress.toLowerCase() !== address.toLowerCase() ? 0x1c : 0x1b,
    });
  }
}
