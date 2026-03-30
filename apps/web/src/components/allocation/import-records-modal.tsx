'use client';

import { AlertCircle, CheckCircle2, FileSpreadsheet, Info, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ImportState = 'idle' | 'selected' | 'success' | 'error';

type Props = { onClose: () => void };

const ACCEPTED = '.csv,.xlsx,.xls';

const FIELD_SPEC = [
  { col: 'date',      required: true,  format: 'YYYY-MM-DD',                          example: '2025-03-18' },
  { col: 'name',      required: true,  format: 'Text',                                example: 'NVDA' },
  { col: 'subName',   required: false, format: 'Text',                                example: 'NVIDIA Corp.' },
  { col: 'type',      required: true,  format: 'Stock | Crypto | Forex | Options',    example: 'Stock' },
  { col: 'status',    required: true,  format: 'closed | ongoing',                    example: 'closed' },
  { col: 'return',    required: false, format: 'Number (TWD) — omit if ongoing',      example: '680' },
  { col: 'returnPct', required: false, format: 'Decimal — omit if ongoing',           example: '0.057' },
];

export function ImportRecordsModal({ onClose }: Props) {
  const inputRef               = useRef<HTMLInputElement>(null);
  const dropRef                = useRef<HTMLDivElement>(null);
  const [state, setState]      = useState<ImportState>('idle');
  const [file,  setFile]       = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleFile(f: File) {
    setFile(f);
    setState('selected');
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function handleImport() {
    // Simulate import — no real processing in this iteration
    setState('success');
  }

  function reset() {
    setState('idle');
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-card border-t md:border border-line md:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="px-6 h-14 flex items-center gap-3 border-b border-line shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-lg text-ink-1 hover:text-ink-0 hover:bg-bg-1 transition-colors"
          >
            <X size={15} />
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-ink-0">Import Records</h2>
            <p className="text-[10px] text-ink-disabled">Supported: CSV, XLSX, XLS</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4 overflow-y-auto overscroll-contain">

          {state === 'success' ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="size-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink-0">Import successful</p>
                <p className="text-xs text-ink-disabled mt-1">{file?.name} has been processed</p>
              </div>
              <button
                type="button"
                onClick={reset}
                className="mt-2 text-xs font-bold text-brand hover:underline"
              >
                Import another file
              </button>
            </div>

          ) : state === 'error' ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="size-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <AlertCircle size={28} className="text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink-0">Import failed</p>
                <p className="text-xs text-ink-disabled mt-1">Please check your file format and try again.</p>
              </div>
              <button
                type="button"
                onClick={reset}
                className="mt-2 text-xs font-bold text-brand hover:underline"
              >
                Try again
              </button>
            </div>

          ) : (
            <>
              {/* Drop zone */}
              <div
                ref={dropRef}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 px-6 text-center cursor-pointer transition-colors ${
                  dragging
                    ? 'border-brand bg-brand/5'
                    : 'border-line hover:border-brand/50 hover:bg-bg-1'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED}
                  className="sr-only"
                  onChange={handleInputChange}
                />
                <div className="size-12 rounded-xl bg-brand-weak border border-brand/20 flex items-center justify-center">
                  {state === 'selected'
                    ? <FileSpreadsheet size={22} className="text-brand" />
                    : <Upload size={22} className="text-brand" />
                  }
                </div>
                {state === 'selected' && file ? (
                  <div>
                    <p className="text-sm font-bold text-ink-0 truncate max-w-[220px]">{file.name}</p>
                    <p className="text-xs text-ink-disabled mt-0.5">{fmtSize(file.size)} · Click to change</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-ink-0">Drop file here or click to browse</p>
                    <p className="text-xs text-ink-disabled mt-1">CSV, XLSX, or XLS · Max 10 MB</p>
                  </div>
                )}
              </div>

              {/* Column spec */}
              <div className="rounded-xl border border-line overflow-hidden">
                <div className="px-4 py-2.5 bg-bg-1 border-b border-line flex items-center gap-2">
                  <Info size={13} className="text-ink-disabled shrink-0" />
                  <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-widest">Required column format</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-line bg-bg-0/40">
                        <th className="px-3 py-2 font-bold text-ink-disabled uppercase tracking-wider">Column</th>
                        <th className="px-3 py-2 font-bold text-ink-disabled uppercase tracking-wider">Required</th>
                        <th className="px-3 py-2 font-bold text-ink-disabled uppercase tracking-wider">Format / Allowed values</th>
                        <th className="px-3 py-2 font-bold text-ink-disabled uppercase tracking-wider">Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {FIELD_SPEC.map(({ col, required, format, example }) => (
                        <tr key={col} className="hover:bg-bg-1/50 transition-colors">
                          <td className="px-3 py-2.5 font-mono font-bold text-brand">{col}</td>
                          <td className="px-3 py-2.5">
                            {required
                              ? <span className="px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-bold">Yes</span>
                              : <span className="px-1.5 py-0.5 rounded-full bg-bg-1 text-ink-disabled font-bold">No</span>
                            }
                          </td>
                          <td className="px-3 py-2.5 text-ink-1 leading-snug">{format}</td>
                          <td className="px-3 py-2.5 font-mono text-ink-disabled">{example}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Template hint */}
              <p className="text-[11px] text-ink-disabled text-center">
                Need a template?{' '}
                <button type="button" className="text-brand font-bold hover:underline">
                  Download sample CSV
                </button>
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        {state !== 'success' && state !== 'error' && (
          <div className="px-6 py-4 border-t border-line flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-bold text-ink-1 hover:text-ink-0 bg-bg-1 border border-line hover:bg-card transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={state !== 'selected'}
              onClick={handleImport}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-brand hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-soft"
            >
              Import
            </button>
          </div>
        )}

        {state === 'success' && (
          <div className="px-6 py-4 border-t border-line shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 rounded-lg text-sm font-bold text-white bg-brand hover:opacity-90 transition-all"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
