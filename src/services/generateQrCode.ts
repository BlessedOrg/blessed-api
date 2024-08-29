import QRCode from "qrcode";

export const generateQrCode = async (text) => {
  try {
    const qr = await QRCode.toDataURL(text);
    return qr;
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};
