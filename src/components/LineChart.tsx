import React, { useEffect, useRef } from "react";
import { createChart, ColorType } from "lightweight-charts";

interface DataPoint {
  time: string;
  value: number;
}

interface LineChartProps {
  data: {
    price?: DataPoint[];
    rsi?: DataPoint[];
    signal?: DataPoint[];
    liquidity?: DataPoint[];
  };
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
          horzLines: { color: "#333" },
          vertLines: { color: "#333" },
        },
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
      });

      if (data.price) {
        const priceSeries = chart.addLineSeries({
          color: "white",
          lineWidth: 2,
        });
        priceSeries.setData(data.price);
      }

      if (data.rsi) {
        const rsiSeries = chart.addLineSeries({
          color: "red",
          lineWidth: 1,
        });
        rsiSeries.setData(data.rsi);
      }

      if (data.signal) {
        const signalSeries = chart.addLineSeries({
          color: "blue",
          lineWidth: 1,
        });
        signalSeries.setData(data.signal);
      }

      if (data.liquidity) {
        const liquiditySeries = chart.addLineSeries({
          color: "green",
          lineWidth: 1,
        });
        liquiditySeries.setData(data.liquidity);
      }

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
