import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { asset, metrics } = req.query;

  const metricsArray = Array.isArray(metrics) ? metrics : [metrics];

  try {
    const result = await pool.query(
      `SELECT v.data, v.metric_id
       FROM charts.values v
       JOIN charts.metrics m ON v.metric_id = m.metric_id
       WHERE v.asset = $1 AND m.metric_id = ANY($2::text[])`,
      [asset, metricsArray]
    );

    console.log("Fetched Chart Data:", result.rows);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
}
