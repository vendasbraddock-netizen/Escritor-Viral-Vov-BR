
import React, { useState, useEffect, useRef } from 'react';
import { FileUpload } from './components/FileUpload';
import { QueueList } from './components/QueueList';
import { QueueItem, ProcessingStatus } from './types';
import { generateStoryPart } from './services/geminiService';
import { generateDocx, downloadBlob } from './services/docxService';
import { TOTAL_PARTS, SYSTEM_INSTRUCTION } from './constants';
import { Bot, Zap, Play, Download, FileText, X } from 'lucide-react';

const App: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const isProcessingRef = useRef(false);
  const previousStoriesContextRef = useRef<string[]>([]);

  const handleFilesSelected = async (files: File[]) => {
    const newItems: QueueItem[] = [];
    for (const file of files) {
      const text = await file.text();
      newItems.push({
        id: crypto.randomUUID(),
        fileName: file.name,
        themeContent: text,
        status: ProcessingStatus.PENDING,
        currentPart: 1,
        totalParts: TOTAL_PARTS,
        generatedParts: [],
      });
    }
    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleStartProcessing = () => {
    setQueue((prev) =>
      prev.map((item) =>
        item.status === ProcessingStatus.PENDING
          ? { ...item, status: ProcessingStatus.IDLE }
          : item
      )
    );
  };

  const handleDownload = async (item: QueueItem) => {
    if (!item.generatedParts.length) return;
    try {
      const docBlob = await generateDocx(item.generatedParts);
      const docName = item.fileName.replace('.txt', '') + '_Historia_Final.docx';
      downloadBlob(docBlob, docName);
    } catch (error) {
      console.error("Erro ao gerar DOCX:", error);
      alert("Erro ao gerar o arquivo DOCX.");
    }
  };

  useEffect(() => {
    const processNextItem = async () => {
      if (isProcessingRef.current) return;
      const nextItemIndex = queue.findIndex((item) => item.status === ProcessingStatus.IDLE);
      if (nextItemIndex === -1) return;

      isProcessingRef.current = true;
      setQueue((prev) =>
        prev.map((item, idx) =>
          idx === nextItemIndex ? { ...item, status: ProcessingStatus.PROCESSING } : item
        )
      );

      const item = queue[nextItemIndex];
      const currentParts = [...item.generatedParts];
      
      try {
        for (let part = 1; part <= TOTAL_PARTS; part++) {
          setQueue((prev) =>
            prev.map((qItem) =>
              qItem.id === item.id ? { ...qItem, currentPart: part } : qItem
            )
          );

          const generatedText = await generateStoryPart(
            item.themeContent,
            part,
            currentParts,
            previousStoriesContextRef.current
          );
          
          if (part === 1) {
             const snippet = generatedText.substring(0, 500);
             previousStoriesContextRef.current.push(snippet);
          }
          
          currentParts.push(generatedText);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        setQueue((prev) =>
          prev.map((qItem) =>
            qItem.id === item.id
              ? {
                  ...qItem,
                  status: ProcessingStatus.COMPLETED,
                  generatedParts: currentParts,
                  currentPart: TOTAL_PARTS,
                }
              : qItem
          )
        );

        // Automatic download
        const completedItem = {
          ...item,
          status: ProcessingStatus.COMPLETED,
          generatedParts: currentParts,
          currentPart: TOTAL_PARTS,
        };
        handleDownload(completedItem);
      } catch (err: any) {
        console.error("Erro no processamento:", err);
        let finalErrorMessage = "Erro desconhecido.";
        const rawError = err.message || JSON.stringify(err);

        if (rawError.includes("429") || rawError.includes("RESOURCE_EXHAUSTED")) {
          finalErrorMessage = "⚠️ Limite de Cota Atingido. Aguarde alguns minutos.";
        } else if (rawError.includes("SAFETY")) {
          finalErrorMessage = "⚠️ Bloqueio de Segurança. O tema pode ser sensível demais.";
        } else {
          finalErrorMessage = "Erro na API. Verifique o console.";
        }
        
        setQueue((prev) =>
          prev.map((qItem) =>
            qItem.id === item.id
              ? { ...qItem, status: ProcessingStatus.ERROR, errorMessage: finalErrorMessage }
              : qItem
          )
        );
      } finally {
        isProcessingRef.current = false;
      }
    };

    processNextItem();
  }, [queue]); 

  const pendingCount = queue.filter(i => i.status === ProcessingStatus.PENDING).length;
  const isProcessing = queue.some(i => i.status === ProcessingStatus.PROCESSING);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30 font-sans relative">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-800 pb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 ring-1 ring-white/10">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
                Vovó Power AI <span className="text-sm font-normal text-emerald-400 ml-2">(BR)</span>
              </h1>
              <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-1">
                Escritor de Histórias Virais <span className="text-slate-600">|</span> Gemini 3 Pro 
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button
              onClick={() => setIsPromptOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all border border-slate-700"
            >
              <FileText className="w-5 h-5" />
              <span>Ver Prompt Mestre</span>
            </button>

            {pendingCount > 0 && (
              <button
                onClick={handleStartProcessing}
                disabled={isProcessing}
                className="group flex items-center gap-3 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-lg"
              >
                {isProcessing ? <Zap className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5 fill-current" />}
                <span>
                  {isProcessing ? 'Escrevendo...' : `Iniciar Histórias (${pendingCount})`}
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-8">
              <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <span className="bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center text-xs text-slate-400 border border-slate-700">1</span>
                Enviar Temas (.txt)
              </h2>
              <FileUpload onFilesSelected={handleFilesSelected} />
            </div>
          </div>

          <div className="lg:col-span-2">
             <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <span className="bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center text-xs text-slate-400 border border-slate-700">2</span>
                Fila de Produção
              </h2>
             <QueueList queue={queue} onDownload={handleDownload} />
          </div>
        </div>
      </div>

      {isPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">Configuração do Escritor (BR)</h3>
              <button onClick={() => setIsPromptOpen(false)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap bg-slate-950/50 p-6 rounded-xl border border-slate-800/50">
                {SYSTEM_INSTRUCTION}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
