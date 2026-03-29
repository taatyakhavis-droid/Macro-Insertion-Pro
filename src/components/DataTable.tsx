import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export interface ParsedRow {
  originalIndex: number;
  original: Record<string, any>;
  placementName: string;
  adName: string;
  cleanedImpression: string;
  isImpressionDoubtful: boolean;
  cleanedLandingPage: string;
  isLandingPageDoubtful: boolean;
}

interface DataTableProps {
  data: ParsedRow[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="shrink-0 ml-2 inline-flex items-center justify-center text-gray-500 hover:text-neon-purple focus:outline-none transition-colors p-1 rounded hover:bg-neon-purple/10"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export function DataTable({ data }: DataTableProps) {
  if (data.length === 0) return null;
  
  return (
    <div className="overflow-x-auto w-full border border-neon-purple/30 rounded-lg shadow-[0_0_15px_rgba(161,0,255,0.15)] bg-[#0A0A0A]">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-[#A100FF]/20 text-[#A100FF] uppercase font-semibold text-xs tracking-wider">
          <tr>
            <th className="px-6 py-4 border-b border-neon-purple/30">Ad Name</th>
            <th className="px-6 py-4 border-b border-neon-purple/30">Placement Name</th>
            <th className="px-6 py-4 border-b border-neon-purple/30 min-w-[300px]">Original Content</th>
            <th className="px-6 py-4 border-b border-neon-purple/30 min-w-[200px]">Cleaned Impression</th>
            <th className="px-6 py-4 border-b border-neon-purple/30 min-w-[200px]">Cleaned Landing Page</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neon-purple/10">
          {data.map((row) => {
             let snippet = "N/A";
             for (const val of Object.values(row.original)) {
               if (typeof val === 'string' && (val.trim().toUpperCase().startsWith('<IMG') || val.includes('trackclk'))) {
                 snippet = val;
                 break;
               }
             }

             return (
              <tr key={row.originalIndex} className="hover:bg-neon-purple/5 transition-colors duration-200">
                <td className="px-6 py-4 text-gray-300 max-w-[200px] break-words">{row.adName || <span className="text-gray-600">-</span>}</td>
                <td className="px-6 py-4 text-gray-300 max-w-[200px] break-words">{row.placementName || <span className="text-gray-600">-</span>}</td>
                <td className="px-6 py-4 text-gray-400 font-mono text-xs max-w-sm break-all whitespace-pre-wrap">{snippet}</td>
                <td className={`px-6 py-4 font-mono text-xs max-w-sm break-all ${row.isImpressionDoubtful ? 'text-red-500 font-bold shadow-[0_0_10px_rgba(255,0,0,0.2)]' : 'text-gray-300'}`} title={row.cleanedImpression}>
                  {row.cleanedImpression ? (
                    <div className="flex items-start justify-between gap-2">
                      <span>{row.cleanedImpression}{row.isImpressionDoubtful && " (Review)"}</span>
                      <CopyButton text={row.cleanedImpression} />
                    </div>
                  ) : <span className="text-gray-600">-</span>}
                </td>
                <td className={`px-6 py-4 font-mono text-xs max-w-sm break-all ${row.isLandingPageDoubtful ? 'text-red-500 font-bold' : 'text-gray-300'}`} title={row.cleanedLandingPage}>
                  {row.cleanedLandingPage ? (
                    <div className="flex items-start justify-between gap-2">
                       <span>{row.cleanedLandingPage}</span>
                       <CopyButton text={row.cleanedLandingPage} />
                    </div>
                  ) : <span className="text-gray-600">-</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
