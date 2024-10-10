import React from "react";
import Text from "./Text";

function NavLink({ children, active, path }: { children: React.ReactNode; active: boolean; path: string }) {
  return (
    <div className="w-full">
      <Text>
        <a
          href={path}
          onMouseEnter={(event: { currentTarget: { style: { color: string; fontSize: string } } }) => {
            if (!active) {
              event.currentTarget.style.color = "white";
              event.currentTarget.style.fontSize = "1.10rem";
            }
          }}
          onMouseLeave={(event: { currentTarget: { style: { color: string; fontSize: string } } }) => {
            if (!active) {
              event.currentTarget.style.color = "#4b5563";
              event.currentTarget.style.fontSize = "1rem";
            }
          }}
          className={`w-full flex items-center justify-center ${
            active ? "text-white text-xl" : "text-gray-600 text-base"
          } text-decoration-none transition-all duration-200`}>
          {children}
        </a>
      </Text>
    </div>
  );
}

export default NavLink;
