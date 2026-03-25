
import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFilesSelected(Array.from(e.dataTransfer.files));
      }
    },
    [onFilesSelected]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div
      className="w-full p-8 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-900/30 hover:bg-slate-800/50 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center group"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input
        type="file"
        id="file-upload"
        multiple
        accept=".txt"
        className="hidden"
        onChange={handleChange}
      />
      <div className="p-4 rounded-full bg-slate-800 group-hover:bg-emerald-500/20 transition-colors mb-4 ring-1 ring-white/5 group-hover:ring-emerald-500/30">
        <Upload className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2 text-center">
        Clique ou Arraste Temas
      </h3>
      <p className="text-slate-400 text-center text-sm max-w-[200px] leading-relaxed">
        Selecione múltiplos arquivos <code>.txt</code> para processar.
      </p>
    </div>
  );
};
