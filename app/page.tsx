"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	getLocalPatients,
	getCurrentSession,
	clearCurrentSession,
	PatientRecord,
} from "@/utils/storage";

// 🧠 ปรับคำอธิบายให้สั้น กระชับ อ่านง่าย และใหญ่ขึ้น
const EXERCISE_POOL = {
	memory_digit: {
		title: "จำตัวเลข",
		description: "จดจำและจัดลำดับชุดตัวเลขให้ถูกต้อง",
		estimatedTime: "3 นาที",
		icon: "🔢",
	},
	memory_words: {
		title: "จำคำศัพท์",
		description: "จดจำกลุ่มคำศัพท์และเลือกคำที่ถูกต้อง",
		estimatedTime: "3 นาที",
		icon: "📝",
	},
	memory_story: {
		title: "จำเรื่องราว",
		description: "อ่านเรื่องราวสั้นๆ และตอบคำถาม",
		estimatedTime: "4 นาที",
		icon: "📖",
	},
	attention: {
		title: "จับผิดภาพ",
		description: "หาตัวเลขหรือภาพที่ต่างจากพวก",
		estimatedTime: "4 นาที",
		icon: "🔍",
	},
	calculation: {
		title: "คิดเลข ซื้อของ",
		description: "ฝึกสมองด้วยการจำลองการคิดเงิน",
		estimatedTime: "5 นาที",
		icon: "🛒",
	},
	language: {
		title: "เติมคำสำนวน",
		description: "เลือกตัวอักษรมาเติมเป็นคำที่มีความหมาย",
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
		const userSession = getCurrentSession();
		if (!userSession) {
			router.push("/login");
			return;
		}

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
					key: "memory_digit",
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
			<div className="w-full min-h-screen flex items-center justify-center bg-slate-100 font-black text-3xl text-slate-500 p-8 text-center leading-relaxed">
				กำลังเตรียมบททดสอบ...
			</div>
		);
	}

	return (
		<div className="w-full max-w-none bg-slate-100 min-h-screen p-4 md:p-8 text-slate-800 antialiased flex flex-col items-center">
			<div className="w-full max-w-3xl space-y-8 md:space-y-10">
				
				{/* 1. หัวเว็บและการกดออกจากระบบ */}
				<div className="bg-white rounded-[2rem] p-8 border-4 border-slate-200 shadow-sm flex justify-between items-center">
					<div>
						<h1 className="text-4xl md:text-5xl font-black text-slate-900">
							สวัสดี, <span className="text-indigo-600">{currentPatient.name.split(' ')[0]}</span>
						</h1>
					</div>
					<button
						onClick={handleLogout}
						className="bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 px-6 py-4 rounded-2xl text-xl md:text-2xl font-black transition cursor-pointer active:scale-95"
					>
						ออก
					</button>
				</div>

				{/* 2. บอร์ด Personalized แนะนำภารกิจ (ขยายใหญ่ขึ้น) */}
				<div className="bg-indigo-900 text-indigo-100 p-8 rounded-[2rem] border-4 border-indigo-950 shadow-lg text-center md:text-left">
					<p className="text-2xl md:text-4xl leading-snug font-bold">
						ควรเน้นฝึกทักษะ: <br className="block md:hidden" />
						<span className="text-white font-black bg-indigo-700 px-4 py-2 rounded-2xl md:ml-2 mt-4 md:mt-0 inline-block border-2 border-indigo-500 shadow-sm uppercase">
							{domainKey}
						</span>
					</p>
				</div>

				{/* 3. บัตร Task ประจำวัน (จุดสนใจหลัก ขนาดยักษ์) */}
				<div className="bg-white rounded-[2.5rem] p-8 md:p-12 border-4 border-slate-200 shadow-xl space-y-8 text-center relative overflow-hidden">
					<div className="mx-auto w-32 h-32 md:w-40 md:h-40 bg-slate-50 rounded-full flex items-center justify-center text-7xl md:text-8xl border-8 border-slate-100 shadow-inner">
						{recommendedExercise.icon}
					</div>

					<div className="space-y-4 md:space-y-6">
						<h2 className="text-5xl md:text-6xl font-black text-slate-900">
							{recommendedExercise.title}
						</h2>
					</div>

					<hr className="border-4 border-slate-50 rounded-full my-8" />

					{/* ปุ่มเริ่มภารกิจขนาดยักษ์ แตะง่าย */}
					<button
						onClick={() => router.push(`/mission?domain=${domainKey}`)}
						className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-4xl md:text-5xl py-8 md:py-10 rounded-[2.5rem] transition-all shadow-2xl shadow-emerald-200 cursor-pointer active:scale-95 flex items-center justify-center gap-4"
					>
						เริ่มฝึก ➔
					</button>
				</div>

				{/* 4. ส่วนของ Timeline ประวัติการฝึกฝน */}
				<div className="bg-white rounded-[2rem] p-8 md:p-10 border-4 border-slate-200 shadow-sm space-y-8">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<h3 className="text-3xl md:text-4xl font-black text-slate-900">
							ประวัติการฝึก
						</h3>
						<span className="text-xl md:text-2xl font-black text-emerald-700 bg-emerald-100 px-6 py-3 rounded-2xl border-2 border-emerald-200">
							🔥 ติดต่อกัน: 3 วัน
						</span>
					</div>

					<div className="flex items-center justify-between gap-4 pt-4">
						{/* แสดงสถานะย้อนหลัง */}
						<div className="flex-1 flex flex-col items-center gap-4">
							<div className="w-full h-4 md:h-6 bg-emerald-500 rounded-full shadow-inner"></div>
							<span className="text-2xl font-black text-emerald-700">จ.</span>
						</div>
						<div className="flex-1 flex flex-col items-center gap-4">
							<div className="w-full h-4 md:h-6 bg-emerald-500 rounded-full shadow-inner"></div>
							<span className="text-2xl font-black text-emerald-700">อ.</span>
						</div>
						<div className="flex-1 flex flex-col items-center gap-4">
							<div className="w-full h-4 md:h-6 bg-emerald-500 rounded-full shadow-inner"></div>
							<span className="text-2xl font-black text-emerald-700">พ.</span>
						</div>
						<div className="flex-1 flex flex-col items-center gap-4">
							<div className="w-full h-4 md:h-6 bg-slate-200 rounded-full animate-pulse border-2 border-slate-300"></div>
							<span className="text-2xl font-black text-slate-500">วันนี้</span>
						</div>
					</div>
				</div>

				{/* 5. แผงปุ่มจำลองการเลือกโหมด (Therapist Mode) */}
				<div className="bg-white rounded-[2rem] p-8 border-4 border-slate-200 shadow-sm space-y-6 text-left opacity-90 hover:opacity-100 transition-opacity">
					<div className="flex items-center gap-4 border-b-4 border-slate-100 pb-4">
						<span className="flex h-5 w-5 rounded-full bg-indigo-600 animate-pulse"></span>
						<h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-wider">
							โหมดนักบำบัด (เลือกหมวด)
						</h3>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
								className={`px-4 py-5 rounded-2xl text-xl md:text-2xl font-black border-4 transition cursor-pointer active:scale-95 ${
									domainKey === key
										? "bg-indigo-600 text-white border-indigo-700 shadow-md"
										: "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300"
								}`}
							>
								{key.split("_")[0]}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}	
