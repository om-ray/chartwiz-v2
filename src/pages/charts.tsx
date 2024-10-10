import React from "react";
import { LineChart } from "@/components/LineChart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import NavBar from "@/components/NavBar";

function Charts() {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const chartData = [
    { time: "2023-01-01", value: 10 },
    { time: "2023-02-01", value: 20 },
    { time: "2023-03-01", value: 15 },
    { time: "2023-04-01", value: 25 },
    { time: "2023-05-01", value: 30 },
  ];

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center h-screen w-screen">
      <NavBar />
      <div className="bg-card p-4 rounded-lg shadow-md w-full h-3/4 flex items-center justify-center mt-20">
        <LineChart data={chartData} />
      </div>
    </div>
  );
}

export default Charts;
