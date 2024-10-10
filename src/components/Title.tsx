import React, { ReactNode } from "react";
import Text from "./Text";

interface TitleProps {
  children: ReactNode;
}

function Title({ children }: TitleProps) {
  return (
    <Text>
      <h1 className="text-4xl">{children}</h1>
    </Text>
  );
}

export default Title;
