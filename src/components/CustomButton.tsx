import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

export const CustomButton = ({...props}: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => {
  const { children, className, ...rest } = props;
return <button className={`font-semibold bg-primary-500 text-black-500 h-[52px] px-6 py-2 rounded-full ${className ? className : ""}`} {...rest}>{children}</button>
}