import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

interface DropzoneProps {
  onFileDrop: (file: File) => void;
}

export function Dropzone({ onFileDrop }: DropzoneProps) {
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileDrop(e.dataTransfer.files[0]);
    }
  }, [onFileDrop]);

  const onFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileDrop(e.target.files[0]);
    }
  }, [onFileDrop]);

  return (
    <div 
      className="p-10 border-2 border-dashed border-neon-purple rounded-xl flex flex-col items-center justify-center transition-all duration-300 hover:shadow-neon hover:bg-[#A100FF]/10 cursor-pointer text-center group bg-[#050505]"
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input 
        id="file-upload" 
        type="file" 
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
        className="hidden" 
        onChange={onFileInputChange} 
      />
      <UploadCloud className="w-16 h-16 text-neon-purple mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(161,0,255,0.6)] group-hover:drop-shadow-[0_0_15px_rgba(161,0,255,1)]" />
      <h3 className="text-xl font-semibold mb-2 text-white drop-shadow-[0_0_5px_rgba(161,0,255,0.3)]">Drop your Excel/CSV file here</h3>
      <p className="text-gray-400 text-sm">Or click to browse files</p>
    </div>
  );
}
