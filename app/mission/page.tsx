"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	getLocalPatients,
	saveLocalPatients,
	getCurrentSession,
	PatientRecord,
} from "@/utils/storage";
import { MISSION_POOL, getDynamicAnswers } from "./missionData";

export default function MissionPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// ดึงหมวดฝึกฝนจาก URL (หากไม่มีจะ Default เป็นจำตัวเลข memory_digit)
	const initialDomain = searchParams.get("domain") || "memory_digit";
	const [selectedDomain, setSelectedDomain] = useState<string>(initialDomain);

	// --- STATES สำหรับระบบชุดข้อสอบ 5 ข้อ ---
	const [currentIndex, setCurrentIndex] = useState<number>(0); // ข้อปัจจุบัน (0-4)
	const [correctCount, setCorrectCount] = useState<number>(0); // จำนวนข้อที่ตอบถูก
	const [wrongCount, setWrongCount] = useState<number>(0); // จำนวนข้อที่ตอบผิด
	const [selectedAnswer, setSelectedAnswer] = useState<string>("");
	const [isFinished, setIsFinished] = useState<boolean>(false); // จบครบ 5 ข้อหรือยัง

	// --- STATES จับเวลา และซ่อนโจทย์ ---
	const [secondsElapsed, setSecondsElapsed] = useState<number>(0); // เวลาทั้งหมดที่ใช้ไป
	const [showNumbers, setShowNumbers] = useState<boolean>(true); // ควบคุมการสลับเฟส (จดจำ vs ตอบคำถาม)
	const [countdown, setCountdown] = useState<number>(5); // นับถอยหลังจำโจทย์ (5 วินาที)

	// ตรวจสอบว่าเป็นหมวดหมู่ความจำย่อยหรือไม่
	const isMemoryDomain = [
		"memory",
		"memory_digit",
		"memory_words",
		"memory_story",
	].includes(selectedDomain);

	const currentCategory =
		MISSION_POOL[selectedDomain] || MISSION_POOL.memory_digit;
	const totalQuestions = currentCategory.questions.length;
	const currentQuestion = currentCategory.questions[currentIndex];

	// คำนวณตัวเลือกและคำตอบจริง
	let displayOptions = currentQuestion.options;
	let correctAnswer = currentQuestion.correct;

	if (currentQuestion.isDynamic) {
		const dynamicData = getDynamicAnswers(currentQuestion.correct);
		correctAnswer = dynamicData.correct;
		displayOptions = Array.from(new Set(dynamicData.formattedOptions));
		if (!displayOptions.includes(correctAnswer))
			displayOptions[3] = correctAnswer;
	}

	// 1. ตัวจับเวลาโดยรวมทั้งหมดของการทำแบบฝึกหัดเซ็ตนี้
	useEffect(() => {
		if (isFinished) return;
		const globalTimer = setInterval(() => {
			setSecondsElapsed((prev) => prev + 1);
		}, 1000);
		return () => clearInterval(globalTimer);
	}, [isFinished]);

	// 2. ตัวรีเซ็ตสถานะเมื่อเลื่อนผ่านแต่ละข้อ หรือเปลี่ยนหมวด
	useEffect(() => {
		setSelectedAnswer("");
		if (isMemoryDomain) {
			setShowNumbers(true);
			setCountdown(5);
		} else {
			setShowNumbers(true);
		}
	}, [currentIndex, selectedDomain]);

	// 3. ตัวนับถอยหลัง 5 วินาทีเพื่อซ่อนข้อมูลจำและเปิดเฟสคำถาม
	useEffect(() => {
		if (!isMemoryDomain || countdown <= 0) {
			if (countdown === 0) setShowNumbers(false);
			return;
		}
		const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
		return () => clearTimeout(timer);
	}, [countdown, selectedDomain]);

	const handleNextQuestion = () => {
		if (selectedAnswer === correctAnswer) {
			setCorrectCount((prev) => prev + 1);
		} else {
			setWrongCount((prev) => prev + 1);
		}

		if (currentIndex + 1 < totalQuestions) {
			setCurrentIndex((prev) => prev + 1);
		} else {
			const todayStr = new Date().toISOString().split("T")[0];
			const userSession = getCurrentSession();
			const patients = getLocalPatients();

			const updatedPatients = patients.map((p) => {
				if (p.tempUser === userSession) {
					const currentMissions = p.completedMissions || [];
					return {
						...p,
						completedMissions: currentMissions.includes(todayStr)
							? currentMissions
							: [...currentMissions, todayStr],
					};
				}
				return p;
			});
			saveLocalPatients(updatedPatients);
			setIsFinished(true);
		}
	};

	const formatTime = (totalSeconds: number) => {
		const mins = Math.floor(totalSeconds / 60);
		const secs = totalSeconds % 60;
		return `${mins} นาที ${secs} วินาที`;
	};

	const handleResetChallenge = (domainKey: string) => {
		setSelectedDomain(domainKey);
		setCurrentIndex(0);
		setCorrectCount(0);
		setWrongCount(0);
		setSecondsElapsed(0);
		setIsFinished(false);
	};

	return (
		<div className="w-full max-w-none bg-slate-50 min-h-screen p-4 md:p-8 text-slate-800 antialiased flex flex-col items-center justify-center gap-6">
			{/* บอร์ดแสดงผลแอปพลิเคชัน */}
			<div className="w-full max-w-xl bg-white rounded-3xl p-6 md:p-8 shadow-md border border-slate-200 space-y-6">
				{!isFinished ? (
					// ==========================================
					// 📝 โหมดกำลังทำแบบฝึกหัด (In Progress)
					// ==========================================
					<>
						<div className="flex justify-between items-center border-b border-slate-100 pb-3">
							<span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-black uppercase">
								📌 {currentCategory.name}
							</span>
							<span className="text-xs font-black text-indigo-600 bg-slate-100 px-3 py-1.5 rounded-lg">
								ข้อที่ {currentIndex + 1} / {totalQuestions}
							</span>
						</div>

						{/* แถบแจ้งเตือนเวลานับถอยหลังในหมวดความจำ */}
						{isMemoryDomain && showNumbers && (
							<div className="w-full bg-amber-50 border border-amber-200 text-amber-800 text-center py-2.5 rounded-xl text-sm font-black animate-pulse">
								⏱️ โปรดตั้งสมาธิจำข้อมูล! คำถามจะปรากฏในอีก {countdown} วินาที
							</div>
						)}

						{/* แสดงรูปโจทย์ (ถ้ามี) และ ไม่ใช่หมวด Attention */}
						{currentQuestion.imageSet && selectedDomain !== "attention" && (
							<div className="flex flex-wrap justify-center gap-3">
								{currentQuestion.imageSet.map((img, idx) => (
									<div key={idx}>
										<img
											src={img}
											alt={`Question visual ${idx}`}
											className="h-16 md:h-20 w-auto object-contain"
										/>
									</div>
								))}
							</div>
						)}

						{/* กล่องแสดงเนื้อหาโจทย์ (ปรับพื้นหลังเป็นขาวและตัวอักษรเป็นดำ/เทาเข้ม) */}
						<div className="w-full bg-white text-slate-900 border-2 border-slate-200 font-black text-base md:text-lg p-6 md:p-8 rounded-2xl text-center whitespace-pre-line leading-relaxed shadow-sm min-h-[150px] flex items-center justify-center">
							{isMemoryDomain ? (
								showNumbers ? (
									<div>
										<div className="text-xl md:text-2xl text-slate-900 font-extrabold">
											{currentQuestion.memorizeText}
										</div>
									</div>
								) : (
									<div>
										<div className="text-base md:text-lg text-slate-900 font-black">
											{currentQuestion.questionText}
										</div>
									</div>
								)
							) : (
								currentQuestion.question
							)}
						</div>

						{/* ส่วนแสดงตัวเลือก */}
						{!isMemoryDomain || !showNumbers ? (
							<div className="grid grid-cols-2 gap-3 md:gap-4">
								{displayOptions.map((opt, index) => {
									const isImageOption =
										typeof opt === "string" &&
										(opt.includes(".png") || opt.includes(".jpg"));

									return (
										<button
											// ใช้ index เป็น key แทน opt เพื่อแก้ปัญหาตัวเลือกซ้ำกัน
											key={`${opt}-${index}`}
											onClick={() => setSelectedAnswer(opt)}
											className={`w-full p-3 md:p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
												selectedAnswer === opt
													? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20"
													: "bg-white border-slate-200 hover:bg-slate-50"
											}`}
										>
											{isImageOption ? (
												<img
													src={opt}
													alt="Option"
													className="h-16 md:h-20 w-auto object-contain"
												/>
											) : (
												<span className="text-sm md:text-base font-black text-slate-700">
													{opt}
												</span>
											)}
										</button>
									);
								})}
							</div>
						) : (
							<div className="text-center py-10 text-sm text-slate-600 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-300">
								{selectedDomain === "attention"
									? "🔍 โปรดสังเกตและเลือกภาพที่แตกต่างจากกลุ่ม"
									: "🧠 กรุณาจดจำข้อมูลด้านบน..."}
							</div>
						)}

						{/* ปุ่มส่งคำตอบ */}
						<button
							onClick={handleNextQuestion}
							disabled={!selectedAnswer || (isMemoryDomain && showNumbers)}
							className="w-full bg-indigo-600 disabled:bg-slate-200 text-white font-black text-sm py-4 rounded-xl transition shadow-xs cursor-pointer text-center active:scale-[0.99]"
						>
							{currentIndex + 1 === totalQuestions
								? "🏁 ส่งคำตอบข้อสุดท้ายและดูผลสรุป"
								: "บันทึกและไปข้อถัดไป ➔"}
						</button>
					</>
				) : (
					// ==========================================
					// 🏆 โหมดแดชบอร์ดสรุปผลลัพธ์การฝึก (Score Summary)
					// ==========================================
					<div className="text-center space-y-6 py-2">
						<div className="space-y-2">
							<div className="text-5xl mx-auto">🎉</div>
							<h2 className="text-xl font-black text-slate-900">
								บันทึกกิจกรรมสำเร็จ!
							</h2>
						</div>

						<hr className="border-slate-100" />

						{/* รายงานคะแนนและสถิติเวลา */}
						<div className="grid grid-cols-2 gap-4">
							<div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl text-center">
								<span className="text-xs font-bold block text-emerald-600 uppercase mb-1">
									ตอบถูกต้อง
								</span>
								<span className="text-3xl font-black text-emerald-700">
									{correctCount}
								</span>
								<span className="text-xs font-bold text-emerald-600 block mt-0.5">
									ข้อ
								</span>
							</div>
							<div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl text-center">
								<span className="text-xs font-bold block text-rose-600 uppercase mb-1">
									ตอบผิดพลาด
								</span>
								<span className="text-3xl font-black text-rose-700">
									{wrongCount}
								</span>
								<span className="text-xs font-bold text-rose-600 block mt-0.5">
									ข้อ
								</span>
							</div>
							<div className="col-span-2 bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
								<span className="text-xs font-bold block text-slate-400 uppercase mb-1">
									ระยะเวลาที่ใช้ฝึกฝน
								</span>
								<span className="text-base font-black text-slate-700">
									{formatTime(secondsElapsed)}
								</span>
							</div>
						</div>

						<hr className="border-slate-100" />

						{/* ปุ่มควบคุมระบบตอนจบ */}
						<div className="space-y-3">
							<button
								onClick={() => router.push("/")}
								className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm py-4 rounded-xl transition shadow-xs cursor-pointer"
							>
								🏁 กลับไปหน้าแรก (Dashboard)
							</button>
							<button
								onClick={() => handleResetChallenge(selectedDomain)}
								className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-sm py-3.5 rounded-xl transition cursor-pointer"
							>
								🔄 เล่นหมวดนี้ซ้ำอีกรอบ
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
