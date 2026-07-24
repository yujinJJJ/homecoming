/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, Copy, Printer, Loader2, CheckCircle2 } from 'lucide-react';

interface WeeklyReportProps {
  reportMarkdown: string | null;
  loading: boolean;
  onGenerate: () => void;
  startDate?: string;
  endDate?: string;
}

export const WeeklyReport: React.FC<WeeklyReportProps> = ({ 
  reportMarkdown, 
  loading, 
  onGenerate,
  startDate,
  endDate
}) => {
  const [copied, setCopied] = useState(false);

  const convertMarkdownToHtml = (markdown: string) => {
    const lines = markdown.split('\n');
    let html = '';
    let inTable = false;
    let tableRows: string[][] = [];

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      // Table detection
      if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
        if (trimmedLine.includes('---')) {
          // Skip the separator row
          return;
        }
        
        const cells = trimmedLine
          .split('|')
          .filter(c => c !== '')
          .map(c => c.trim().replace(/\*\*/g, '')); // Remove bold markdown for simplicity
        
        if (!inTable) {
          inTable = true;
          tableRows = [cells];
        } else {
          tableRows.push(cells);
        }
      } else {
        if (inTable) {
          // Close the table
          html += renderHtmlTable(tableRows);
          inTable = false;
          tableRows = [];
        }
        
        if (trimmedLine.startsWith('###')) {
          html += `<h3 style="font-size: 1.125rem; font-weight: 700; color: #1e293b; margin-top: 1.5rem; margin-bottom: 0.75rem;">${trimmedLine.replace('###', '').trim()}</h3>`;
        } else if (trimmedLine.startsWith('##')) {
          html += `<h2 style="font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem;">${trimmedLine.replace('##', '').trim()}</h2>`;
        } else if (trimmedLine.startsWith('#')) {
          html += `<h1 style="font-size: 1.5rem; font-weight: 800; color: #1e293b; text-align: center; margin-bottom: 2rem;">${trimmedLine.replace('#', '').trim()}</h1>`;
        } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
          html += `<li style="margin-bottom: 0.5rem; color: #475569; margin-left: 1.5rem;">${trimmedLine.substring(1).trim()}</li>`;
        } else if (trimmedLine !== '') {
          html += `<p style="margin-bottom: 1rem; color: #475569; line-height: 1.6;">${trimmedLine}</p>`;
        }
      }
    });

    if (inTable) {
      html += renderHtmlTable(tableRows);
    }

    return html;
  };

  const renderHtmlTable = (rows: string[][]) => {
    if (rows.length === 0) return '';
    const headers = rows[0];
    const dataRows = rows.slice(1);

    let tableHtml = `<div style="overflow-x: auto; margin-bottom: 1.5rem;">
      <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e2e8f0; font-size: 0.875rem;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            ${headers.map(h => `<th style="border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-weight: 700; color: #334155;">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${dataRows.map(row => `
            <tr>
              ${row.map(cell => `<td style="border: 1px solid #e2e8f0; padding: 10px; color: #475569;">${cell}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
    return tableHtml;
  };

  const handleCopy = () => {
    if (!reportMarkdown) return;
    
    const plainText = reportMarkdown.replace(/[#*|]/g, '');
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(reportMarkdown).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = reportMarkdown;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Copy failed', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handlePrint = () => {
    if (!reportMarkdown) return;
    
    const htmlContent = convertMarkdownToHtml(reportMarkdown);
    const dateStr = new Date().toLocaleDateString('ko-KR');
    
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>RFI 주간 보고서</title>
        <style>
          body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; padding: 40px; background-color: #f8fafc; color: #1e293b; max-width: 800px; margin: 0 auto; }
          .report-container { background: white; padding: 50px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-radius: 8px; }
          .print-btn { background: #3e7cb1; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-bottom: 20px; }
          @media print { .print-btn { display: none; } body { padding: 0; background: white; } .report-container { box-shadow: none; padding: 0; } }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
          th { background-color: #f1f5f9; }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">보고서 인쇄 / PDF 저장</button>
        <div class="report-container">
          <div style="text-align: right; font-size: 0.8rem; color: #64748b; margin-bottom: 20px;">
            분석 기간: ${startDate || '-'} ~ ${endDate || '-'} | 작성일: ${dateStr}
          </div>
          ${htmlContent}
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm mt-8">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-800">주간 업무 보고서 생성</h3>
        </div>
        <div className="flex items-center gap-2">
          {reportMarkdown && (
            <>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? '복사됨' : '복사'}
              </button>
              <button 
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                인쇄/PDF
              </button>
            </>
          )}
          {!reportMarkdown && !loading && (
            <button 
              onClick={onGenerate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              보고서 생성하기
            </button>
          )}
        </div>
      </div>

      <div className="p-8 min-h-[200px] flex flex-col items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">데이터 요약 및 보고서 작성 중...</p>
            <p className="text-slate-400 text-sm mt-1">잠시만 기다려주세요.</p>
          </div>
        ) : reportMarkdown ? (
          <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="text-right text-xs text-slate-400 mb-6 pb-2 border-b border-slate-50">
              분석 기간: {startDate || '-'} ~ {endDate || '-'} | 작성일: {new Date().toLocaleDateString('ko-KR')}
            </div>
            <div 
              className="report-content"
              dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(reportMarkdown) }} 
            />
          </div>
        ) : (
          <div className="text-center opacity-40">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">생성된 보고서가 없습니다.</p>
            <p className="text-slate-400 text-sm">보고서 생성 버튼을 클릭하여 작성을 시작하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};
