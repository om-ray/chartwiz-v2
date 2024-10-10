import React from "react";
import { usePathname } from "next/navigation";
import NavLink from "./NavLink";
import { useSession } from "next-auth/react";
import { SignOutButton } from "./Buttons";

function NavBar() {
  const pathname = usePathname();
  const { status } = useSession();

  return (
    <div className="absolute top-5 w-full h-auto flex items-center justify-center px-4">
      <div className="flex flex-row items-center justify-center space-x-4 w-1/3 bg-zinc-800 bg-opacity-50 backdrop-blur-sm rounded-full px-10 py-3">
        <NavLink path="/" active={pathname === "/"}>
          CHARTWIZ
        </NavLink>
        {status === "authenticated" && (
          <>
            <NavLink path="/charts" active={pathname === "/charts"}>
              CHARTS
            </NavLink>
            <NavLink path="/about" active={pathname === "/about"}>
              ABOUT
            </NavLink>
            <SignOutButton rounded={true} />
          </>
        )}
      </div>
    </div>
  );
}

export default NavBar;
