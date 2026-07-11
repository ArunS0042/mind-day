"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
	getLocalPatients,
	saveLocalPatients,
	setCurrentSession,
} from "@/utils/storage";
import { PatientRecord } from "@/utils/storage";

export default function LoginPage() {
	const router = useRouter();
	const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

	// Input States
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	// 1. ฟังก์ชันสำหรับ "เปิดใช้งานบัญชีครั้งแรก" (Register/Activate ด้วยสิทธิ์จาก OT)
	const handleActivateAccount = (e: React.FormEvent) => {
		e.preventDefault();
		if (password !== confirmPassword)
			return alert("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
		if (password.length < 4)
			return alert(
				"โปรดตั้งรหัสผ่านอย่างน้อย 4 ตัวอักษรขึ้นไปเพื่อความปลอดภัย",
			);

		const patients = getLocalPatients();
		// ค้นหาคนไข้ที่มี Username ชั่วคราวตรงกับที่กรอก และยังมีสถานะรอเปิดสิทธิ์
		const patientIndex = patients.findIndex((p) => p.tempUser === username);

		if (patientIndex === -1) {
			return alert(
				"ไม่พบรหัสผู้ใช้งานนี้ในระบบ หรือรหัสนี้ถูกเปิดใช้งานไปแล้ว กรุณาตรวจสอบกับนักบำบัด (OT) อีกครั้ง",
			);
		}

		// อัปเดตรหัสผ่านใหม่ เปลี่ยนสถานะเป็นเปิดใช้งาน (Active)
		patients[patientIndex].tempPass = password;
		patients[patientIndex].status = "Active";
		saveLocalPatients(patients);

		alert(
			"🎉 ตั้งรหัสผ่านและเปิดใช้งานบัญชีสำเร็จ! ระบบจะเปลี่ยนเข้าสู่หน้าล็อกอิน",
		);
		setIsRegisterMode(false); // สลับกลับไปหน้าล็อกอินปกติ
		setPassword("");
		setConfirmPassword("");
	};

	// 2. ฟังก์ชันสำหรับ "ล็อกอินเข้าสู่ระบบ" (Login)
	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();

		// แปลงค่าที่ผู้ใช้พิมพ์ให้เป็นตัวพิมพ์เล็กและตัดช่องว่างออก เพื่อป้องกันการพิมพ์ผิด
		const sanitizedInputUser = username.trim().toLowerCase();

		// ==========================================
		// 🌟 HARDCODE บัญชีจำลองสำหรับเดโม (pt-123)
		// ==========================================
		if (sanitizedInputUser === "pt-123" || sanitizedInputUser === "pt_123") {
			const mockSomchaiPatient: PatientRecord = {
				id: "PT-123",
				name: "นายสมชัย ใจดี",
				age: 70,
				scores: {
					orientation: 5, 
					registration: 1, 
					attention: 4, 
					calculation: 2, 
					language: 5, 
					recall: 1, 
				},
				totalScore: 18,
				tempUser: "pt-123",
				tempPass: "anypassword", 
				status: "Active",
				completedMissions: [], 
			};

			const currentPatients = getLocalPatients();
			const hasSomchai = currentPatients.some((p) => p.id === "PT-123");
			if (!hasSomchai) {
				currentPatients.push(mockSomchaiPatient);
				saveLocalPatients(currentPatients);
			}

			setCurrentSession("pt-123");
			router.push("/");
			return;
		}

		// ==========================================
		// โฟลว์ตรวจสอบจาก localStorage ปกติ
		// ==========================================
		const patients = getLocalPatients();
		const sanitizedUsername = username.trim().toLowerCase().replace("-", "_");
		const validPatient = patients.find(
			(p) => p.tempUser === sanitizedUsername && p.tempPass === password,
		);

		if (!validPatient) {
			return alert("ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง โปรดตรวจสอบอีกครั้ง");
		}

		if (validPatient.status === "Pending Activation") {
			return alert(
				"บัญชีนี้จำเป็นต้องลงทะเบียนและตั้งรหัสผ่านใหม่ก่อนใช้งานครั้งแรก",
			);
		}

		setCurrentSession(validPatient.tempUser);
		router.push("/");
	};

	return (
		<div className="w-full max-w-none bg-slate-100 min-h-screen flex items-center justify-center p-4 md:p-8 text-slate-800 antialiased">
			{/* ขยายกล่องให้ใหญ่ขึ้นสำหรับ iPad */}
			<div className="w-full max-w-2xl bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border-4 border-slate-200 space-y-8 md:space-y-10">
				
				{/* ส่วนหัวหน้าจอ */}
				<div className="text-center space-y-4">
					<div className="w-20 h-20 md:w-28 md:h-28 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-5xl md:text-6xl mx-auto shadow-sm border-4 border-indigo-100">
						{isRegisterMode ? "🔑" : "🔐"}
					</div>
					<h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-wide">
						{isRegisterMode ? "ลงทะเบียน" : "เข้าสู่ระบบ"}
					</h1>
				</div>

				{/* ฟอร์มการทำงานสลับโหมด */}
				{isRegisterMode ? (
					// --- FORM REGISTRATION / ACTIVATE ---
					<form onSubmit={handleActivateAccount} className="space-y-6 md:space-y-8">
						<div>
							<label className="text-xl md:text-2xl font-black text-slate-600 block mb-3">
								ชื่อบัญชี (Username) จากผู้ดูแล
							</label>
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="เช่น pt_942"
								className="w-full bg-slate-50 border-4 border-slate-200 rounded-2xl p-5 md:p-6 text-2xl md:text-3xl font-bold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
								required
							/>
						</div>
						<div>
							<label className="text-xl md:text-2xl font-black text-slate-600 block mb-3">
								ตั้งรหัสผ่านใหม่ (สร้างเอง)
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="รหัสผ่านอย่างน้อย 4 ตัว"
								className="w-full bg-slate-50 border-4 border-slate-200 rounded-2xl p-5 md:p-6 text-2xl md:text-3xl font-bold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
								required
							/>
						</div>
						<div>
							<label className="text-xl md:text-2xl font-black text-slate-600 block mb-3">
								ยืนยันรหัสผ่านอีกครั้ง
							</label>
							<input
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="พิมพ์รหัสผ่านซ้ำอีกครั้ง"
								className="w-full bg-slate-50 border-4 border-slate-200 rounded-2xl p-5 md:p-6 text-2xl md:text-3xl font-bold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
								required
							/>
						</div>
						<button
							type="submit"
							className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-2xl md:text-3xl py-6 md:py-8 rounded-[2rem] transition-all cursor-pointer shadow-lg active:scale-95"
						>
							บันทึกและเปิดใช้งานบัญชี
						</button>
						<div className="text-center pt-4">
							<button
								type="button"
								onClick={() => {
									setIsRegisterMode(false);
									setPassword("");
								}}
								className="text-xl md:text-2xl text-indigo-600 hover:text-indigo-800 underline font-black cursor-pointer p-4"
							>
								กลับไปหน้าเข้าสู่ระบบปกติ
							</button>
						</div>
					</form>
				) : (
					// --- FORM NORMAL LOGIN ---
					<form onSubmit={handleLogin} className="space-y-6 md:space-y-8">
						<div>
							<label className="text-xl md:text-2xl font-black text-slate-600 block mb-3">
								ชื่อบัญชี (Username)
							</label>
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="แตะเพื่อพิมพ์ชื่อบัญชี..."
								className="w-full bg-slate-50 border-4 border-slate-200 rounded-2xl p-5 md:p-6 text-2xl md:text-3xl font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
								required
							/>
						</div>
						<div>
							<label className="text-xl md:text-2xl font-black text-slate-600 block mb-3">
								รหัสผ่าน (Password)
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="แตะเพื่อพิมพ์รหัสผ่าน..."
								className="w-full bg-slate-50 border-4 border-slate-200 rounded-2xl p-5 md:p-6 text-2xl md:text-3xl font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
								required
							/>
						</div>
						
						<button
							type="submit"
							className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-3xl md:text-4xl py-6 md:py-8 rounded-[2rem] transition-all cursor-pointer shadow-xl active:scale-95 mt-4"
						>
							เข้าสู่ระบบ
						</button>

						<div className="text-center pt-6 border-t-4 border-slate-100 mt-6">
							<p className="text-xl md:text-2xl text-slate-500 mb-4 font-bold">
								ยังไม่เคยเปิดใช้งานบัญชี?
							</p>
							<button
								type="button"
								onClick={() => {
									setIsRegisterMode(true);
									setPassword("");
								}}
								className="text-2xl md:text-3xl text-indigo-600 hover:text-indigo-800 underline font-black cursor-pointer p-4 bg-indigo-50 rounded-2xl w-full"
							>
								ลงทะเบียนผู้ใช้ใหม่
							</button>
						</div>
					</form>
				)}

				<div className="pt-8 text-center">
					<p className="text-xl md:text-2xl text-slate-500 text-center font-bold leading-snug">
						สำหรับ Prototype ให้ใช้บัญชีจำลอง <span className="text-indigo-600">pt-123</span> และรหัสผ่านใดก็ได้
					</p>
				</div>

				{/* ปุ่มอำนวยความสะดวกสำหรับ Dev/Prototype */}
				<div className="pt-8 text-center">
					<button
						onClick={() => router.push("/ot-admin")}
						className="text-lg md:text-xl text-slate-400 hover:text-slate-600 underline font-bold bg-slate-50 px-6 py-4 rounded-xl w-full"
					>
						สลับไปยังหน้าผู้ดูแลระบบ (OT Admin)
					</button>
				</div>
			</div>
		</div>
	);
}
