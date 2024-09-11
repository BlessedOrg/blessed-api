"use client";
import Link from "next/link";
import { Accordion } from "flowbite-react";

export const QuestionsSection = () => {
return <div className="py-10 flex flex-col gap-6 px-4">
  <div>
    <h2 className="font-bold uppercase text-3xl md:text-6xl text-center">Questions? Check here!</h2>
    <p className="text-center">Want to know more? Connect with our team
      via <Link href={"/"} className="underline">contact</Link>.</p>
  </div>

  <Accordion className="max-w-[850px] w-full mt-10">
    <Accordion.Panel>
      <Accordion.Title>How does Blessed ensure the authenticity of entries?</Accordion.Title>
      <Accordion.Content>
        <p className="mb-2 text-gray-500">
          Each entry is secured using advanced blockchain technology, ensuring tamper-proof and verifiable transactions. This guarantees that entries cannot be duplicated or altered.
        </p>
      </Accordion.Content>
    </Accordion.Panel>
    <Accordion.Panel>
      <Accordion.Title>How does Blessed ensure the authenticity of entries?</Accordion.Title>
      <Accordion.Content>
        <p className="mb-2 text-gray-500">
          Each entry is secured using advanced blockchain technology, ensuring tamper-proof and verifiable transactions. This guarantees that entries cannot be duplicated or altered.
        </p>
      </Accordion.Content>
    </Accordion.Panel>
    <Accordion.Panel>
      <Accordion.Title>How does Blessed ensure the authenticity of entries?</Accordion.Title>
      <Accordion.Content>
        <p className="mb-2 text-gray-500">
          Each entry is secured using advanced blockchain technology, ensuring tamper-proof and verifiable transactions. This guarantees that entries cannot be duplicated or altered.
        </p>
      </Accordion.Content>
    </Accordion.Panel>
    <Accordion.Panel>
      <Accordion.Title>How does Blessed ensure the authenticity of entries?</Accordion.Title>
      <Accordion.Content>
        <p className="mb-2 text-gray-500">
          Each entry is secured using advanced blockchain technology, ensuring tamper-proof and verifiable transactions. This guarantees that entries cannot be duplicated or altered.
        </p>
      </Accordion.Content>
    </Accordion.Panel>
  </Accordion>
</div>;
}