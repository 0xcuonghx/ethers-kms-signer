import { expect } from "chai";
import dotenv from "dotenv";

import { GcpKmsSigner } from "../src/gcp-kms-signer";
import { recoverAddress, solidityPackedKeccak256 } from "ethers";

dotenv.config();

context("GcpKmsSigner", () => {
  let signer: GcpKmsSigner;

  beforeEach(() => {
    signer = new GcpKmsSigner({
      projectId: "safe-global-dev-405001",
      locationId: "northamerica-northeast1",
      keyRingId: "test",
      keyId: "test-key-name-3",
      versionId: "1",
    });
  });

  it("Should return correct public key", async () => {
    expect(await signer.getAddress()).to.eql(
      "0x4fde0bb456be6ccc6ee38c04cec17ceff737c125"
    );
  });

  it("Should get sign a message", async () => {
    const testMessage = "test";
    const publicAddress = await signer.getAddress();

    const signature = await signer.signMessage(testMessage);

    const eip191Hash = solidityPackedKeccak256(
      ["string", "string"],
      ["\x19Ethereum Signed Message:\n4", testMessage]
    );

    const recoveredAddress = recoverAddress(eip191Hash, signature);

    expect(recoveredAddress.toLowerCase()).to.equal(
      publicAddress.toLowerCase()
    );
  });
});
