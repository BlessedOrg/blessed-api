import * as React from "react";
import { Body, Html, Link } from "@react-email/components";
import { TailwindWrapper } from "@/emailTemplates/TailwindWrapper";

export function VerificationCodeEmail({ code }) {
  return (
    <Html lang="en">
      <Body>
        <TailwindWrapper>
          <div className="flex flex-col gap-4 justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
              <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Your verification code</h1>
              <div className="text-center">
                <p className="text-gray-600 mb-4">Hi,</p>
                <p className="text-gray-600 mb-4">Your verification code is:</p>
                <div className="text-4xl font-bold text-red-500 my-6">{code}</div>
                <p className="text-gray-600 mb-6">Please enter this code to verify your account.</p>
              </div>
              <div className="text-sm text-gray-500 text-center mt-8">
                <p>If you didn't ask for this code, please ignore this message.</p>
              </div>
              <div className="w-full">
                <Link
                  href="https://blessed.fan"
                  className="mx-auto w-fit block bg-green-500 px-6 py-2 rounded-full font-medium leading-4 text-white text-black"
                >
                  Blessed.fan
                </Link>
              </div>
              <div className="text-[1px]">{code}</div>
            </div>
          </div>
        </TailwindWrapper>
      </Body>
    </Html>
  );
}
