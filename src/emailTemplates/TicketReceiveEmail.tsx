import * as React from "react";
import { Body, Button, Html } from "@react-email/components";
import { TailwindWrapper } from "@/emailTemplates/TailwindWrapper";

export function TicketReceiveEmail() {
  return (
    <Html lang="en">
      <Body>
        <TailwindWrapper>
          <div className="flex flex-col gap-4 justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full flex flex-col gap-4 items-center">
              <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Your ticket arrived!</h1>
              <div className="text-center">
                <p className="text-gray-600 mb-4">Hi,</p>
                <div className="text-4xl font-bold text-red-500 my-6">Happy event time!</div>
              </div>
              <div className="text-sm text-gray-500 text-center mt-8">
                <p>If you didn't ask for this confirmation, please ignore this message.</p>
              </div>
              <Button
                href="https://blessed.fan"
                className="mt-4 bg-green-500 px-6 py-2 rounded-full font-medium leading-4 text-white text-black"
              >
                Blessed.fan
              </Button>
            </div>
          </div>
        </TailwindWrapper>
      </Body>
    </Html>
  );
}
