"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	getLocalPatients,
	saveLocalPatients,
	getCurrentSession,
} from "@/utils/storage";
import { MISSION_POOL, getDynamicAnswers } from "./missionData";

const calculateProgress = (correct: number, total: number) => {
	const accuracy = (correct / total) * 100;
	if (accuracy >= 80) {
		return {
			label: "ยอดเยี่ยม!",
			color: "text-emerald-600",
			bg: "bg-emerald-500",
			border: "border-emerald-500",
			emoji: "🌟",
			feedback: "สมองทำงานได้ดีมาก รักษาความสม่ำเสมอนะครับ",
		};
	}
	if (accuracy >= 50) {
		return {
			label: "ทำได้ดี",
			color: "text-amber-500",
			bg: "bg-amber-400",
			border: "border-amber-400",
			emoji: "📈",
			feedback: "กำลังพัฒนาได้ดี ลองฝึกอีกนิดจะแม่นยำขึ้นครับ",
		};
	}
	return {
		label: "พยายามอีกนิด",
		color: "text-rose-500",
		bg: "bg-rose-500",
		border: "border-rose-500",
		emoji: "💪",
		feedback: "ไม่ต้องรีบครับ ค่อยๆ ฝึกฝนใหม่ พรุ่งนี้จะดีขึ้นแน่นอน",
	};
};

