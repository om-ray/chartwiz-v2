import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { asset } = req.query;

  try {
    const result = await pool.query(
      `SELECT DISTINCT m.metric_id, m.metric_name
       FROM charts.metrics m
       JOIN charts.values v ON m.metric_id = v.metric_id
       WHERE v.asset = $1`,
      [asset]
    );

    console.log("Metrics for Asset:", result.rows);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
}
