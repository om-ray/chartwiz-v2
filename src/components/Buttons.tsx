import { signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import Image from "next/image";

export function GoogleSignInButton() {
  return (
    <Button
      className="w-1/6"
      onClick={() => signIn("google", { callbackUrl: "http://localhost:3000/charts" })}
      variant="default">
      <Image src="/Google icon.png" alt="Google" width={20} height={20} />
    </Button>
  );
}

export function EmailSignInButton() {
  return (
    <Button
      className="w-1/6"
      onClick={() => signIn("email", { callbackUrl: "http://localhost:3000/charts" })}
      variant="default">
      Sign in with Email
    </Button>
  );
}

export function SignOutButton({ rounded }: { rounded: boolean }) {
  return (
    <Button className={`w-40 ${rounded ? "rounded-full" : ""}`} onClick={() => signOut()} variant="default">
      <Image src="/Logout.png" alt="Log out" width={20} height={20} />
    </Button>
  );
}