export default function MissionContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const initialDomain = searchParams.get("domain") || "memory_digit";
	const [selectedDomain, setSelectedDomain] = useState<string>(initialDomain);

	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const [correctCount, setCorrectCount] = useState<number>(0);
	const [wrongCount, setWrongCount] = useState<number>(0);
	const [selectedAnswer, setSelectedAnswer] = useState<string>("");
	const [isFinished, setIsFinished] = useState<boolean>(false);
	
	// ใช้ attemptKey เพื่อบังคับให้ระบบสุ่มโจทย์ใหม่เมื่อกดเล่นซ้ำ
	const [attemptKey, setAttemptKey] = useState<number>(0);

	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
	const [showNumbers, setShowNumbers] = useState<boolean>(true);
	const [countdown, setCountdown] = useState<number>(5);

	const isMemoryDomain = [
		"memory",
		"memory_digit",
		"memory_words",
		"memory_story",
	].includes(selectedDomain);

	const currentCategory =
		MISSION_POOL[selectedDomain] || MISSION_POOL.memory_digit;

	// =================================================================
	// 🌟 ALGORITHM: สุ่มลำดับ "คำถาม" (Randomize Questions)
	// =================================================================
	const randomizedQuestions = useMemo(() => {
		// คัดลอก Array คำถามออกมาเพื่อไม่ให้กระทบข้อมูลต้นฉบับ
		const questions = [...currentCategory.questions];
		
		// Fisher-Yates Shuffle Algorithm (สลับตำแหน่งข้อมูลใน Array)
		for (let i = questions.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[questions[i], questions[j]] = [questions[j], questions[i]];
		}
		
		return questions;
	}, [selectedDomain, attemptKey]); // จะสุ่มใหม่ก็ต่อเมื่อ เปลี่ยนหมวด หรือ กดเล่นซ้ำ

	// ดึงข้อมูลข้อปัจจุบันจาก Array ที่ถูกสุ่มมาแล้ว
	const totalQuestions = randomizedQuestions.length;
	const currentQuestion = randomizedQuestions[currentIndex];

	// =================================================================
	// 🌟 ALGORITHM: สุ่มลำดับ "ตัวเลือก" (Randomize Options) ของข้อนั้นๆ
	// =================================================================
	const { displayOptions, correctAnswer } = useMemo(() => {
		// ป้องกัน Error กรณี Component โหลดก่อนข้อมูล
		if (!currentQuestion) return { displayOptions: [], correctAnswer: "" };

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

		// Fisher-Yates Shuffle สำหรับสลับตำแหน่งปุ่มตัวเลือก
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

	useEffect(() => {
		if (isFinished) return;
		const globalTimer = setInterval(() => {
			setSecondsElapsed((prev) => prev + 1);
		}, 1000);
		return () => clearInterval(globalTimer);
	}, [isFinished]);

	useEffect(() => {
		setSelectedAnswer("");
		if (isMemoryDomain) {
			setShowNumbers(true);
			setCountdown(5);
		} else {
			setShowNumbers(true);
		}
	}, [currentIndex, selectedDomain]);

	useEffect(() => {
		if (!isMemoryDomain || countdown <= 0) {
			if (countdown === 0) setShowNumbers(false);
			return;
		}
		const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
		return () => clearTimeout(timer);
	}, [countdown, selectedDomain]);

	const handleAnswerSelect = (answer: string) => {
		if (isProcessing) return;
		setIsProcessing(true);
		setSelectedAnswer(answer); 

		setTimeout(() => {
			if (answer === correctAnswer) {
				setCorrectCount((prev) => prev + 1);
			} else {
				setWrongCount((prev) => prev + 1);
			}

			if (currentIndex + 1 < totalQuestions) {
				setCurrentIndex((prev) => prev + 1);
				setSelectedAnswer("");
				setIsProcessing(false);
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
				setIsProcessing(false);
			}
		}, 300);
	};

	const formatTime = (totalSeconds: number) => {
		const mins = Math.floor(totalSeconds / 60);
		const secs = totalSeconds % 60;
		return `${mins} นาที ${secs} วิ`;
	};

	const handleResetChallenge = (domainKey: string) => {
		setSelectedDomain(domainKey);
		setCurrentIndex(0);
		setCorrectCount(0);
		setWrongCount(0);
		setSecondsElapsed(0);
		setIsFinished(false);
		// การบวก attemptKey จะไปกระตุ้น useMemo ให้สุ่มคำถามชุดใหม่ทันที!
		setAttemptKey((prev) => prev + 1);
	};

	const progress = calculateProgress(correctCount, totalQuestions);

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-white p-4 md:p-8">
			<div className="w-full max-w-2xl space-y-6 md:space-y-8">
				{!isFinished ? (
					<>
						{/* 🏷️ Header */}
						<div className="flex justify-between items-center pb-4 border-b-4 border-slate-100">
							<span className="text-xl md:text-2xl font-black text-slate-500 bg-slate-50 px-4 py-2 rounded-2xl">
								{currentIndex + 1} / {totalQuestions}
							</span>
						</div>

						{/* ⏱️ Timer */}
						{isMemoryDomain && showNumbers && (
							<div className="w-full bg-amber-50 border-4 border-amber-200 text-amber-900 text-center py-4 rounded-2xl text-xl md:text-3xl font-black animate-pulse">
								⏱ จดจำข้อมูล ({countdown})
							</div>
						)}

						{/* 🖼️ กล่องคำถาม/โจทย์ */}
						<div className="w-full bg-slate-50 border-4 border-slate-100 p-8 md:p-12 rounded-3xl text-center min-h-[200px] flex flex-col items-center justify-center gap-6">
							
							{/* รูปภาพประกอบ */}
							{currentQuestion?.imageSet && selectedDomain !== "attention" && (
								<div className="flex flex-wrap justify-center gap-4">
									{currentQuestion.imageSet.map((img, idx) => (
										<img
											key={idx}
											src={img}
											alt={`visual ${idx}`}
											className="h-64 object-contain p-2"
										/>
									))}
								</div>
							)}

							{isMemoryDomain ? (
								showNumbers ? (
									<div className="text-5xl md:text-7xl text-slate-900 font-black break-words leading-snug">
										{currentQuestion?.memorizeText}
									</div>
								) : (
									<div className="text-3xl md:text-5xl text-slate-900 font-black">
										{currentQuestion?.questionText}
									</div>
								)
							) : (
								<div className="text-3xl md:text-5xl text-slate-900 font-black leading-snug">
									{currentQuestion?.question}
								</div>
							)}
						</div>

						{/* 🎯 ส่วนแสดงตัวเลือก */}
						{!isMemoryDomain || !showNumbers ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
								{displayOptions.map((opt, index) => {
									const isImageOption =
										typeof opt === "string" &&
										(opt.includes(".png") || opt.includes(".jpg"));

									return (
										<button
											key={`${opt}-${index}`}
											onClick={() => handleAnswerSelect(opt)}
											disabled={isProcessing}
											className={`w-full p-6 md:p-8 rounded-[1rem] border-4 transition-all flex items-center justify-center active:scale-95 ${
												selectedAnswer === opt
													? "bg-indigo-50 border-indigo-500 text-indigo-900 scale-95"
													: "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
											}`}
										>
											{isImageOption ? (
												<img
													src={opt}
													alt="Option"
													className="h-24 md:h-32 w-auto object-contain"
												/>
											) : (
												<span className="text-3xl md:text-4xl font-black">
													{opt}
												</span>
											)}
										</button>
									);
								})}
							</div>
						) : (
							<div className="text-center py-12 text-2xl md:text-3xl text-slate-400 font-black bg-slate-50 rounded-3xl border-4 border-dashed border-slate-200">
								{selectedDomain === "attention"
									? "เลือกภาพที่ต่างจากพวก"
									: "ตั้งใจจำข้อมูลด้านบน..."}
							</div>
						)}
					</>
				) : (
					// =========================================================
					// 📊 หน้าสรุปผล
					// =========================================================
					<div className="text-center space-y-8 py-6">
						<h2 className="text-4xl md:text-5xl font-black text-slate-900">
							เสร็จสิ้น!
						</h2>

						<div className={`bg-slate-50 rounded-[2.5rem] p-8 md:p-12 border-4 ${progress.border} space-y-8`}>
							<div className="text-8xl md:text-9xl animate-bounce">
								{progress.emoji}
							</div>
							<div>
								<div className={`font-black text-4xl md:text-6xl ${progress.color}`}>
									{progress.label}
								</div>
								<div className="text-2xl md:text-3xl text-slate-500 font-bold mt-4">
									ถูก {correctCount} จาก {totalQuestions} ข้อ
								</div>
							</div>

							<div className="w-full bg-slate-200 h-6 md:h-8 rounded-full overflow-hidden">
								<div
									className={`h-full ${progress.bg} transition-all duration-1000 rounded-full`}
									style={{ width: `${(correctCount / totalQuestions) * 100}%` }}
								/>
							</div>

							<p className="text-xl md:text-2xl text-slate-700 font-bold leading-relaxed">
								"{progress.feedback}"
							</p>
						</div>

						<div className="bg-slate-50 border-4 border-slate-100 p-6 rounded-3xl flex justify-between items-center px-8">
							<span className="text-xl md:text-2xl font-black text-slate-500">
								เวลาที่ใช้
							</span>
							<span className="text-2xl md:text-3xl font-black text-slate-900">
								{formatTime(secondsElapsed)}
							</span>
						</div>

						<div className="space-y-4 pt-4">
							<button
								onClick={() => router.push("/")}
								className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-2xl md:text-3xl py-6 rounded-[2rem] active:scale-95 transition-all"
							>
								กลับหน้าแรก
							</button>
							<button
								onClick={() => handleResetChallenge(selectedDomain)}
								className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-2xl md:text-3xl py-6 rounded-[2rem] active:scale-95 transition-all"
							>
								เล่นซ้ำ
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
