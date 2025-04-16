'use client';

import { ReactNode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import store from "@/store";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <SessionProvider>
        {children}
      </SessionProvider>
    </ReduxProvider>
  );
}
