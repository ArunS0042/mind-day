// @/app/ot-admin/patient/[id]/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MOCK_SOMCHAI_MEDICAL, DailyStatLog } from "@/utils/medicalMock";

export default function OtAdminPatientAnalytics() {
	const router = useRouter();
	const profile = MOCK_SOMCHAI_MEDICAL;

	// State สำหรับจัดการตัวกรองหมวดหมู่
	const [selectedDomain, setSelectedDomain] = useState<string>("All");

	const TMSE_DOMAINS = [
		"All",
		"Orientation",
		"Registration",
		"Attention",
		"Calculation",
		"Language",
		"Recall",
	];

	// 1. ฟังก์ชันกรองและจัดกลุ่มข้อมูล (Group & Sort)
	const displayData = useMemo(() => {
		let result: DailyStatLog[] = [];

		if (selectedDomain === "All") {
			// หากเลือก "All" ให้รวมข้อมูลทั้ง 6 ทักษะของแต่ละวันมาหาค่าเฉลี่ย เพื่อให้กราฟดูง่ายขึ้น (ได้ 7 แท่ง)
			const grouped = profile.weeklyProgressData.reduce(
				(acc, curr) => {
					if (!acc[curr.date]) {
						acc[curr.date] = {
							date: curr.date,
							totalAcc: 0,
							totalTime: 0,
							count: 0,
						};
					}
					acc[curr.date].totalAcc += curr.accuracyRate;
					acc[curr.date].totalTime += curr.timeSpentSec;
					acc[curr.date].count += 1;
					return acc;
				},
				{} as Record<
					string,
					{ date: string; totalAcc: number; totalTime: number; count: number }
				>,
			);

			result = Object.values(grouped).map((day) => ({
				date: day.date,
				accuracyRate: Math.round(day.totalAcc / day.count),
				timeSpentSec: Math.round(day.totalTime / day.count),
				cognitiveDomain: "ภาพรวมทุกทักษะ (Daily Average)",
				completionStatus:
					day.totalAcc / day.count >= 60 ? "Passed" : "Needs Review",
			}));
		} else {
			// หากเลือกทักษะเฉพาะ ให้ดึงแค่ข้อมูลของทักษะนั้นมาแสดง
			result = profile.weeklyProgressData.filter(
				(log) => log.cognitiveDomain === selectedDomain,
			);
		}

		// 2. เรียงลำดับวันที่จากน้อยไปมาก (ซ้ายไปขวา)
		return result.sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		);
	}, [profile.weeklyProgressData, selectedDomain]);

	// คำนวณหาค่าเฉลี่ยสำหรับการ์ดสรุปด้านบน
	const totalLogs = displayData.length;
	const avgAccuracy =
		totalLogs > 0
			? Math.round(
					displayData.reduce((acc, curr) => acc + curr.accuracyRate, 0) /
						totalLogs,
				)
			: 0;
	const avgTime =
		totalLogs > 0
			? Math.round(
					displayData.reduce((acc, curr) => acc + curr.timeSpentSec, 0) /
						totalLogs,
				)
			: 0;

	return (
		<div className="w-full min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 antialiased font-sans">
			<div className="max-w-5xl mx-auto space-y-6">
				{/* ส่วนหัว */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5 gap-4">
					<div>
						<span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
							🏥 OT-Admin Clinical Analytics
						</span>
						<h1 className="text-xl font-black mt-2 text-slate-900">
							รายงานการฟื้นฟู: นายสมชัย ใจดี (ID: {profile.patientId})
						</h1>
					</div>
					<button
						onClick={() => router.push("/ot-admin")}
						className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition border border-slate-200 shadow-sm cursor-pointer whitespace-nowrap"
					>
						⬅ ย้อนกลับหน้าแผงควบคุม
					</button>
				</div>

				{/* 🩺 ข้อมูลการวินิจฉัยทางการแพทย์ */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="bg-white border border-slate-200 p-5 rounded-2xl md:col-span-2 space-y-3 shadow-sm">
						<h3 className="text-xs font-black text-indigo-600 uppercase tracking-wide">
							🩺 Clinical Diagnosis
						</h3>
						<p className="text-sm font-bold text-slate-900 leading-relaxed">
							{profile.clinicalDiagnosis}
						</p>
						<div className="pt-2">
							<span className="text-[11px] font-bold text-slate-400 block mb-1">
								📝 บันทึกเพิ่มเติมจากแพทย์/OT:
							</span>
							<p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
								{profile.doctorNotes}
							</p>
						</div>
					</div>
					<div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
						<div className="space-y-2">
							<h3 className="text-xs font-black text-amber-600 uppercase tracking-wide">
								🎯 Goal & Current Avg
							</h3>
							<p className="text-xs text-slate-600 font-medium leading-relaxed">
								{profile.rehabilitationGoal}
							</p>
						</div>
						<div className="border-t border-slate-100 pt-3 mt-4 grid grid-cols-2 gap-2 text-center">
							<div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
								<span className="text-[9px] text-slate-400 block font-bold">
									ความแม่นยำเฉลี่ย
								</span>
								<span className="text-sm font-black text-emerald-600">
									{avgAccuracy}%
								</span>
							</div>
							<div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
								<span className="text-[9px] text-slate-400 block font-bold">
									เวลาเฉลี่ย
								</span>
								<span className="text-sm font-black text-indigo-600">
									{avgTime} วินาที
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* 📊 กราฟและตารางความคืบหน้า */}
				<div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
					<div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
						<h3 className="text-xs font-black text-slate-700 uppercase tracking-wider whitespace-nowrap">
							📈 ประวัติพัฒนาการ{" "}
							{selectedDomain === "All"
								? "(เฉลี่ยรวม 7 วัน)"
								: `(ทักษะ: ${selectedDomain})`}
						</h3>

						{/* 🎯 ตัวกรองทักษะ TMSE */}
						<div className="flex flex-wrap gap-2">
							{TMSE_DOMAINS.map((domain) => (
								<button
									key={domain}
									onClick={() => setSelectedDomain(domain)}
									className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition border cursor-pointer ${
										selectedDomain === domain
											? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
											: "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
									}`}
								>
									{domain === "All" ? "รวมทั้งหมดรายวัน" : domain}
								</button>
							))}
						</div>
					</div>

					{/* 📊 กราฟแท่ง (เรียงซ้ายไปขวา = เก่าไปใหม่) */}
					<div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-end justify-between gap-2 md:gap-4 h-64 pt-10 overflow-x-auto">
						{displayData.length > 0 ? (
							displayData.map((log, index) => (
								<div
									key={`${log.date}-${index}`}
									className="flex flex-col items-center flex-1 min-w-[40px] group"
								>
									<span className="text-[10px] font-black text-slate-400 mb-2 opacity-80 group-hover:text-indigo-600 transition">
										{log.accuracyRate}%
									</span>
									<div
										className={`w-full max-w-[40px] rounded-t-md transition-all duration-500 shadow-sm relative ${
											log.accuracyRate >= 80
												? "bg-emerald-500"
												: log.accuracyRate >= 60
													? "bg-amber-400"
													: "bg-rose-500"
										}`}
										style={{ height: `${log.accuracyRate * 1.6}px` }}
									>
										{/* Tooltip Hover เพื่อแสดงข้อมูลชัดขึ้นบน Desktop */}
										<div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded-md pointer-events-none whitespace-nowrap transition-opacity">
											เวลา: {log.timeSpentSec}s
										</div>
									</div>
									<span className="text-[9px] font-bold text-slate-400 mt-2 whitespace-nowrap">
										{log.date.split("-")[2]}/{log.date.split("-")[1]}
									</span>
								</div>
							))
						) : (
							<div className="w-full h-full flex items-center justify-center text-sm text-slate-400 font-bold">
								ไม่มีข้อมูลประวัติในหมวดหมู่ที่เลือก
							</div>
						)}
					</div>

					{/* 📋 ตาราง */}
					<div className="overflow-x-auto pt-4">
						<table className="w-full text-left text-xs border-collapse">
							<thead>
								<tr className="border-b border-slate-200 text-slate-500 font-black uppercase text-[10px]">
									{/* เปลี่ยนข้อความ Header เป็นเรียงใหม่ไปเก่า */}
									<th className="py-3 px-2">วันที่เข้าฝึก (เรียงใหม่ไปเก่า)</th>
									<th className="py-3 px-2">โดเมนหลัก (TMSE)</th>
									<th className="py-3 px-2 text-center">ความแม่นยำ</th>
									<th className="py-3 px-2 text-center">เวลาที่ใช้รวม</th>
									<th className="py-3 px-2 text-right">สถานะการประเมิน</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{displayData.length > 0 ? (
									/* ใช้ [...displayData].reverse() เพื่อให้ตารางเรียงจากใหม่สุดลงมาเก่าสุด โดยไม่กระทบกราฟ */
									[...displayData].reverse().map((log, index) => (
										<tr
											key={`${log.date}-${index}`}
											className="hover:bg-slate-50/80 transition font-medium"
										>
											<td className="py-3 px-2 font-bold text-slate-700">
												{log.date}
											</td>
											<td className="py-3 px-2">
												<span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 border border-slate-200 font-bold text-[10px]">
													{log.cognitiveDomain}
												</span>
											</td>
											<td className="py-3 px-2 text-center font-black text-slate-900">
												{log.accuracyRate}%
											</td>
											<td className="py-3 px-2 text-center text-slate-500">
												{log.timeSpentSec} วินาที
											</td>
											<td className="py-3 px-2 text-right">
												<span
													className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
														log.completionStatus === "Passed"
															? "bg-emerald-50 text-emerald-700 border border-emerald-100"
															: "bg-rose-50 text-rose-700 border border-rose-100"
													}`}
												>
													{log.completionStatus === "Passed"
														? "✓ ผ่านเกณฑ์"
														: "⚠️ ต้องทบทวน"}
												</span>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td
											colSpan={5}
											className="py-8 text-center text-slate-400 font-bold"
										>
											ไม่พบข้อมูลบันทึกสำหรับทักษะนี้
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
