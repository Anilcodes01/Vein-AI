"use client";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

const SocialLogin: React.FC = () => {
  const handleGoogleSignin = async () => {
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
      toast.success("Successfully signed in with Google!");
    } catch (error) {
      toast.error("Google sign-in failed!");
      console.log(error);
    }
  };
  return (
    <div className=" flex gap-4 w-full">
      <button
        type="button"
        className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl 
           border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors
           font-medium text-gray-700;"
        onClick={handleGoogleSignin}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span className="text-sm">Continue with Google</span>
      </button>

      <button
        type="button"
        className="flex items-center justify-center gap-2 w-full  px-6 rounded-xl 
           border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors
           font-medium text-gray-700;"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path
            d="M17.5821 12.6655C17.5499 10.6298 18.8157 9.07462 21.3695 8.0241C19.9878 6.92593 18.0375 6.37507 16.0255 6.86808C14.0134 7.36109 12.6752 8.92325 12.0047 8.92325C11.2831 8.92325 9.71646 6.9241 7.25193 6.9241C3.93034 6.96838 0.609766 9.3855 0.657197 13.3798C0.704628 14.8453 1.0136 16.7891 1.68506 18.9748C2.54795 21.7991 4.7469 25.5387 7.06509 25.4744C8.69303 25.4401 9.84693 24.3977 11.9096 24.3977C13.8908 24.3977 14.9521 25.4744 16.8399 25.4744C19.1907 25.4402 21.1246 22.0949 21.9447 19.2705C18.4541 17.4695 17.5821 12.7976 17.5821 12.6655ZM15.0698 4.69834C16.0827 3.46951 17.0906 1.57849 16.8683 0C15.1867 0.168507 13.5539 1.15632 12.6278 2.37658C11.7775 3.4776 10.9723 5.3671 11.2336 6.86809C13.0661 6.98803 14.0519 5.94159 15.0698 4.69834Z"
            fill="black"
          />
        </svg>
        <span className="text-sm">Continue with Apple</span>
      </button>
    </div>
  );
};

export default SocialLogin;
