import { DetailedHTMLProps, HTMLAttributes } from "react";

export const Card = ({...props}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
  const { children, className, ...rest } = props;
  return <div className={`bg-white p-6 rounded-3xl ${className ? className : ""}`} {...rest}>{children}</div>
}