
import Sidebar from "@/components/Landing/Sidebar"; 
import TrackComp from "@/components/Track/TrackComp"; 

export default function TrackPage() {
    return (
            <div className="flex bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC]"> 
                <Sidebar />
                <TrackComp />
            </div>
    );
}