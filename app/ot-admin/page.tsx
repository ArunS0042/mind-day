"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function OtAdminDashboard() {
	const router = useRouter();

	// จำลองรายชื่อคนไข้ในระบบเพื่อนำทางเดโม (คงเดิมทุกประการ)
	const patientList = [
		{
			id: "PT-123",
			name: "นายสมชัย ใจดี",
			diagnosis: "Mild Cognitive Impairment (MCI)",
			lastActive: "วันนี้, 14:20 น.",
			status: "ผ่านเกณฑ์วันนี้",
		},
		{
			id: "PT-124",
			name: "นางสมศรี มีสุข",
			diagnosis: "Early-stage Alzheimer's",
			lastActive: "เมื่อวานนี้",
			status: "ต้องทบทวน",
		},
		{
			id: "PT-125",
			name: "นายวีระ ชูใจ",
			diagnosis: "Vascular Dementia (ฟื้นฟูหลัง Stroke)",
			lastActive: "2 วันที่แล้ว",
			status: "ผ่านเกณฑ์วันนี้",
		},
	];

	return (
		// 🎨 เปลี่ยนพื้นหลังใหญ่สุดจาก bg-slate-900 เป็น bg-slate-50 และสีตัวอักษรหลักเป็น text-slate-800
		<div className="w-full min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 antialiased font-sans">
			<div className="max-w-5xl mx-auto space-y-6">
				{/* Header และปุ่มกลับหน้าแรกของผู้ป่วย */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-5 gap-4">
					<div>
						<span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
							🏥 OT-Admin Portal
						</span>
						<h1 className="text-xl font-black mt-2 text-slate-900">
							การจัดการและติดตามกิจกรรมบำบัดหลังบ้าน
						</h1>
					</div>
					<button
						onClick={() => router.push("/")}
						className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition border border-slate-200 shadow-3xs cursor-pointer"
					>
						🏠 กลับหน้าหลักแอปคนไข้
					</button>
				</div>

				{/* 📊 เมนูทางเลือกด่วน (Quick Access Cards) */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* การ์ดที่ 1: ลิงก์ไปหน้า กราฟภาพรวม (OT-Graph) */}
					<div
						onClick={() => router.push("/ot-admin/ot-graph")}
						className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-indigo-400 transition cursor-pointer shadow-3xs group space-y-3"
					>
						<div className="flex justify-between items-center">
							<span className="text-xl">📊</span>
							<span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-md uppercase">
								Overview Stat
							</span>
						</div>
						<div>
							<h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition">
								ดูสถิติกราฟภาพรวมประจำศูนย์ (OT-Graph)
							</h3>
							<p className="text-xs text-slate-500 mt-1">
								วิเคราะห์แนวโน้มคะแนนเฉลี่ย, อัตราการเข้าใช้งาน
								และสถิติเชิงเปรียบเทียบในภาพรวม
							</p>
						</div>
					</div>

					{/* การ์ดที่ 2: สรุปงานด่วน */}
					<div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-3xs">
						<h3 className="text-xs font-black text-amber-600 uppercase tracking-wide">
							🔔 แจ้งเตือนสัปดาห์นี้
						</h3>
						<p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
							มีเคสคนไข้ 1 รายที่มีอัตราความแม่นยำต่ำกว่าเกณฑ์สากล (CRI &lt;
							50%) ระบบแนะนำให้เข้าไปปรับลดระดับ Level โจทย์ประจำวัน
						</p>
						<div className="text-[10px] text-slate-400 font-bold mt-2">
							อัปเดตระบบล่าสุด: เรียลไทม์
						</div>
					</div>
				</div>

				{/* 📋 รายชื่อคนไข้ในการดูแล (Patient Cases) */}
				<div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-3xs">
					<h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
						👥 รายชื่อคนไข้
					</h3>

					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs border-collapse">
							<thead>
								<tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[10px]">
									<th className="py-3 px-2">ชื่อ-นามสกุล</th>
									<th className="py-3 px-2">การวินิจฉัยทางการแพทย์</th>
									<th className="py-3 px-2">ฝึกฝนล่าสุด</th>
									<th className="py-3 px-2">ประเมินผล</th>
									<th className="py-3 px-2 text-right">การจัดการ</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{patientList.map((pt) => (
									<tr
										key={pt.id}
										className="hover:bg-slate-50/80 transition font-medium"
									>
										<td className="py-3 px-2">
											<div className="font-bold text-slate-900">{pt.name}</div>
											<div className="text-[10px] text-slate-400 font-bold">
												ID: {pt.id}
											</div>
										</td>
										<td className="py-3 px-2 text-slate-600">{pt.diagnosis}</td>
										<td className="py-3 px-2 text-slate-500">
											{pt.lastActive}
										</td>
										<td className="py-3 px-2">
											<span
												className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
													pt.status === "Passed" || pt.status.includes("ผ่าน")
														? "bg-emerald-50 text-emerald-700 border border-emerald-100"
														: "bg-rose-50 text-rose-700 border border-rose-100"
												}`}
											>
												{pt.status}
											</span>
										</td>
										<td className="py-3 px-2 text-right">
											{/* ปุ่มลิงก์เจาะลึกคนไข้รายบุคคล ไปที่หน้า /ot-admin/patient/[id] */}
											<button
												onClick={() =>
													router.push(`/ot-admin/patient/${pt.id}`)
												}
												className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-xl transition shadow-3xs cursor-pointer"
											>
												🔍 ดูประวัติเชิงลึก
											</button>
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
