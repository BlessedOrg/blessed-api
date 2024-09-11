import Image from "next/image";

export const Navigation = () => {
return <div className="flex justify-between">
  <div className="p-2 pr-6 rounded-full bg-white"><Image src={'/logo.svg'} alt="logo blessed" width={119} height={36}/></div>
</div>
}