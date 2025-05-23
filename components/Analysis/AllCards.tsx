import CalorieCard from "./CalorieCard";
import CarbsCard from "./CarbsCard";
import FatCards from "./FatCard";
import ProteinCard from "./ProteinCard";


export default function AllCard() {

    return <div className="grid lg:grid-cols-2 gap-4 mt-8 lg:ml-16 ">
        <CalorieCard />
        <ProteinCard />
        <FatCards />
        <CarbsCard />
    </div>
}