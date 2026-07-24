/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { RFIData } from '../types';

interface FileUploaderProps {
  onDataLoaded: (data: RFIData[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const processExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      const parsedData: RFIData[] = json.map((row: any) => {
        const convertDate = (val: any) => {
          if (!val) return new Date();
          if (typeof val === 'number') {
            return new Date((val - 25569) * 86400000);
          }
          return new Date(val);
        };

        return {
          질의ID: String(row['질의ID'] || ''),
          접수일: convertDate(row['접수일']),
          회신기한: convertDate(row['회신기한']),
          고객코드: String(row['고객코드'] || ''),
          국가: String(row['국가'] || ''),
          대상체계: String(row['대상체계'] || ''),
          질의유형: String(row['질의유형'] || ''),
          담당부서: String(row['담당부서'] || ''),
          처리상태: String(row['처리상태'] || ''),
          EL검토여부: String(row['EL검토여부'] || 'N'),
          보안등급: String(row['보안등급'] || ''),
          소요일수: Number(row['소요일수'] || 0),
          수정횟수: Number(row['수정횟수'] || 0),
        };
      });

      setFileName(file.name);
      onDataLoaded(parsedData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx'))) {
      processExcel(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processExcel(file);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400'}`}
      >
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {fileName ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="bg-green-100 p-3 rounded-full mb-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-slate-800 font-medium">{fileName}</p>
            <p className="text-slate-500 text-sm mt-1">파일이 성공적으로 로드되었습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="bg-slate-100 p-3 rounded-full mb-3">
              <Upload className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-700 font-medium">XLSX 파일을 드래그하거나 클릭하여 업로드</p>
            <p className="text-slate-500 text-sm mt-1">해외 RFI 주간 현황 엑셀 파일을 선택해주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};
