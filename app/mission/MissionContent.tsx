"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	getLocalPatients,
	saveLocalPatients,
	getCurrentSession,
} from "@/utils/storage";
import { MISSION_POOL, getDynamicAnswers } from "./missionData";

// =================================================================
// 1. ฟังก์ชันช่วยวิเคราะห์พัฒนาการสมอง (Cognitive Progress Analysis)
// =================================================================
const calculateProgress = (correct: number, total: number) => {
	const accuracy = (correct / total) * 100;
	if (accuracy >= 80) {
		return {
			label: "พัฒนาการยอดเยี่ยม",
			color: "text-emerald-500",
			bg: "bg-emerald-500",
			border: "border-emerald-500/30",
			emoji: "🌟",
			feedback:
				"สมองของคุณทำงานและประมวลผลได้อย่างยอดเยี่ยมในวันนี้! รักษาความสม่ำเสมอในการฝึกฝนทุกวันแบบนี้นะครับ",
		};
	}
	if (accuracy >= 50) {
		return {
			label: "อยู่ในเกณฑ์ดี กำลังพัฒนา",
			color: "text-amber-400",
			bg: "bg-amber-400",
			border: "border-amber-400/30",
			emoji: "📈",
			feedback:
				"คุณทำได้ดีเลยทีเดียว! สมองกำลังสร้างจุดเชื่อมต่อใหม่ๆ ลองฝึกหมวดนี้ซ้ำอีกรอบเพื่อเพิ่มความแม่นยำนะครับ",
		};
	}
	return {
		label: "ควรฝึกฝนหมวดนี้เพิ่มเติม",
		color: "text-rose-400",
		bg: "bg-rose-500",
		border: "border-rose-500/30",
		emoji: "💪",
		feedback:
			"ไม่ต้องกังวลไปนะครับ การฝึกสมองต้องใช้เวลา ลองตั้งสมาธิและค่อยๆ ทำแบบฝึกหัดนี้ใหม่อีกครั้ง พรุ่งนี้จะดีขึ้นแน่นอน!",
	};
};

