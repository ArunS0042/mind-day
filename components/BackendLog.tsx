import React from 'react';

export default function BackendLog({ message }: { message: string }) {
  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 shadow-inner font-mono text-[10px] space-y-1">
      <p className="text-teal-400 font-bold border-b border-slate-800 pb-1 flex items-center">
        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full inline-block mr-1.5 animate-pulse"></span>
        ⚙️ SYSTEM CLOUD BACKEND (DATA FLOW LIVE LOG)
      </p>
      <p className="text-slate-300 leading-relaxed pt-0.5">{message}</p>
    </div>
  );
}