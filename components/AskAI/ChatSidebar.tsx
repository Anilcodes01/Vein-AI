import Image from "next/image";

export default function ChatSidebar() {
  return (
    <div className="flex py-2 px-2 w-full  h-full  text-black ">
     <div className="border rounded-lg h-fit  flex items-center w-full justify-start">
        <Image src="/logot.png" height={200} width={200} alt="logo.png" className="h-16 w-16"  />
        <h1 className="text-3xl text-green-700 font-bold">Vein</h1>
     </div>
    </div>
  );
}
