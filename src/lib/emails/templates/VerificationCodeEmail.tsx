import * as React from "react";
import { Body, Html, Img, Link, render } from "@react-email/components";
import { _TailwindWrapper } from "@/lib/emails/templates/_TailwindWrapper";

export function VerificationCodeEmailTemplate({ otp }) {
  const appLogoUrl = "https://avatars.githubusercontent.com/u/164048341?s=200&v=4"
  return (
    <Html lang="en">
      <Body>
        <_TailwindWrapper>
          <div className="flex flex-col gap-4 justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
              <Img
                src={appLogoUrl}
                alt="Blessed logo"
                style={logo}
              />
              <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Your One-Time Password</h1>
              <div className="text-center">
                <p className="text-gray-600 mb-4">Hello there,</p>
                <p className="text-gray-600 mb-4">Here is your One-Time Password for signing in to Blessed.fan</p>
                <div className="text-4xl font-bold text-red-500 my-6">{otp}</div>
                {/* 💡 TODO?: add the link to the session from Capsule/Privy? */}
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
              <div className="text-[1px]">{otp}</div>
            </div>
          </div>
        </_TailwindWrapper>
      </Body>
    </Html>
  );
}

const logo = {
  margin: "0 auto",
  maxWidth: "100px"
};

const renderVerificationCodeEmail = async ({ otp }) => {
  return await render(
    <VerificationCodeEmailTemplate
      otp={otp}
    />
  );
};

export default renderVerificationCodeEmail;
