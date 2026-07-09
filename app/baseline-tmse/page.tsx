'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TmseScores {
  orientation: number;       // เต็ม 6
  registration: number;      // เต็ม 3
  attentionCalc: number;     // เต็ม 5
  recall: number;            // เต็ม 3
  language: number;          // เต็ม 10
  visuospatialCdt: number;   // เต็ม 4 (Clock Drawing Test ที่เสริมเข้ามา)
}

export default function TmseBaselinePage() {
  const router = useRouter();
  const [formType, setFormType] = useState<'ot_input' | 'digital_form'>('ot_input');
  
  // State สำหรับเก็บคะแนนดิบ
  const [rawScores, setRawScores] = useState<TmseScores>({
    orientation: 6,
    registration: 3,
    attentionCalc: 5,
    recall: 3,
    language: 10,
    visuospatialCdt: 4,
  });

  const [cognitiveProfile, setCognitiveProfile] = useState<any>(null);
  const [priorityDomain, setPriorityDomain] = useState<string>('');

  // ฟังก์ชันคำนวณและแปลง TMSE ➔ 5 Core Domains
  const calculateMapping = () => {
    // 1. คำนวณเป็นเปอร์เซ็นต์เพื่อหาโดเมนที่บกพร่องที่สุด (ต่ำสุด)
    const memoryPct = ((rawScores.registration + rawScores.recall) / 6) * 100;
    const attentionPct = (rawScores.attentionCalc / 5) * 100;
    const executivePct = (rawScores.attentionCalc / 5) * 100; // ในระดับคัดกรองเบื้องต้น คำนวณควบคู่กับ Attention
    const languagePct = (rawScores.language / 10) * 100;
    const visuospatialPct = (rawScores.visuospatialCdt / 4) * 100;
    const orientationPct = (rawScores.orientation / 6) * 100;

    const totalTmse = rawScores.orientation + rawScores.registration + rawScores.attentionCalc + rawScores.recall + rawScores.language;

    const domains = [
      { name: 'Memory (ความจำ)', score: memoryPct, key: 'memory' },
      { name: 'Attention (สมาธิการจดจ่อ)', score: attentionPct, key: 'attention' },
      { name: 'Executive Function (การคิดขั้นสูง)', score: executivePct, key: 'executive' },
      { name: 'Language (การใช้ภาษา)', score: languagePct, key: 'language' },
      { name: 'Visuospatial (มิติสัมพันธ์)', score: visuospatialPct, key: 'visuospatial' },
    ];

    // หาโดเมนที่คะแนนต่ำที่สุด (ต่ำสุดตัวแรก) เพื่อส่งให้ Generator ดึงแบบฝึกหัดขึ้นมาก่อน
    const lowestDomain = domains.reduce((prev, current) => (prev.score < current.score) ? prev : current);

    setCognitiveProfile({
      totalTmse,
      memory: Math.round(memoryPct),
      attention: Math.round(attentionPct),
      executive: Math.round(executivePct),
      language: Math.round(languagePct),
      visuospatial: Math.round(visuospatialPct),
      orientation: Math.round(orientationPct),
    });

    setPriorityDomain(lowestDomain.name);
  };

  const handleInputChange = (field: keyof TmseScores, value: number) => {
    setRawScores(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
      
      {/* ส่วนหัวเว็บบอร์ด */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
          ด่านแรก: Clinical Baseline Assessment
        </span>
        <h2 className="text-lg font-black text-slate-900 pt-1">ระบบคัดกรองฐานสมอง (TMSE + CDT)</h2>
        <p className="text-xs text-slate-500">แปลงคะแนนทางการแพทย์เข้าสู่ระบบ AI Generator ส่วนบุคคล</p>
      </div>

      {/* ปุ่มสลับโหมดการกรอกข้อมูล */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
        <button 
          onClick={() => { setFormType('ot_input'); setCognitiveProfile(null); }}
          className={`text-xs py-2 rounded-lg font-bold transition-all cursor-pointer ${formType === 'ot_input' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
        >
          OT กดยืนยันคะแนนจริง
        </button>
        <button 
          onClick={() => { setFormType('digital_form'); setCognitiveProfile(null); }}
          className={`text-xs py-2 rounded-lg font-bold transition-all cursor-pointer ${formType === 'digital_form' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
        >
          ทำแบบทดสอบ Digital
        </button>
      </div>

      <hr className="border-slate-100" />

      {/* โหมดที่ 1: นักบำบัดกรอกคะแนนดิบจากกระดาษประเมินจริง */}
      {formType === 'ot_input' && !cognitiveProfile && (
        <div className="space-y-4">
          <p className="text-xs font-bold text-indigo-600 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
            👨‍⚕️ สำหรับนักกิจกรรมบำบัด (OT): โปรดระบุคะแนนที่ผู้ป่วยทำได้จริงจากแบบประเมิน TMSE
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">1. Orientation การรับรู้ (เต็ม 6)</label>
              <input type="number" min="0" max="6" value={rawScores.orientation} onChange={(e) => handleInputChange('orientation', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm text-center font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">2. Registration (เต็ม 3)</label>
                <input type="number" min="0" max="3" value={rawScores.registration} onChange={(e) => handleInputChange('registration', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm text-center font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">4. Recall ความจำ (เต็ม 3)</label>
                <input type="number" min="0" max="3" value={rawScores.recall} onChange={(e) => handleInputChange('recall', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm text-center font-bold" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">3. Attention / Calculation (เต็ม 5)</label>
              <input type="number" min="0" max="5" value={rawScores.attentionCalc} onChange={(e) => handleInputChange('attentionCalc', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm text-center font-bold" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">5. Language การใช้ภาษา (เต็ม 10)</label>
              <input type="number" min="0" max="10" value={rawScores.language} onChange={(e) => handleInputChange('language', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm text-center font-bold" />
            </div>
            <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              <label className="text-xs font-bold text-emerald-800 block mb-1">➕ เสริม: Clock Drawing Test [CDT] (เต็ม 4)</label>
              <p className="text-[10px] text-slate-500 mb-1.5">ประเมิน Visuospatial (วาดวงกลม, ตัวเลขครบ, วาดเข็มบอกเวลาตรง)</p>
              <input type="number" min="0" max="4" value={rawScores.visuospatialCdt} onChange={(e) => handleInputChange('visuospatialCdt', Number(e.target.value))} className="w-full bg-white border border-emerald-200 rounded-xl p-2 text-sm text-center font-bold text-emerald-700" />
            </div>
          </div>

          <button onClick={calculateMapping} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer">
            🔄 ประมวลผลสร้าง Cognitive Profile และตั้งลำดับความยาก
          </button>
        </div>
      )}

      {/* โหมดที่ 2: ระบบจำลองทำแบบสอบถามออนไลน์ (Digital Form) */}
      {formType === 'digital_form' && !cognitiveProfile && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-3">
          <span className="text-xl">📱</span>
          <p className="text-xs text-slate-600 font-medium">ระบบกำลังจำลองหน้าต่างข้อคำถามประเมินพฤติกรรมดิจิทัลสำหรับกรณีที่ไม่มี OT อยู่หน้างาน</p>
          <button onClick={() => {
            // ตั้งค่าคะแนนจำลอง: บกพร่องหนักสุดด้าน Recall และ Calculation
            setRawScores({ orientation: 5, registration: 3, attentionCalc: 2, recall: 1, language: 9, visuospatialCdt: 4 });
            setTimeout(() => calculateMapping(), 200);
          }} className="bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-bold cursor-pointer">
            คลิกเพื่อจำลองการทำแบบฟอร์มเสร็จสิ้น
          </button>
        </div>
      )}

      {/* แสดงผลการวิเคราะห์ Mapping และกำหนด Priority Domain ของแอปพลิเคชัน */}
      {cognitiveProfile && (
        <div className="space-y-4 animate-scaleUp">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl space-y-2">
            <h3 className="text-xs font-bold text-emerald-800 flex items-center">
              <span>🎯</span> &nbsp;ประมวลผล Cognitive Profile สำเร็จ!
            </h3>
            <p className="text-[11px] text-slate-600">คะแนนดิบรวมเฉพาะ TMSE: <span className="font-bold text-slate-900">{cognitiveProfile.totalTmse} / 31 คะแนน</span></p>
          </div>

          {/* ตารางแสดงผลลัพธ์การจัดกลุ่มเข้า 5 โดเมนของแอป */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">ผลวิเคราะห์รายโดเมนประจำตัว (แอปพลิเคชันปลายทาง)</span>
            <div className="space-y-1.5 font-medium">
              <div className="flex justify-between p-1.5 bg-white rounded border border-slate-100">
                <span>🧠 Memory (ความจำระยะสั้น)</span>
                <span className="font-bold text-slate-700">{cognitiveProfile.memory}%</span>
              </div>
              <div className="flex justify-between p-1.5 bg-white rounded border border-slate-100">
                <span>⚡ Attention (ความตั้งใจจดจ่อ)</span>
                <span className="font-bold text-slate-700">{cognitiveProfile.attention}%</span>
              </div>
              <div className="flex justify-between p-1.5 bg-white rounded border border-slate-100">
                <span>📈 Executive Function (การบริหารจัดการ)</span>
                <span className="font-bold text-slate-700">{cognitiveProfile.executive}%</span>
              </div>
              <div className="flex justify-between p-1.5 bg-white rounded border border-slate-100">
                <span>🗣️ Language (ทักษะภาษา)</span>
                <span className="font-bold text-slate-700">{cognitiveProfile.language}%</span>
              </div>
              <div className="flex justify-between p-1.5 bg-white rounded border border-slate-100">
                <span>📐 Visuospatial (มิติสัมพันธ์จาก CDT)</span>
                <span className="font-bold text-slate-700">{cognitiveProfile.visuospatial}%</span>
              </div>
            </div>
          </div>

          {/* กฎ Rule-based Logic เลือกแบบฝึกหัดโดเมนที่อ่อนสุดขึ้นมาแรกสุด */}
          <div className="bg-indigo-900 text-indigo-100 p-4 rounded-2xl border border-indigo-950 space-y-2">
            <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">⚙️ AI Personalization Algorithm Triggered</div>
            <p className="text-xs leading-relaxed">
              โดเมนที่ได้เปอร์เซ็นต์ต่ำสุดคือ: <span className="text-yellow-300 font-extrabold underline">{priorityDomain}</span>
            </p>
            <p className="text-[11px] text-indigo-200/80">
              ระบบ Generator ทำการจัดลำดับความสำคัญ โดยจะหยิบแบบฝึกหัดในคลังของโดเมนนี้มาให้ผู้ป่วยทำเป็นด่านแรกประจำวันทันที
            </p>
          </div>

          <button onClick={() => router.push('/mission')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer text-center block">
            เริ่มทำแบบฝึกหัดที่ AI คัดสรรให้วันนี้ ➔
          </button>
        </div>
      )}

    </div>
  );
}