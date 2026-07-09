"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	getLocalPatients,
	saveLocalPatients,
	PatientRecord,
	TmseScores,
} from "@/utils/storage";
import {
	ResponsiveContainer,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	Radar,
	Legend,
} from "recharts";

export default function OtTmseChartPage() {
	const [patients, setPatients] = useState<PatientRecord[]>([]);
	const [selectedPatientId, setSelectedPatientId] = useState<string>("");

	// Form States
	const [fullName, setFullName] = useState("");
	const [age, setAge] = useState("");
	const [scores, setScores] = useState<TmseScores>({
		orientation: 6,
		registration: 3,
		attention: 5,
		calculation: 3,
		language: 10,
		recall: 3,
	});

	const router = useRouter();

	// โหลดข้อมูลขึ้นมาจาก localStorage เมื่อเปิดหน้าจอ
	useEffect(() => {
		const localData = getLocalPatients();
		setPatients(localData);
		if (localData.length > 0) {
			setSelectedPatientId(localData[0].id);
		}
	}, []);

	const handleScoreChange = (field: keyof TmseScores, value: number) => {
		setScores((prev) => ({ ...prev, [field]: value }));
	};

	const handleSaveToDatabase = (e: React.FormEvent) => {
		e.preventDefault();
		if (!fullName || !age)
			return alert("กรุณากรอกข้อมูลส่วนตัวคนไข้ให้ครบถ้วนก่อนบันทึก");

		const total =
			scores.orientation +
			scores.registration +
			scores.attention +
			scores.calculation +
			scores.language +
			scores.recall;
		const randomId = `PT-${Math.floor(100 + Math.random() * 900)}`;

		const newPatient: PatientRecord = {
			id: randomId,
			name: fullName,
			age: Number(age),
			scores: { ...scores },
			totalScore: total,
			tempUser: `pt_${randomId.toLowerCase().replace("-", "_")}`,
			tempPass: Math.random().toString(36).slice(-6) + "!",
			status: "Pending Activation",
			completedMissions: [],
		};

		const updatedList = [newPatient, ...patients];
		setPatients(updatedList);
		saveLocalPatients(updatedList); // 💾 เซฟลง LocalStorage สำเร็จ!
		setSelectedPatientId(randomId);

		setFullName("");
		setAge("");
		alert(`บันทึกประวัติและผลคะแนนลงใน localStorage สำเร็จ!`);
	};

	const activePatient =
		patients.find((p) => p.id === selectedPatientId) || patients[0];

	const chartData = activePatient
		? [
				{
					subject: "Orientation (เต็ม 6)",
					A: Math.round((activePatient.scores.orientation / 6) * 100),
				},
				{
					subject: "Registration (เต็ม 3)",
					A: Math.round((activePatient.scores.registration / 3) * 100),
				},
				{
					subject: "Attention (เต็ม 5)",
					A: Math.round((activePatient.scores.attention / 5) * 100),
				},
				{
					subject: "Calculation (เต็ม 3)",
					A: Math.round((activePatient.scores.calculation / 3) * 100),
				},
				{
					subject: "Language (เต็ม 10)",
					A: Math.round((activePatient.scores.language / 10) * 100),
				},
				{
					subject: "Recall (เต็ม 3)",
					A: Math.round((activePatient.scores.recall / 3) * 100),
				},
			]
		: [];

	return (
		<div className="w-full max-w-none bg-slate-50 min-h-screen p-6 text-slate-800 antialiased">
			{/* โครงสร้าง UI เหมือนเดิม ความกว้างเต็มจอ และดึงข้อมูลแบบ Dynamic อิงตาม localStorage */}
			<div className="w-full bg-slate-900 text-white p-5 rounded-3xl flex justify-between items-center shadow-xs mb-6">
				<div>
					<span className="text-[10px] bg-teal-400 text-slate-950 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wide">
						OT Clinical Dashboard
					</span>
					<h1 className="text-xl font-black mt-1">
						ระบบกรอกประวัติและวิเคราะห์ผลทดสอบ TMSE
					</h1>
				</div>
			</div>
			<button
				onClick={() => router.push("/ot-admin")}
				className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition border border-slate-700 cursor-pointer"
			>
				⬅ ย้อนกลับหน้าแผงควบคุม
			</button>

			<div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-6">
				{/* ฟอร์มกรอกข้อมูล */}
				<div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
					<form onSubmit={handleSaveToDatabase} className="space-y-4">
						<div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
							<span className="text-[10px] font-bold text-slate-400 block uppercase">
								ข้อมูลส่วนตัวคนไข้
							</span>
							<input
								type="text"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								placeholder="ชื่อ-นามสกุล คนไข้"
								className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-teal-500"
								required
							/>
							<input
								type="number"
								value={age}
								onChange={(e) => setAge(e.target.value)}
								placeholder="อายุ (ปี)"
								className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-teal-500"
								required
							/>
						</div>
						{/* Input คะแนนต่างๆ เหมือนดีไซน์เดิม */}
						<div className="grid grid-cols-2 gap-2">
							<div>
								<label className="text-[10px] font-bold text-slate-700 block mb-1">
									Orientation (0-6)
								</label>
								<input
									type="number"
									min="0"
									max="6"
									value={scores.orientation}
									onChange={(e) =>
										handleScoreChange("orientation", Number(e.target.value))
									}
									className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1 text-center font-bold text-xs"
								/>
							</div>
							<div>
								<label className="text-[10px] font-bold text-slate-700 block mb-1">
									Registration (0-3)
								</label>
								<input
									type="number"
									min="0"
									max="3"
									value={scores.registration}
									onChange={(e) =>
										handleScoreChange("registration", Number(e.target.value))
									}
									className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1 text-center font-bold text-xs"
								/>
							</div>
							<div>
								<label className="text-[10px] font-bold text-slate-700 block mb-1">
									Attention (0-5)
								</label>
								<input
									type="number"
									min="0"
									max="5"
									value={scores.attention}
									onChange={(e) =>
										handleScoreChange("attention", Number(e.target.value))
									}
									className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1 text-center font-bold text-xs"
								/>
							</div>
							<div>
								<label className="text-[10px] font-bold text-slate-700 block mb-1">
									Calculation (0-3)
								</label>
								<input
									type="number"
									min="0"
									max="3"
									value={scores.calculation}
									onChange={(e) =>
										handleScoreChange("calculation", Number(e.target.value))
									}
									className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1 text-center font-bold text-xs"
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<div>
								<label className="text-[10px] font-bold text-slate-700 block mb-1">
									Language (0-10)
								</label>
								<input
									type="number"
									min="0"
									max="10"
									value={scores.language}
									onChange={(e) =>
										handleScoreChange("language", Number(e.target.value))
									}
									className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1 text-center font-bold text-xs"
								/>
							</div>
							<div>
								<label className="text-[10px] font-bold text-slate-700 block mb-1">
									Recall (0-3)
								</label>
								<input
									type="number"
									min="0"
									max="3"
									value={scores.recall}
									onChange={(e) =>
										handleScoreChange("recall", Number(e.target.value))
									}
									className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1 text-center font-bold text-xs"
								/>
							</div>
						</div>
						<button
							type="submit"
							className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer"
						>
							💾 บันทึกคะแนนและดูผลลัพธ์
						</button>
					</form>
				</div>

				{/* กราฟใยแมงมุม */}
				<div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
					{activePatient ? (
						<>
							<h2 className="text-lg font-black text-slate-900">
								เรดาร์ชาร์ต: {activePatient.name}
							</h2>
							<div className="w-full h-[300px] my-4">
								<ResponsiveContainer width="100%" height="100%">
									<RadarChart
										cx="50%"
										cy="50%"
										outerRadius="80%"
										data={chartData}
									>
										<PolarGrid stroke="#e2e8f0" />
										<PolarAngleAxis
											dataKey="subject"
											tick={{ fill: "#475569", fontSize: 10, fontWeight: 700 }}
										/>
										<PolarRadiusAxis angle={30} domain={[0, 100]} />
										<Radar
											name="ระดับความสามารถ (%)"
											dataKey="A"
											stroke="#4f46e5"
											fill="#818cf8"
											fillOpacity={0.4}
										/>
										<Legend />
									</RadarChart>
								</ResponsiveContainer>
							</div>
							<div className="bg-slate-900 text-slate-100 p-3 rounded-2xl text-center text-xs font-mono">
								Total Score: {activePatient.totalScore} / 30
							</div>
						</>
					) : (
						<p className="text-center text-xs text-slate-400">
							ไม่มีข้อมูลผู้ป่วยที่เลือก
						</p>
					)}
				</div>

				{/* แผงรายชื่อผู้ป่วยที่ซิงค์จาก LocalStorage */}
				<div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
					<h3 className="text-sm font-extrabold text-slate-900">
						👥 ข้อมูลคนไข้
					</h3>
					<div className="space-y-2">
						{patients.map((p) => (
							<div
								key={p.id}
								onClick={() => setSelectedPatientId(p.id)}
								className={`p-3 rounded-2xl border text-xs cursor-pointer ${selectedPatientId === p.id ? "bg-indigo-50 border-indigo-400" : "bg-slate-50"}`}
							>
								<div className="flex justify-between font-bold">
									<span>{p.name}</span>
									<span className="text-indigo-600">{p.totalScore}/30</span>
								</div>
								<div className="text-[10px] text-slate-400 mt-1">
									ภารกิจที่เสร็จแล้ว: {p.completedMissions.length} วัน
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
