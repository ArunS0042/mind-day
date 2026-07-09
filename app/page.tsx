"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	getLocalPatients,
	getCurrentSession,
	clearCurrentSession,
	PatientRecord,
} from "@/utils/storage";

// 🧠 อัปเดตเพิ่มหมวดย่อยของ Memory เข้าไปในระบบคลังข้อสอบหลัก
const EXERCISE_POOL = {
	memory_digit: {
		title: "🧠 จำตัวเลข (Digit Recall)",
		description:
			"ฝึกฝนความจำระยะสั้นขั้นสูงและการจัดลำดับข้อมูล โดยระบบจะแสดงชุดตัวเลขให้คุณจดจำและตอบให้ถูกต้อง",
		estimatedTime: "3 นาที",
		icon: "🔢",
	},
	memory_words: {
		title: "🧠 จำคำศัพท์ (Word Association)",
		description:
			"เพิ่มความสามารถในการเก็บบันทึกข้อมูลคำในสมอง จดจำกลุ่มคำศัพท์จำลองแล้วเลือกคำที่ปรากฏให้ถูกต้อง",
		estimatedTime: "3 นาที",
		icon: "📝",
	},
	memory_story: {
		title: "🧠 จำเรื่องราว (Story Retention)",
		description:
			"ฝึกสมาธิและการจับใจความสําคัญ อ่านเนื้อเรื่องหรือเหตุการณ์สั้นๆ แล้วตอบคำถามเกี่ยวกับเรื่องราวนั้น",
		estimatedTime: "4 นาที",
		icon: "📖",
	},
	attention: {
		title: "⚡ จับผิดภาพกลุ่มตัวเลข (Selective Attention)",
		description:
			"ฝึกการโฟกัสและสมาธิ ค้นหาตัวเลขโดดที่แปลกแยกออกจากกลุ่มตัวเลขที่กำหนดภายใน 60 วินาที",
		estimatedTime: "4 นาที",
		icon: "🔍",
	},
	calculation: {
		title: "🔢 ตลาดนัดนักคิด (Daily Mart Math)",
		description:
			"ฝึกการทำงานของสมองส่วนหน้าผ่านการจำลองคำนวณเงินทอนและราคาสินค้าในชีวิตประจำวัน",
		estimatedTime: "5 นาที",
		icon: "🛒",
	},
	language: {
		title: "✏️ ต่อคำเติมสำนวน (Word Completion)",
		description:
			"ฟื้นฟูทักษะด้านภาษาและการนึกคิดคำศัพท์ โดยเลือกตัวอักษรที่หายไปเพื่อประกอบเป็นคำที่มีความหมาย",
		estimatedTime: "3 นาที",
		icon: "🗣️",
	},
};

