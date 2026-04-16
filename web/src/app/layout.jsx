
import React from "react";

import NextTopLoader from 'nextjs-toploader';
import MyApp from './app';
import "./global.css";
import { CustomizerContextProvider } from "./context/customizerContext";
import { AuthContextProvider } from "./context/AuthContext";


export const metadata = {
  title: 'Biblical discipline',
  description: 'Biblical discipline Panel',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextTopLoader color="#5D87FF" />
        <AuthContextProvider>
          <CustomizerContextProvider>
            <MyApp>{children}</MyApp>
          </CustomizerContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}


