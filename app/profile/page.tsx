'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import BackendLog from '@/components/BackendLog';

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">ขั้นตอนที่ 2</span>
          <h2 className="text-base font-bold text-slate-900 mt-1">Cognitive Profile Generated</h2>
          <p className="text-xs text-slate-500">ผลลัพธ์การประเมินและระดับเป้าหมายเริ่มต้น</p>
        </div>

        <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-slate-700">
          <p className="font-bold text-amber-800">📊 การวิเคราะห์ระดับสมองโดยรวม:</p>
          <p className="font-bold text-slate-900 mt-0.5">Mild Impairment (บกพร่องเล็กน้อย)</p>
          <p className="text-[11px] text-slate-500 mt-1">ระบบตรวจพบว่าด้านการคิดคำนวณและความจำระยะสั้นต้องการการกระตุ้นเพิ่มเติม</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">ความจำ (Memory): <span className="text-emerald-600 font-bold">80%</span></div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">การคิดขั้นสูง (Executive): <span className="text-amber-600 font-bold">60% ⚠️</span></div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">สมาธิ (Attention): <span className="text-emerald-600 font-bold">75%</span></div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">การรับรู้เวลา (Orientation): <span className="text-amber-600 font-bold">65%</span></div>
        </div>

        <button onClick={() => router.push('/mission')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs cursor-pointer text-center block">
          เข้าสู่ชุดแบบฝึกหัดประจำวันถัดไป ➔
        </button>
      </div>

      <BackendLog message="Analysis Engine: คำนวณความเสี่ยงสำเร็จ ปรับระดับความยากชุดแบบฝึกหัดเริ่มต้นไว้ที่ Level 3" />
    </div>
  );
}