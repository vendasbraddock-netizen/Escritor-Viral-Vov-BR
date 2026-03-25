
import React from 'react';
import { QueueItem, ProcessingStatus } from '../types';
import { FileText, CheckCircle, AlertCircle, Loader, Clock, Download, PlayCircle } from 'lucide-react';

interface QueueListProps {
  queue: QueueItem[];
  onDownload: (item: QueueItem) => void;
}

export const QueueList: React.FC<QueueListProps> = ({ queue, onDownload }) => {
  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/20 text-slate-500">
        <FileText className="w-10 h-10 mb-3 opacity-50" />
        <p>A fila está vazia.</p>
        <p className="text-sm">Envie arquivos para começar a criar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {queue.map((item) => (
        <div
          key={item.id}
          className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-300 group ${
            item.status === ProcessingStatus.PROCESSING
              ? 'bg-slate-800/90 border-emerald-500/50 shadow-lg'
              : item.status === ProcessingStatus.COMPLETED
              ? 'bg-slate-900/40 border-emerald-500/30'
              : item.status === ProcessingStatus.ERROR
              ? 'bg-red-950/10 border-red-500/30'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          {item.status === ProcessingStatus.PROCESSING && (
             <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
               <div 
                 className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700" 
                 style={{ width: `${((item.currentPart - 1 + 0.1) / item.totalParts) * 100}%` }}
               />
             </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className={`p-3 rounded-xl shrink-0 ${
                item.status === ProcessingStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-400' :
                item.status === ProcessingStatus.PROCESSING ? 'bg-emerald-500/10 text-emerald-400' :
                item.status === ProcessingStatus.ERROR ? 'bg-red-500/10 text-red-400' :
                'bg-slate-800 text-slate-400'
              }`}>
                {item.status === ProcessingStatus.COMPLETED && <CheckCircle className="w-6 h-6" />}
                {item.status === ProcessingStatus.PROCESSING && <Loader className="w-6 h-6 animate-spin" />}
                {item.status === ProcessingStatus.ERROR && <AlertCircle className="w-6 h-6" />}
                {item.status === ProcessingStatus.IDLE && <Clock className="w-6 h-6" />}
                {item.status === ProcessingStatus.PENDING && <PlayCircle className="w-6 h-6" />}
              </div>
              
              <div className="min-w-0">
                <h4 className="font-medium text-slate-200 truncate text-lg">
                  {item.fileName}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {item.status === ProcessingStatus.PROCESSING && (
                     <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                       Escrevendo Capítulo {item.currentPart}/{item.totalParts}
                     </span>
                  )}
                  {item.status === ProcessingStatus.COMPLETED && <span className="text-xs text-emerald-400">Pronto para download</span>}
                  {item.status === ProcessingStatus.PENDING && <span className="text-xs text-slate-500">Aguardando início...</span>}
                  {item.status === ProcessingStatus.IDLE && <span className="text-xs text-amber-400">Na fila</span>}
                  {item.status === ProcessingStatus.ERROR && <span className="text-xs text-red-400">{item.errorMessage}</span>}
                </div>
              </div>
            </div>
            
            <div className="flex items-center shrink-0">
               {item.status === ProcessingStatus.COMPLETED && (
                  <button
                    onClick={() => onDownload(item)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    Baixar DOCX
                  </button>
               )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
