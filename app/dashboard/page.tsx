'use client'
import { useSession } from 'next-auth/react'

export default function Dashboard() {
    const {data: session} = useSession();

    return <div className='flex flex-col items-center justify-center min-h-screen'>
     <div className='flex flex-col items-center justify-center'>
     <p className='text-3xl font-bold'> Hello, {session?.user?.name}</p>
     <p>Welcome to Vein AI, an AI powered personal health and wellness assistant.</p>
     </div>
    </div>
}