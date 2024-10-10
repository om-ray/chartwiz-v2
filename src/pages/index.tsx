/* eslint-disable @typescript-eslint/no-unused-vars */
import { EmailSignInButton, GoogleSignInButton, SignOutButton } from "@/components/Buttons";
import NavBar from "@/components/NavBar";
import Text from "@/components/Text";
import { useSession } from "next-auth/react";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { useEffect } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyCAqopVobKYqcQGOWhyq9kIYnQC9cZ0ARM",
  authDomain: "chartwiz-v2-bb887.firebaseapp.com",
  projectId: "chartwiz-v2-bb887",
  storageBucket: "chartwiz-v2-bb887.appspot.com",
  messagingSenderId: "710700215117",
  appId: "1:710700215117:web:0ad5984b1bf30070f8a504",
  measurementId: "G-SRJDWQYWYB",
};

export default function Home() {
  const { status } = useSession();

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center h-screen`}>
      <NavBar />
      {status === "authenticated" ? (
        <>
          <Text>
            <p>You are already logged in</p>
          </Text>
          <SignOutButton rounded={false} />
        </>
      ) : (
        <div className="flex flex-col gap-4 w-full items-center justify-center">
          <GoogleSignInButton />
          {/* <EmailSignInButton /> */}
        </div>
      )}
    </div>
  );
}
