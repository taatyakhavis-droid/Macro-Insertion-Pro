import { useState, useEffect } from 'react';
import * as xlsx from 'xlsx';
import { Download, ChevronRight, Copy, Check, X } from 'lucide-react';
import { Dropzone } from './components/Dropzone';
import { DataTable, ParsedRow } from './components/DataTable';
import { processImpressionTag, processLandingPageUrl } from './utils/tagProcessor';

function App() {
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [exportedData, setExportedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [singleTagInput, setSingleTagInput] = useState<string>("");
  const [singleTagOutput, setSingleTagOutput] = useState<string>("");
  const [singleTagDoubtful, setSingleTagDoubtful] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!singleTagInput.trim()) {
      setSingleTagOutput("");
      setSingleTagDoubtful(false);
      return;
    }

    const value = singleTagInput.trim();
    if (value.toUpperCase().startsWith('<IMG')) {
      const res = processImpressionTag(value);
      setSingleTagOutput(res.cleaned);
      setSingleTagDoubtful(res.isDoubtful);
    } else if (value.includes('trackclk')) {
      const res = processLandingPageUrl(value);
      setSingleTagOutput(res.cleaned);
      setSingleTagDoubtful(res.isDoubtful);
    } else {
      setSingleTagOutput("Unrecognized tag format. Please paste a valid <IMG or trackclk tag.");
      setSingleTagDoubtful(true);
    }
  }, [singleTagInput]);

  const handleCopy = () => {
    if (!singleTagOutput || singleTagOutput.includes('Unrecognized')) return;
    navigator.clipboard.writeText(singleTagOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileDrop = async (file: File) => {
    try {
      setError(null);
      const data = await file.arrayBuffer();
      const workbook = xlsx.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = xlsx.utils.sheet_to_json(worksheet) as Record<string, any>[];

      // Dynamically map the placement and ad name columns. Excel files from ad platforms often have multiple metadata rows 
      // before the actual table headers. This finds the internal keys pointing to the required columns.
      let placementKey: string | null = null;
      let adNameKey: string | null = null;
      
      if (json.length > 0) {
        for (const k of Object.keys(json[0])) {
          const lowerK = k.toLowerCase();
          if (lowerK.includes('placement')) {
            placementKey = k;
          }
          if (lowerK.includes('ad name') || lowerK === 'ad') {
            adNameKey = k;
          }
        }
      }
      if (!placementKey || !adNameKey) {
        for (const row of json) {
          for (const [k, v] of Object.entries(row)) {
            if (typeof v === 'string') {
              const lowerV = v.toLowerCase().trim();
              if (!placementKey && lowerV.includes('placement')) {
                placementKey = k;
              }
              if (!adNameKey && (lowerV.includes('ad name') || lowerV === 'ad')) {
                adNameKey = k;
              }
            }
          }
          if (placementKey && adNameKey) break;
        }
      }

      const processedRows: ParsedRow[] = [];
      const exportReadyRows: any[] = [];

      json.forEach((row, index) => {
        let cleanedImp = "";
        let isImpDoubtful = false;
        let cleanedLp = "";
        let isLpDoubtful = false;
        let placementName = placementKey && row[placementKey] !== undefined ? String(row[placementKey]) : "";
        let adName = adNameKey && row[adNameKey] !== undefined ? String(row[adNameKey]) : "";

        // Search through cells for tags
        for (const value of Object.values(row)) {
          if (typeof value === 'string') {
            if (value.trim().toUpperCase().startsWith('<IMG')) {
              const res = processImpressionTag(value);
              cleanedImp = res.cleaned;
              isImpDoubtful = res.isDoubtful;
            } else if (value.includes('trackclk')) {
              const res = processLandingPageUrl(value);
              cleanedLp = res.cleaned;
              isLpDoubtful = res.isDoubtful;
            }
          }
        }

        if (cleanedImp || cleanedLp) {
          processedRows.push({
            originalIndex: index,
            original: row,
            placementName: placementName,
            adName: adName,
            cleanedImpression: cleanedImp,
            isImpressionDoubtful: isImpDoubtful,
            cleanedLandingPage: cleanedLp,
            isLandingPageDoubtful: isLpDoubtful
          });
        }

        // Add to export row
        exportReadyRows.push({
          ...row,
          "Cleaned_Impression": cleanedImp,
          "Cleaned_LandingPage": cleanedLp
        });
      });

      setParsedData(processedRows);
      setExportedData(exportReadyRows);
    } catch (err: any) {
      setError(err.message || 'Failed to parse file');
    }
  };

  const exportData = () => {
    if (exportedData.length === 0) return;
    const ws = xlsx.utils.json_to_sheet(exportedData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Cleaned Data");
    xlsx.writeFile(wb, "TagMaster_Cleaned.xlsx");
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#A100FF]/30 p-8 flex flex-col items-center relative overflow-hidden">
      {/* Background glow ambiance */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#A100FF]/10 blur-[100px] pointer-events-none rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#A100FF]/10 blur-[100px] pointer-events-none rounded-full"></div>

      <header className="mb-12 text-center z-10">
        <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3 drop-shadow-[0_0_15px_rgba(161,0,255,0.4)]">
          <ChevronRight className="text-neon-purple w-12 h-12 stroke-[3]" /> TagMaster <span className="text-neon-purple font-light">SaaS</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          High-performance tracking tag pre-processor.
        </p>
      </header>

      <main className="w-full max-w-6xl z-10 flex flex-col items-center">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6 w-full max-w-2xl text-center">
            {error}
          </div>
        )}

        <div className="w-full max-w-4xl mb-8">
          <Dropzone onFileDrop={handleFileDrop} />
        </div>

        {/* Single Tag Processor Section */}
        <div className="w-full max-w-4xl mb-12 p-6 border border-neon-purple/30 rounded-xl bg-[#0A0A0A] shadow-[0_0_15px_rgba(161,0,255,0.1)] transition-all focus-within:shadow-[0_0_20px_rgba(161,0,255,0.3)]">
          <h2 className="text-xl font-semibold mb-6 text-white drop-shadow-[0_0_5px_rgba(161,0,255,0.3)] flex items-center gap-2">
            <ChevronRight className="w-5 h-5 text-neon-purple stroke-[3]" /> Single Tag Processor
          </h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative flex-1">
              <textarea 
                value={singleTagInput}
                onChange={(e) => setSingleTagInput(e.target.value)}
                placeholder="Paste a single <IMG...> or trackclk URL here..."
                className="w-full h-40 bg-black border border-gray-800 rounded-lg p-4 text-gray-300 focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all resize-none font-mono text-sm leading-relaxed pr-10"
              />
              {singleTagInput && (
                <button
                  onClick={() => setSingleTagInput('')}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-400 p-1.5 rounded-md hover:bg-white/5 transition-colors focus:outline-none"
                  title="Clear input"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {singleTagOutput ? (
              <div className="flex-1 p-5 bg-black/60 border border-neon-purple/50 rounded-lg animate-in fade-in duration-300 relative group overflow-y-auto max-h-40">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-neon-purple uppercase font-semibold tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-neon-purple animate-pulse"></span>
                    Cleaned Output
                  </span>
                  {!singleTagOutput.includes('Unrecognized') && (
                    <button 
                      onClick={handleCopy}
                      className="text-gray-400 hover:text-neon-purple transition-colors p-1.5 rounded-md hover:bg-neon-purple/10 active:scale-95 focus:outline-none focus:ring-1 focus:ring-neon-purple"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                <p className={`font-mono text-sm break-all pr-2 ${singleTagDoubtful && !singleTagOutput.includes('Unrecognized') ? 'text-red-500 font-bold shadow-[0_0_10px_rgba(255,0,0,0.2)]' : (singleTagOutput.includes('Unrecognized') ? 'text-yellow-500' : 'text-gray-200')}`}>
                  {singleTagOutput}
                </p>
              </div>
            ) : (
              <div className="flex-1 hidden md:flex p-5 bg-black/20 border border-gray-800 border-dashed rounded-lg items-center justify-center text-gray-600 font-mono text-sm text-center">
                Output will generate here...
              </div>
            )}
          </div>
        </div>

        {parsedData.length > 0 && (
          <div className="w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white drop-shadow-[0_0_5px_rgba(161,0,255,0.4)]">
                Processed <span className="text-neon-purple">{parsedData.length}</span> Tags
              </h2>
              <button
                onClick={exportData}
                className="flex items-center gap-2 bg-[#A100FF] hover:bg-[#A100FF]/80 text-white px-6 py-3 rounded-md font-semibold transition-all shadow-[0_0_15px_rgba(161,0,255,0.5)] hover:shadow-[0_0_25px_rgba(161,0,255,0.8)]"
              >
                <Download className="w-5 h-5" /> Export Cleaned File
              </button>
            </div>

            <DataTable data={parsedData} />

            <p className="mt-4 text-sm text-gray-500 text-center">
              Rows highlighted in <span className="text-red-500 font-bold">RED</span> require manual verification.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
