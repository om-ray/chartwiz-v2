import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

type Asset = {
  id: number;
  name: string;
  name_id: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await pool.query("SELECT id, name, name_id FROM charts.assets");
    const assets: Asset[] = result.rows;
    res.status(200).json(assets);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
}
