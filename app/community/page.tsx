import StreakDisplay from "@/components/Community/Streak";
import Streak from "@/components/Community/Streak";
import Users from "@/components/Community/Users";
import Sidebar from "@/components/Landing/Sidebar";


export default function CommunityPage() {

    return <div className="flex items-center w-full justify-center bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] min-h-screen">
        <div>
            <Sidebar />
        </div>
        <div className="flex flex-col  w-full ml-64">
        <Users />
        </div>
       <div className=" absolute top-0 right-8 mt-16">
        <StreakDisplay />
       </div>
    </div>
}