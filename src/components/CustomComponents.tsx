import React, { AnchorHTMLAttributes, ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import Link from "next/link";

export const CustomButton = ({
  ...props
}: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & { isProcessing?: boolean }) => {
  const { children, className, isProcessing, ...rest } = props;
  return (
    <button
      disabled={isProcessing}
      className={`disabled:cursor-no-drop font-semibold bg-primary-500 text-black-500 h-[52px] px-6 py-2 rounded-full ${className ? className : ""}`}
      {...rest}
    >
      {isProcessing ? "Loading..." : children}
    </button>
  );
};

export const CustomLink = ({
  ...props
}: DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) => {
  const { children, className, href, ...rest } = props;
  return (
    <Link
      href={href}
      className={`flex items-center justify-center text-center font-semibold bg-primary-500 text-black-500 h-[52px] px-6 py-2 rounded-full ${className ? className : ""}`}
      {...rest}
    >
      {children}
    </Link>
  );
};
