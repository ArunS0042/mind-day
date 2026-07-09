import { DailyStatLog } from '@/app/mission/missionData';

export interface MedicalProfile {
  patientId: string;
  doctorNotes: string;
  clinicalDiagnosis: string;
  rehabilitationGoal: string;
  weeklyProgressData: DailyStatLog[];
}

export const MOCK_SOMCHAI_MEDICAL: MedicalProfile = {
  patientId: 'PT-123',
  clinicalDiagnosis: 'Mild Cognitive Impairment (MCI) secondary to Early-stage Alzheimer\'s disease',
  doctorNotes: 'คนไข้มีภาวะหลงลืมระยะสั้น (Short-term memory deficit) เด่นชัด แต่ความเข้าใจภาษาและการสื่อสารยังอยู่ในเกณฑ์ดี แนะนำให้เน้นย้ำแบบฝึกหัดประเภท Digit Recall และสลับ Attention ประจำวันเพื่อชะลอการเสื่อม',
  rehabilitationGoal: 'เพิ่มคะแนนความแม่นยำในหมวด Memory ให้มากกว่า 80% และลดเวลาในการประมวลผล (Processing Time)',
  weeklyProgressData: [
    { date: '2026-07-01', accuracyRate: 40, timeSpentSec: 180, cognitiveDomain: 'Memory', completionStatus: 'Needs Review' },
    { date: '2026-07-02', accuracyRate: 40, timeSpentSec: 165, cognitiveDomain: 'Memory', completionStatus: 'Needs Review' },
    { date: '2026-07-03', accuracyRate: 60, timeSpentSec: 140, cognitiveDomain: 'Attention', completionStatus: 'Passed' },
    { date: '2026-07-04', accuracyRate: 60, timeSpentSec: 132, cognitiveDomain: 'Memory', completionStatus: 'Passed' },
    { date: '2026-07-05', accuracyRate: 80, timeSpentSec: 110, cognitiveDomain: 'Calculation', completionStatus: 'Passed' },
    { date: '2026-07-06', accuracyRate: 80, timeSpentSec: 95, cognitiveDomain: 'Memory', completionStatus: 'Passed' },
    { date: '2026-07-07', accuracyRate: 100, timeSpentSec: 72, cognitiveDomain: 'Memory', completionStatus: 'Passed' }, // วันปัจจุบันศุกร์ความจำเต็ม 100%
  ]
};