/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from "react";
import { createChart, ColorType, LineData, HistogramData } from "lightweight-charts";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import NavBar from "@/components/NavBar";

interface Metric {
  id: number;
  metric_name: string;
  metric_id: string;
}

interface DataPoint {
  time: number;
  value: number;
}

interface ChartData {
  rsi?: DataPoint[];
  signal?: DataPoint[];
  price?: DataPoint[];
  liquidity?: DataPoint[];
}

const Charts: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [availableMetrics, setAvailableMetrics] = useState<Metric[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["price_usdt_close"]);
  const [chartData, setChartData] = useState<ChartData>({});
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const asset = "btc";
        const response = await fetch(`/api/metrics?asset=${asset}`);
        const metricsData = await response.json();

        console.log("Fetched Metrics:", metricsData);

        setAvailableMetrics(Array.isArray(metricsData) ? metricsData : []);
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
        setAvailableMetrics([]);
      }
    }

    fetchMetrics();
  }, []);

  useEffect(() => {
    async function fetchChartData() {
      try {
        const asset = "btc";
        const queryString = `asset=${asset}&${selectedMetrics
          .map((metric) => `metrics=${metric}`)
          .join("&")}`;
        const response = await fetch(`/api/charts?${queryString}`);
        const data = await response.json();

        console.log("Fetched Chart Data:", data);

        if (Array.isArray(data) && data.length > 0) {
          const chartData: ChartData = {};

          data.forEach((row: { data: any; metric_id: string }) => {
            chartData[row.metric_id as keyof ChartData] = row.data
              .map((item: any) => {
                if (item.o) {
                  const values = Object.entries(item.o).map(([key]) => ({
                    time: item.t,
                    value: item.o[key],
                  }));
                  return values;
                } else {
                  return {
                    time: item.t,
                    value: item.v,
                  };
                }
              })
              .flat();
          });

          console.log("Processed Chart Data:", chartData);

          setChartData(chartData);
        } else {
          console.error("Unexpected response format or empty data:", data);
        }
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      }
    }

    fetchChartData();
  }, [selectedMetrics]);

  useEffect(() => {
    if (chartContainerRef.current && Object.keys(chartData).length > 0) {
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

      const priceSeries = chart.addLineSeries({
        color: "white",
        lineWidth: 2,
        priceScaleId: "right",
      });

      const rsiSeries = chart.addLineSeries({
        color: "red",
        lineWidth: 1,
        priceScaleId: "left",
      });

      const signalSeries = chart.addLineSeries({
        color: "blue",
        lineWidth: 1,
        priceScaleId: "left",
      });

      const liquiditySeries = chart.addHistogramSeries({
        color: "green",
        priceScaleId: "left",
      });

      priceSeries.setData((chartData.price as LineData[]) || []);
      rsiSeries.setData((chartData.rsi as LineData[]) || []);
      signalSeries.setData((chartData.signal as LineData[]) || []);
      liquiditySeries.setData((chartData.liquidity as HistogramData[]) || []);

      chart.priceScale("right").applyOptions({
        alignLabels: true,
      });

      chart.priceScale("left").applyOptions({
        alignLabels: true,
      });

      const timeScale = chart.timeScale();

      const synchronizeVisibleTimeRange = () => {
        const visibleRange = timeScale.getVisibleLogicalRange();
        if (visibleRange) {
          timeScale.setVisibleLogicalRange(visibleRange);
        }
      };

      timeScale.subscribeVisibleLogicalRangeChange(synchronizeVisibleTimeRange);

      window.addEventListener("resize", () => {
        chart.applyOptions({
          width: chartContainerRef.current?.clientWidth,
          height: chartContainerRef.current?.clientHeight,
        });
      });

      return () => {
        chart.remove();
      };
    }
  }, [chartData]);

  const handleMetricSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const metric = e.target.value;
    if (e.target.checked) {
      setSelectedMetrics((prevMetrics) => [...prevMetrics, metric]);
    } else {
      setSelectedMetrics((prevMetrics) => prevMetrics.filter((m) => m !== metric));
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push("/");
    return null;
  }

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center h-screen w-screen">
      <NavBar />
      <div className="bg-card p-4 rounded-lg shadow-md w-full h-3/4 flex flex-col items-center justify-center mt-20">
        <h1 className="text-white text-xl mb-4">Select Metrics for Asset (BTC)</h1>

        <div className="mb-4">
          {availableMetrics.length > 0 ? (
            availableMetrics.map((metric) => (
              <label key={metric.id} className="mr-4">
                <input
                  type="checkbox"
                  value={metric.metric_id}
                  checked={selectedMetrics.includes(metric.metric_id)}
                  onChange={handleMetricSelection}
                  className="mr-2"
                />
                {metric.metric_name}
              </label>
            ))
          ) : (
            <p>No metrics available for this asset.</p>
          )}
        </div>

        <div className="bg-dark p-4 rounded-lg shadow-md w-full h-full flex items-center justify-center">
          <div ref={chartContainerRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default Charts;
