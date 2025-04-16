
import Appbar from "@/components/Landing/Appbar";
import LandingHero from "../components/Landing/LandingHero";

export default function Index() {
  return <div className="flex flex-col items-center justify-center">
    <Appbar />
  
    <LandingHero />
  </div>
}