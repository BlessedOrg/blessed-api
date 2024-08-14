"use server";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export async function createSessionTokens(payload: any) {
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    { expiresIn: "2d" },
  );
  const refreshToken = uuidv4();

  // const hashedAccessToken = awaitait bcrypt.hash(accessToken, 10);
  // const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  const hashedAccessToken = accessToken;
  const hashedRefreshToken = refreshToken;

  return {
    accessToken,
    refreshToken,
    hashedAccessToken,
    hashedRefreshToken,
  };
}