export default function PatientMainPage() {
	const router = useRouter();
	const [currentPatient, setCurrentPatient] = useState<PatientRecord | null>(
		null,
	);
	const [recommendedExercise, setRecommendedExercise] = useState<any>(null);
	const [domainKey, setDomainKey] = useState<string>("");
	const [customDomain, setCustomDomain] = useState<string | null>(null);
	const [isDoneToday, setIsDoneToday] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		// 1. ดึงข้อมูลเซสชันคนไข้ปัจจุบัน
		const userSession = getCurrentSession();
		if (!userSession) {
			router.push("/login");
			return;
		}

		// 2. ดึงข้อมูลประวัติจากฐานข้อมูลจำลอง
		const patients = getLocalPatients();
		const patient = patients.find((p) => p.tempUser === userSession);

		if (patient) {
			const scores = patient.scores;
			const scoreEntries = Object.entries(scores).map(([key, val]) => ({
				key,
				val,
			}));
			const lowest = scoreEntries.reduce(
				(min, current) => (current.val < min.val ? current : min),
				scoreEntries[0],
			);
			// หากเป้าหมายดั้งเดิมคือ memory ให้ default ไปที่ตัวย่อยอันแรก
			const targetedDomain =
				lowest.key === "memory" ? "memory_digit" : lowest.key;
			const finalDomain = customDomain || targetedDomain;

			setDomainKey(finalDomain);
			setRecommendedExercise(
				EXERCISE_POOL[finalDomain as keyof typeof EXERCISE_POOL],
			);
		}
	}, [customDomain, router]);

	useEffect(() => {
		const activeSessionUser = getCurrentSession();

		if (!activeSessionUser) {
			router.push("/login");
			return;
		}

		const patients = getLocalPatients();
		const loggedInPatient = patients.find(
			(p) => p.tempUser === activeSessionUser,
		);

		if (loggedInPatient) {
			setCurrentPatient(loggedInPatient);
			const scores = loggedInPatient.scores;
			const domainPercentages = [
				{ key: "orientation", score: (scores.orientation / 6) * 100 },
				{ key: "attention", score: (scores.attention / 5) * 100 },
				{ key: "calculation", score: (scores.calculation / 3) * 100 },
				{ key: "language", score: (scores.language / 10) * 100 },
				{
					key: "memory_digit", // ปรับการแมพคะแนนให้เข้ากับหมวดย่อยตัวแทน
					score: ((scores.registration + scores.recall) / 6) * 100,
				},
			];

			const lowest = domainPercentages.reduce((prev, current) =>
				prev.score < current.score ? prev : current,
			);
			const targetedDomain = lowest.key as keyof typeof EXERCISE_POOL;

			const finalDomain = customDomain || targetedDomain;
			setDomainKey(finalDomain);
			setRecommendedExercise(
				EXERCISE_POOL[finalDomain as keyof typeof EXERCISE_POOL],
			);

			const todayStr = new Date().toISOString().split("T")[0];
			if (loggedInPatient.completedMissions?.includes(todayStr)) {
				setIsDoneToday(true);
			}
			setIsLoading(false);
		} else {
			clearCurrentSession();
			router.push("/login");
		}
	}, []);

	const handleLogout = () => {
		clearCurrentSession();
		router.push("/login");
	};

	if (isLoading || !currentPatient || !recommendedExercise) {
		return (
			<div className="w-full min-h-screen flex items-center justify-center bg-slate-50 font-bold text-xs text-slate-400">
				กำลังตรวจสอบความปลอดภัยและจัดเตรียมระบบภารกิจเฉพาะบุคคล...
			</div>
		);
	}

	return (
		<div className="w-full max-w-none bg-slate-50 min-h-screen p-4 md:p-8 text-slate-800 antialiased">
			<div className="max-w-xl mx-auto space-y-6">
				{/* หัวเว็บและการกดออกจากระบบ */}
				<div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex justify-between items-center">
					<div className="space-y-1">
						<h1 className="text-xl font-black text-slate-900">
							สวัสดีครับ, {currentPatient.name}
						</h1>
					</div>
					<button
						onClick={handleLogout}
						className="bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 p-2.5 rounded-2xl text-xs font-bold transition shadow-3xs cursor-pointer"
					>
						ออกจากระบบ
					</button>
				</div>

				{/* บอร์ด Personalized แนะนำภารกิจจาก Cognitive Profile */}
				<div className="bg-indigo-900 text-indigo-100 p-4.5 rounded-3xl border border-indigo-950 space-y-1 shadow-xs">
					<p className="text-md leading-relaxed text-indigo-100/90 font-medium">
						คุณมีทักษะด้าน{" "}
						<span className="text-white font-black underline">{domainKey}</span>{" "}
						ที่ควรเน้นย้ำ
					</p>
				</div>

				{/* บัตร Task ประจำวัน */}
				<div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xs space-y-5 text-center relative overflow-hidden pt-12">
					{/* ป้าย Focus อยู่ขวาบนเหมือนเดิม */}
					<div className="absolute top-4 right-4 bg-amber-50 text-amber-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-amber-200">
						Focus: {domainKey}
					</div>

					{/* ย้ายป้าย Daily Task มาไว้ที่ซ้ายบน */}
					<div className="absolute top-4 left-4">
						<span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
							ภารกิจฝึกสมองวันนี้ (Daily Task)
						</span>
					</div>

					<div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl border border-slate-100">
						{recommendedExercise.icon}
					</div>

					<div className="space-y-2">
						<h2 className="text-lg font-black text-slate-900 pt-1">
							{recommendedExercise.title}
						</h2>
						<p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">
							{recommendedExercise.description}
						</p>
					</div>

					<hr className="border-slate-100" />

					<button
						onClick={() => router.push(`/mission?domain=${domainKey}`)}
						className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm py-4 rounded-2xl transition-all shadow-md shadow-emerald-100 cursor-pointer active:scale-98"
					>
						เริ่มทำแบบฝึกหัด ➔
					</button>
				</div>

				{/* ส่วนของ Timeline แยกออกมาต่างหาก */}
				<div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
					<div className="flex justify-between items-end">
						<h3 className="text-sm font-black text-slate-900">
							Progress Timeline
						</h3>
						<span className="text-[10px] font-bold text-slate-400">
							Streak: 3 วันต่อเนื่อง
						</span>
					</div>

					<div className="flex items-center gap-3">
						{/* แสดงสถานะย้อนหลัง 4 วัน */}
						<div className="flex-1 flex flex-col items-center gap-2">
							<div className="w-full h-2 bg-emerald-500 rounded-full"></div>
							<span className="text-[9px] font-bold text-emerald-600">จ.</span>
						</div>
						<div className="flex-1 flex flex-col items-center gap-2">
							<div className="w-full h-2 bg-emerald-500 rounded-full"></div>
							<span className="text-[9px] font-bold text-emerald-600">อ.</span>
						</div>
						<div className="flex-1 flex flex-col items-center gap-2">
							<div className="w-full h-2 bg-emerald-500 rounded-full"></div>
							<span className="text-[9px] font-bold text-emerald-600">พ.</span>
						</div>
						<div className="flex-1 flex flex-col items-center gap-2">
							<div className="w-full h-2 bg-slate-200 rounded-full animate-pulse"></div>
							<span className="text-[9px] font-bold text-slate-400">
								วันนี้
							</span>
						</div>
					</div>
				</div>

				{/* แผงปุ่มจำลองการเลือกจุดอ่อน (เพิ่มปุ่มสลับหมวดย่อยของความจำครบทั้ง 3 แบบ) */}
				<div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-3xs space-y-3 text-left">
					<div className="flex items-center gap-2">
						<span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
						<h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
							ตัวเลือกจำลอง Profile คนไข้แต่ละโรค (สลับหมวดแนะนำของ AI)
						</h3>
					</div>
					<div className="flex flex-wrap gap-1.5">
						{[
							"memory_digit",
							"memory_words",
							"memory_story",
							"attention",
							"calculation",
							"language",
						].map((key) => (
							<button
								key={key}
								onClick={() => setCustomDomain(key)}
								className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
									domainKey === key
										? "bg-indigo-600 text-white border-indigo-700"
										: "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
								}`}
							>
								🎯 จำลองจุดอ่อนด้าน: {key}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