// =================================================================
// 2. MAIN COMPONENT
// =================================================================
export default function MissionContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// ดึงหมวดฝึกฝนจาก URL (หากไม่มีจะ Default เป็นจำตัวเลข memory_digit)
	const initialDomain = searchParams.get("domain") || "memory_digit";
	const [selectedDomain, setSelectedDomain] = useState<string>(initialDomain);

	// --- STATES สำหรับระบบชุดข้อสอบ 5 ข้อ ---
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const [correctCount, setCorrectCount] = useState<number>(0);
	const [wrongCount, setWrongCount] = useState<number>(0);
	const [selectedAnswer, setSelectedAnswer] = useState<string>("");
	const [isFinished, setIsFinished] = useState<boolean>(false);
	
	// ใช้ attemptKey เพื่อบังคับให้สุ่มตัวเลือกใหม่เมื่อกด "เล่นซ้ำ"
	const [attemptKey, setAttemptKey] = useState<number>(0);

	// --- STATES จับเวลา และระบบซ่อนโจทย์ความจำ ---
	const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
	const [showNumbers, setShowNumbers] = useState<boolean>(true);
	const [countdown, setCountdown] = useState<number>(5);

	// ตรวจสอบว่าเป็นหมวดหมู่ความจำหรือไม่
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

	// =================================================================
	// 3. ระบบคำนวณและสุ่มตัวเลือก (ใช้ useMemo เพื่อไม่ให้ตัวเลือกสลับไปมาระหว่างเวลาเดิน)
	// =================================================================
	const { displayOptions, correctAnswer } = useMemo(() => {
		let options = currentQuestion.options;
		let correct = currentQuestion.correct;

		if (currentQuestion.isDynamic) {
			const dynamicData = getDynamicAnswers(currentQuestion.correct);
			correct = dynamicData.correct;
			options = Array.from(new Set(dynamicData.formattedOptions));
			if (!options.includes(correct)) {
				options[3] = correct;
			}
		}

		// อัลกอริทึมสุ่มตำแหน่ง Array (Fisher-Yates Shuffle)
		const shuffledOptions = [...options];
		for (let i = shuffledOptions.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffledOptions[i], shuffledOptions[j]] = [
				shuffledOptions[j],
				shuffledOptions[i],
			];
		}

		return { displayOptions: shuffledOptions, correctAnswer: correct };
	}, [currentIndex, selectedDomain, currentQuestion, attemptKey]);

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

	// ฟังก์ชันบันทึกและไปข้อถัดไป
	const handleNextQuestion = () => {
		if (selectedAnswer === correctAnswer) {
			setCorrectCount((prev) => prev + 1);
		} else {
			setWrongCount((prev) => prev + 1);
		}

		if (currentIndex + 1 < totalQuestions) {
			setCurrentIndex((prev) => prev + 1);
		} else {
			// บันทึกความสำเร็จลง LocalStorage
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
		setAttemptKey((prev) => prev + 1); // บังคับให้ระบบสุ่มตัวเลือกใหม่เมื่อเล่นซ้ำ
	};

	// คำนวณค่า Progress สำหรับหน้าแสดงผลลัพธ์
	const progress = calculateProgress(correctCount, totalQuestions);

	return (
		<div className="min-h-screen w-full flex items-center justify-center p-4">
			<div className="w-full max-w-xl bg-white rounded-3xl p-6 md:p-8 shadow-md border border-slate-200 space-y-6">
				{!isFinished ? (
					// =========================================================
					// 📝 โหมดกำลังทำแบบฝึกหัด (In Progress)
					// =========================================================
					<>
						{/* Header แจ้งชื่อหมวดและข้อปัจจุบัน */}
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

						{/* แสดงรูปโจทย์ (เช่น โหมด Calculation) โดย "ไม่แสดง" ในหมวด Attention */}
						{currentQuestion.imageSet && selectedDomain !== "attention" && (
							<div className="flex flex-wrap justify-center gap-3">
								{currentQuestion.imageSet.map((img, idx) => (
									<div
										key={idx}
										className="bg-slate-50 p-1.5 rounded-xl border border-slate-200"
									>
										<img
											src={img}
											alt={`Question visual ${idx}`}
											className="h-16 md:h-20 w-auto object-contain"
										/>
									</div>
								))}
							</div>
						)}

						{/* กล่องแสดงเนื้อหาโจทย์: พื้นหลังสีขาว ขอบเทา และตัวอักษรสีดำ */}
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

						{/* ส่วนแสดงตัวเลือก 4 ช้อยส์ */}
						{!isMemoryDomain || !showNumbers ? (
							<div className="grid grid-cols-2 gap-3 md:gap-4">
								{displayOptions.map((opt, index) => {
									const isImageOption =
										typeof opt === "string" &&
										(opt.includes(".png") || opt.includes(".jpg"));

									return (
										<button
											// ใช้ opt ร่วมกับ index เป็น key เพื่อให้ตัวเลือกรูปซ้ำไม่เกิด Error
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
							/* ข้อความแสดงระหว่างรอเฟสคำถาม */
							<div className="text-center py-10 text-sm text-slate-500 font-bold bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
								{selectedDomain === "attention"
									? "🔍 โปรดสังเกตและเลือกภาพที่แตกต่างจากกลุ่ม"
									: "🧠 กรุณาตั้งใจจดจำข้อมูลด้านบน..."}
							</div>
						)}

						{/* ปุ่มบันทึกและไปข้อถัดไป */}
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
					// =========================================================
					// 📊 โหมดวิเคราะห์พัฒนาการและสรุปผล (Analysis & Progress)
					// =========================================================
					<div className="text-center space-y-6 py-2">
						<div className="space-y-2">
							<h2 className="text-2xl font-black text-slate-900">
								ทำแบบฝึกหัดเสร็จสิ้น!
							</h2>
						</div>

						{/* กล่องวิเคราะห์พัฒนาการสมอง (Cognitive Analysis Box) */}
						<div
							className={`bg-slate-900 rounded-3xl p-6 text-white space-y-4 border ${progress.border} text-left shadow-lg`}
						>
							<div className="flex items-center justify-between border-b border-slate-800 pb-3">
								<span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
									การวิเคราะห์ระดับพัฒนาการ
								</span>
								<span className="text-xs font-bold bg-slate-800 px-2.5 py-1 rounded-full text-slate-300">
									ความแม่นยำ{" "}
									{((correctCount / totalQuestions) * 100).toFixed(0)}%
								</span>
							</div>

							<div className="flex items-center gap-4 pt-1">
								<div className="text-5xl flex-shrink-0 bg-slate-800/80 w-16 h-16 rounded-2xl flex items-center justify-center border border-slate-700/50">
									{progress.emoji}
								</div>
								<div>
									<div
										className={`font-black text-lg md:text-xl ${progress.color}`}
									>
										{progress.label}
									</div>
									<div className="text-xs text-slate-400 mt-0.5">
										ทำถูกต้อง {correctCount} จากทั้งหมด {totalQuestions} ข้อ
									</div>
								</div>
							</div>

							{/* Progress Bar แสดงระดับ */}
							<div className="space-y-1 pt-2">
								<div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
									<div
										className={`h-full ${progress.bg} rounded-full transition-all duration-1000`}
										style={{
											width: `${(correctCount / totalQuestions) * 100}%`,
										}}
									/>
								</div>
							</div>

							<p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80 font-medium">
								"{progress.feedback}"
							</p>
						</div>

						{/* สถิติเวลา */}
						<div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex justify-between items-center px-6">
							<span className="text-xs font-bold text-slate-500 uppercase">
								⏱️ ระยะเวลาที่ใช้ฝึกฝนโดยรวม
							</span>
							<span className="text-sm font-black text-slate-800">
								{formatTime(secondsElapsed)}
							</span>
						</div>

						<hr className="border-slate-100" />

						{/* ปุ่มควบคุมระบบตอนจบ */}
						<div className="space-y-3 pt-1">
							<button
								onClick={() => router.push("/")}
								className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm py-4 rounded-xl transition shadow-md shadow-emerald-100 cursor-pointer active:scale-[0.99]"
							>
								🏁 กลับไปหน้าแรก (Dashboard)
							</button>
							<button
								onClick={() => handleResetChallenge(selectedDomain)}
								className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-sm py-3.5 rounded-xl transition cursor-pointer"
							>
								🔄 เล่นหมวดนี้ซ้ำอีกรอบเพื่อฝึกสมอง
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
