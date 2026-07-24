/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API routes
  app.post("/api/analyze", async (req, res) => {
    try {
      const { data, filterContext } = req.body;
      if (!data || !Array.isArray(data)) {
        return res.status(400).json({ error: "Invalid data format" });
      }

      // Limit data to first 100 rows
      const summaryData = data.slice(0, 100).map(row => ({
        ID: row.질의ID,
        Date: row.접수일,
        Country: row.국가,
        System: row.대상체계,
        Type: row.질의유형,
        Status: row.처리상태,
        LeadTime: row.소요일수,
        Dept: row.담당부서
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are an expert business analyst for an overseas defense/technology project. 
Analyze the following RFI (Request for Information) status data and provide insights in Korean.

${filterContext ? `Current Filter Context: ${filterContext}` : ''}

Data Summary:
${JSON.stringify(summaryData, null, 2)}

Please provide:
1. 3 key features of the current (filtered) status.
2. Notable numbers or patterns specific to this condition (e.g., bottlenecks, concentration, risks).
3. A one-line summary emphasizing the core takeaway.

Respond ONLY in JSON format following this structure:
{
  "keyFeatures": ["feature 1", "feature 2", "feature 3"],
  "notablePatterns": ["pattern 1", "pattern 2", ...],
  "oneLineSummary": "one line summary"
}`
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              keyFeatures: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              notablePatterns: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              oneLineSummary: { type: Type.STRING }
            },
            required: ["keyFeatures", "notablePatterns", "oneLineSummary"]
          }
        }
      });

      const insights = JSON.parse(response.text || "{}");
      res.json(insights);
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      res.status(500).json({ error: "Failed to analyze data" });
    }
  });

  app.post("/api/report", async (req, res) => {
    try {
      const { data, filterContext } = req.body;
      if (!data || !Array.isArray(data)) {
        return res.status(400).json({ error: "Invalid data format" });
      }

      const summaryData = data.slice(0, 150).map(row => ({
        ID: row.질의ID,
        Date: row.접수일,
        Country: row.국가,
        System: row.대상체계,
        Type: row.질의유형,
        Status: row.처리상태,
        LeadTime: row.소요일수,
        Dept: row.담당부서,
        EL: row.EL검토여부
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are a senior business analyst for an international defense trade organization. 
Generate a comprehensive Weekly RFI Status Report in Korean based on the provided data.

Filter Context: ${filterContext || '전체 현황'}
Data: ${JSON.stringify(summaryData)}

The report MUST be in Markdown format, specifically using Markdown tables for data representation.
Structure:
1. Title: "주간 RFI 대응 현황 보고서"
2. Section 1: 핵심 지표 요약 (Table with 4 columns: 지표명, 수치, 상태, 비고)
3. Section 2: 국가별 질의 분석 (Table with Rank, Country, Count, Share%, AI Insight) - Top 3 countries.
4. Section 3: 처리 현황 및 지연 분석 (Brief text analysis of completion rate and lead times).
5. Section 4: 대상체계별 TOP 5 (Table with Rank, System, Count, Share%).
6. Section 5: EL 및 보안 검토 현황 (Brief text about EL review status).
7. Section 6: 데이터 기반 개선 제안 (2-3 items).
8. Section 7: 종합 소견 (2-3 concluding sentences).

Ensure all tables use standard Markdown table syntax (| Col | Col |).
Avoid using bold markdown inside table cells if possible for easier parsing, or handle it correctly.
Use a professional, formal business tone.`
              }
            ]
          }
        ]
      });

      res.json({ report: response.text });
    } catch (error) {
      console.error("Gemini Report Error:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
