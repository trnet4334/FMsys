'use client';

import { Download, FileSpreadsheet, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Props = { onClose: () => void };

export function ImportTransactionModal({ onClose }: Props) {
  const [dragging, setDragging]   = useState(false);
  const [file,     setFile]       = useState<File | null>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (picked) setFile(picked);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-card border-t md:border border-line md:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="px-6 h-16 flex items-center justify-between border-b border-line shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose}
              className="size-9 flex items-center justify-center rounded-full text-ink-1 hover:text-ink-0 hover:bg-bg-1 transition-colors">
              <X size={17} />
            </button>
            <h2 className="font-bold text-ink-0 text-lg">Import Transactions</h2>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed py-12 cursor-pointer transition-all ${
              dragging
                ? 'border-brand bg-brand/5 scale-[1.01]'
                : file
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-line bg-bg-1 hover:border-brand/40 hover:bg-brand/5'
            }`}
          >
            <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />

            {file ? (
              <>
                <div className="size-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <FileSpreadsheet size={26} className="text-emerald-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-ink-0">{file.name}</p>
                  <p className="text-xs text-ink-disabled mt-1">{(file.size / 1024).toFixed(1)} KB — click to replace</p>
                </div>
              </>
            ) : (
              <>
                <div className={`size-14 rounded-2xl border flex items-center justify-center transition-colors ${
                  dragging ? 'bg-brand/10 border-brand/30' : 'bg-bg-0 border-line'
                }`}>
                  <Upload size={24} className={dragging ? 'text-brand' : 'text-ink-disabled'} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-ink-0">Drop your file here</p>
                  <p className="text-xs text-ink-disabled mt-1">or <span className="text-brand font-bold">browse</span> to upload</p>
                  <p className="text-[10px] text-ink-disabled mt-2 uppercase tracking-widest font-bold">CSV · XLSX · XLS</p>
                </div>
              </>
            )}
          </div>

          {/* Format guide */}
          <div className="bg-bg-1 border border-line rounded-xl p-5 space-y-3">
            <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Required Columns</p>
            <div className="grid grid-cols-2 gap-2">
              {['Date', 'Description', 'Amount', 'Category', 'Method', 'Type'].map((col) => (
                <div key={col} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-brand shrink-0" />
                  <span className="text-xs font-medium text-ink-1">{col}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Template download */}
          <button type="button"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-bg-1 border border-line rounded-xl text-sm font-bold text-ink-1 hover:text-ink-0 hover:bg-card transition-colors">
            <Download size={15} />
            Download CSV Template
          </button>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-line bg-bg-1/50 flex flex-col-reverse md:flex-row gap-3 justify-end shrink-0">
          <button type="button" onClick={onClose}
            className="w-full md:w-auto px-6 py-3 bg-bg-1 text-ink-0 font-bold rounded-xl border border-line hover:bg-card transition-all text-sm">
            Cancel
          </button>
          <button type="button" disabled={!file}
            className="w-full md:w-auto px-8 py-3 bg-brand text-white font-black rounded-xl shadow-soft hover:opacity-90 active:scale-[0.98] transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100">
            Import Transactions
          </button>
        </div>

      </div>
    </div>
  );
}
