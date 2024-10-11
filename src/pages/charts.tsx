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
  time: number; // Ensure time is a number
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
            if (row.metric_id === "tether_ratio_channel") {
              chartData["rsi"] = row.data.map((item: { t: number; o: { rsi: number; signal: number } }) => ({
                time: item.t, // Use timestamp in seconds
                value: item.o.rsi,
              }));
              chartData["signal"] = row.data.map(
                (item: { t: number; o: { rsi: number; signal: number } }) => ({
                  time: item.t, // Use timestamp in seconds
                  value: item.o.signal,
                })
              );
            } else if (row.metric_id === "liquidity_account") {
              chartData["liquidity"] = row.data.map((item: { t: number; v: number }) => ({
                time: item.t, // Use timestamp in seconds
                value: item.v,
              }));
            } else {
              chartData["price"] = row.data.map((item: { t: number; v: number }) => ({
                time: item.t, // Use timestamp in seconds
                value: item.v,
              }));
            }
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

      // Price on the right Y-axis
      const priceSeries = chart.addLineSeries({
        color: "white",
        lineWidth: 2,
        priceScaleId: "right", // Price on the right
      });

      // RSI, signal, and liquidity on the left Y-axis
      const rsiSeries = chart.addLineSeries({
        color: "red",
        lineWidth: 1,
        priceScaleId: "left", // RSI on the left
      });

      const signalSeries = chart.addLineSeries({
        color: "blue",
        lineWidth: 1,
        priceScaleId: "left", // Signal on the left
      });

      const liquiditySeries = chart.addHistogramSeries({
        color: "green",
        priceScaleId: "left", // Liquidity on the left
      });

      // Set data for each series
      priceSeries.setData((chartData.price as LineData[]) || []);
      rsiSeries.setData((chartData.rsi as LineData[]) || []);
      signalSeries.setData((chartData.signal as LineData[]) || []);
      liquiditySeries.setData((chartData.liquidity as HistogramData[]) || []);

      // Synchronize the Y-axis scaling by keeping the scales in sync
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

      // Subscribe to time range changes
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
