'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import BackendLog from '@/components/BackendLog';

export default function DashboardPage() {
  const router = useRouter();

  const mockTriggerAlert = (type: string) => {
    if (type === '24h') alert("🔔 [จำลอง Push] 'ผู้ป่วยขาดกิจกรรมวันนี้ ยิงข้อความชวนทำมิชชั่นยามเช้า'");
    if (type === '3d') alert("🚨 [จำลอง Risk Alerts] 'ผู้ป่วยไม่เข้าใช้ 3 วัน! ยิงเตือนภัยสีแดงไปที่แอปพลิเคชัน Caregiver และ Therapist ทันที'");
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 24 Hours Lock & Calendar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-900">🗓️ ขั้นตอนที่ 6: Daily Unlock</h3>
          <span className="text-xs font-bold text-amber-600">🔥 ฝึกฝนสะสม 15 วัน</span>
        </div>
        
        {/* ปฏิทินรายสัปดาห์ */}
        <div className="grid grid-cols-5 gap-2 text-center text-[10px] text-slate-400 pt-1">
          <div><span>จ.</span><div className="mt-1 w-8 h-8 mx-auto bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">✓</div></div>
          <div><span>อ.</span><div className="mt-1 w-8 h-8 mx-auto bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">✓</div></div>
          <div><span>พ.</span><div className="mt-1 w-8 h-8 mx-auto bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">✓</div></div>
          <div><span>พฤ.</span><div className="mt-1 w-8 h-8 mx-auto bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">✓</div></div>
          <div><span>ศ. (วันนี้)</span><div className="mt-1 w-8 h-8 mx-auto bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">✓</div></div>
        </div>

        <div className="bg-amber-50 text-[11px] text-amber-800 p-2.5 rounded-lg text-center font-medium border border-amber-100">
          ⏳ เซสชันถัดไปถูกล็อกไว้ จะเปิดใช้งานใหม่อัตโนมัติหลังจากครบ 24 ชม.
        </div>
      </div>

      {/* Caregiver & Therapist Dashboard */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900">👥 มุมมองผู้ดูแล (Caregiver Panel)</h3>
        <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] border border-slate-100 space-y-1">
          <p className="text-slate-600">จำนวนวันฝึกสัปดาห์นี้: <span className="font-bold text-slate-900">5/7 วัน</span></p>
          <p className="text-slate-600">สถานะล่าสุด: <span className="text-emerald-600 font-bold">ใช้งานเสร็จสมบูรณ์วันนี้</span></p>
        </div>
        
        <div className="bg-slate-950 text-slate-200 p-3 rounded-xl text-[10px] space-y-2">
          <p className="font-bold text-teal-400">🩺 Therapist Risks Alert Trigger</p>
          <div className="flex gap-2">
            <button onClick={() => mockTriggerAlert('24h')} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-1 rounded cursor-pointer">จำลองเหตุการณ์หยุดนิ่ง 24 ชม.</button>
            <button onClick={() => mockTriggerAlert('3d')} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-1 rounded cursor-pointer">จำลองเหตุการณ์หยุดนิ่ง 3 วัน</button>
          </div>
        </div>
      </div>

      <button onClick={() => router.push('/')} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs py-2 rounded-xl transition cursor-pointer text-center block">
        🔄 ย้อนกลับไปเริ่มหน้าแรกเพื่อสาธิตใหม่
      </button>
    </div>
  );
}