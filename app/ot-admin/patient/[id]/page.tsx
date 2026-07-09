'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_SOMCHAI_MEDICAL } from '@/utils/medicalMock';

export default function OtAdminPatientAnalytics() {
  const router = useRouter();
  const profile = MOCK_SOMCHAI_MEDICAL; // ดึงข้อมูลแพทย์และกราฟจำลองของนายสมชัย
  
  // คำนวณหาค่าเฉลี่ยความก้าวหน้าทางการแพทย์
  const totalDays = profile.weeklyProgressData.length;
  const avgAccuracy = Math.round(profile.weeklyProgressData.reduce((acc, curr) => acc + curr.accuracyRate, 0) / totalDays);
  const avgTime = Math.round(profile.weeklyProgressData.reduce((acc, curr) => acc + curr.timeSpentSec, 0) / totalDays);

  return (
    // 🎨 เปลี่ยนพื้นหลังใหญ่สุดเป็น bg-slate-50 และสีข้อความหลักเป็น text-slate-800
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 antialiased font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* ส่วนหัวของแผงควบคุม Therapist */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5 gap-4">
          <div>
            <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              🏥 OT-Admin Clinical Analytics
            </span>
            <h1 className="text-xl font-black mt-2 text-slate-900">รายงานการฟื้นฟู: นายสมชัย ใจดี (ID: {profile.patientId})</h1>
          </div>
          <button 
            onClick={() => router.push('/ot-admin')} 
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition border border-slate-200 shadow-3xs cursor-pointer"
          >
            ⬅ ย้อนกลับหน้าแผงควบคุม
          </button>
        </div>

        {/* 🩺 ข้อมูลการวินิจฉัยทางการแพทย์ (Medical Context) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl md:col-span-2 space-y-3 shadow-3xs">
            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-wide">🩺 Clinical Diagnosis (ผลวินิจฉัยทางคลินิก)</h3>
            <p className="text-sm font-bold text-slate-900 leading-relaxed">{profile.clinicalDiagnosis}</p>
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">📝 บันทึกเพิ่มเติมจากแพทย์/OT:</span>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">{profile.doctorNotes}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-3xs">
            <div className="space-y-2">
              <h3 className="text-xs font-black text-amber-600 uppercase tracking-wide">🎯 Rehabilitation Goal</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{profile.rehabilitationGoal}</p>
            </div>
            <div className="border-t border-slate-100 pt-3 mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block font-bold">ความแม่นยำเฉลี่ย</span>
                <span className="text-sm font-black text-emerald-600">{avgAccuracy}%</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block font-bold">เวลาตอบสนองเฉลี่ย</span>
                <span className="text-sm font-black text-indigo-600">{avgTime} วินาที</span>
              </div>
            </div>
          </div>
        </div>

        {/* 📊 กราฟและตารางความคืบหน้าสากล (Tracking Results) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-3xs">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">📈 Longitudinal Progress Tracking (ประวัติย้อนหลัง 7 วัน)</h3>
            <span className="text-[10px] text-slate-400 font-bold">มาตรฐานการประมวลผล: CRI Index</span>
          </div>

          {/* 📊 จำลองแท่งกราฟเทียมระดับ Advance ด้วย Tailwind CSS (ปรับพื้นหลังกราฟให้สว่างรับกับแท่งสี) */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-end justify-between h-48 pt-10">
            {profile.weeklyProgressData.map((log, index) => (
              <div key={log.date} className="flex flex-col items-center flex-1 group">
                {/* ตัวเลขเปอร์เซ็นต์บนหัวแท่ง */}
                <span className="text-[10px] font-black text-slate-400 mb-2 opacity-80 group-hover:text-indigo-600 transition">
                  {log.accuracyRate}%
                </span>
                {/* แท่งความสูงผันแปรตามสถิติของวัน */}
                <div 
                  className={`w-6 sm:w-8 rounded-t-md transition-all duration-500 shadow-3xs ${
                    log.accuracyRate >= 80 ? 'bg-emerald-500 shadow-emerald-500/10' : log.accuracyRate >= 60 ? 'bg-indigo-500 shadow-indigo-500/10' : 'bg-rose-500 shadow-rose-500/10'
                  }`}
                  style={{ height: `${log.accuracyRate * 1.2}px` }}
                ></div>
                {/* ป้ายบอกวันที่ด้านล่าง */}
                <span className="text-[9px] font-bold text-slate-400 mt-2">
                  {log.date.split('-')[2]}/{log.date.split('-')[1]}
                </span>
              </div>
            ))}
          </div>

          {/* 📋 รายละเอียดแบบตารางบันทึกเชิงลึก (Clinical Log Table) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[10px]">
                  <th className="py-3 px-2">วันที่เข้าฝึก</th>
                  <th className="py-3 px-2">โดเมนหลัก</th>
                  <th className="py-3 px-2 text-center">ความแม่นยำ</th>
                  <th className="py-3 px-2 text-center">เวลาที่ใช้รวม</th>
                  <th className="py-3 px-2 text-right">สถานะการประเมิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profile.weeklyProgressData.map((log) => (
                  <tr key={log.date} className="hover:bg-slate-50/80 transition font-medium">
                    <td className="py-3 px-2 font-bold text-slate-700">{log.date}</td>
                    <td className="py-3 px-2">
                      <span className="bg-slate-50 px-2 py-0.5 rounded-md text-slate-600 border border-slate-200 font-bold">
                        {log.cognitiveDomain}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-black text-slate-900">{log.accuracyRate}%</td>
                    <td className="py-3 px-2 text-center text-slate-500">{log.timeSpentSec} วินาที</td>
                    <td className="py-3 px-2 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.completionStatus === 'Passed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {log.completionStatus === 'Passed' ? '✓ ผ่านเกณฑ์' : '⚠️ ต้องทบทวน'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}