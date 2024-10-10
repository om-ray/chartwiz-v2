import React, { useEffect, useRef } from "react";
import { createChart, ColorType } from "lightweight-charts";

interface LineChartProps {
  data: { time: string; value: number }[];
}

export const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "white",
        },
        grid: {
          horzLines: {
            color: "#333",
          },
          vertLines: {
            color: "#333",
          },
        },
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
      });

      const lineSeries = chart.addLineSeries({
        color: "white",
        lineWidth: 2,
      });

      lineSeries.setData(data);

      chart.timeScale().fitContent();

      const handleResize = () => {
        chart.applyOptions({
          width: chartContainerRef.current?.clientWidth,
          height: chartContainerRef.current?.clientHeight,
        });
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        chart.remove();
      };
    }
  }, [data]);

  return <div className="w-full h-full" ref={chartContainerRef} />;
};
