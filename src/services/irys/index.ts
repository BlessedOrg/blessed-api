import { Uploader } from "@irys/upload";
import { BaseEth } from "@irys/upload-ethereum";

export const getIrysUploader = async () =>
  Uploader(BaseEth).withWallet(process.env.METADATA_FILES_BASE_ETH_OPERATOR_PRIVATE_KEY);

const uploadImage = async (base64String) => {
  const irys = await getIrysUploader();
  try {
    const receipt = await irys.upload(
      Buffer.from(base64String, "base64"),
      {
        tags: [
          { name: "content-type", value: "image/png" }
        ]
      }
    );

    return `https://gateway.irys.xyz/${receipt.id}`;
  } catch (error) {
    console.log(`🚨 Error while uploading image via Irys: ${error.messsage}`);
    throw new Error(`🚨 Error while uploading image via Irys: ${error.messsage}`);
  }
};

export const uploadFile = async ({ name, description, image }: Metadata) => {
  const irys = await getIrysUploader();
  try {
    const receipt = await irys.upload(
      JSON.stringify({
        name,
        description,
        image
      }),
      {
        tags: [
          { name: "content-type", value: "application/json" }
        ]
      }
    );
    return `https://gateway.irys.xyz/${receipt.id}`;
  } catch (error) {
    console.log(`🚨 Error while uploading JSON via Irys: ${error.messsage}`);
    throw new Error(`🚨 Error while uploading JSON via Irys: ${error.messsage}`);
  }
};

interface Metadata {
  name: string;
  symbol: string;
  description: string;
  image: string; // Base64 encoded image string
}

export const uploadMetadata = async ({ name, symbol, description, image }: Metadata) => {
  const imageUrl = await uploadImage(image);
  return uploadFile({ name, symbol, description, image: imageUrl });
};
