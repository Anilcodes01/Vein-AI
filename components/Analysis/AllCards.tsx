import CalorieCard from "./CalorieCard";
import CarbsCard from "./CarbsCard";
import FatCard from "./FatCard"; // Corrected import name if component file is FatCard.tsx
import ProteinCard from "./ProteinCard";
import WaterCard from "./WaterCard"; // Import WaterCard


export default function AllCard() { // Assuming component name is AllCard
    return (
        <div className="grid lg:grid-cols-2 xl:grid-cols-2 gap-4 mt-8 lg:ml-16 ">
            <CalorieCard />
            <ProteinCard />
            <FatCard />
            <CarbsCard />
            <WaterCard /> 
        </div>
    );
}