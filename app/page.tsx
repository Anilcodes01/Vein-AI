
import Appbar from "@/components/Landing/Appbar";
import LandingHero from "../components/Landing/LandingHero";

export default function Index() {
  return (
    <div className="flex flex-col bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] items- h-screen justify-">
    
        <Appbar />
      
      <LandingHero />
    </div>
  );
}
