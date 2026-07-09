"use client";

import React, { useState, useEffect } from "react";
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
			// 1. สร้าง Object ข้อมูลของ นายสมชัย ใจดี แบบครบถ้วนสำหรับใช้ในหน้า Main และหน้า Graph
			const mockSomchaiPatient: PatientRecord = {
				id: "PT-123",
				name: "นายสมชัย ใจดี",
				age: 70,
				// คะแนนเต็มรววม 18/30 (จุดที่ต้องพัฒนาที่สุดคือ Recall และ Registration ที่เป็น Memory โดเมน)
				scores: {
					orientation: 5, // เต็ม 6
					registration: 1, // เต็ม 3 (ต่ำ)
					attention: 4, // เต็ม 5
					calculation: 2, // เต็ม 3
					language: 5, // เต็ม 10 (ต่ำ)
					recall: 1, // เต็ม 3 (ต่ำที่สุดในสัดส่วนเปอร์เซ็นต์)
				},
				totalScore: 18,
				tempUser: "pt-123",
				tempPass: "anypassword", // สามารถพิมพ์รหัสผ่านอะไรก็ได้ในหน้าจอเดโม
				status: "Active",
				completedMissions: [], // วันแรกยังไม่ได้เริ่มทำภารกิจ
			};

			// 2. ดึงข้อมูลในฐานข้อมูลจำลองปัจจุบันขึ้นมา
			const currentPatients = getLocalPatients();

			// 3. ตรวจสอบว่ามีข้อมูลนายสมชัยอยู่ใน localStorage หรือยัง ถ้ายังไม่มีให้ Push บันทึกเข้าไป
			const hasSomchai = currentPatients.some((p) => p.id === "PT-123");
			if (!hasSomchai) {
				currentPatients.push(mockSomchaiPatient);
				saveLocalPatients(currentPatients);
			}

			// 4. บันทึกเซสชัน และพาข้ามหน้าไปหน้า Main ทันที
			setCurrentSession("pt-123");
			router.push("/");
			return;
		}

		// ==========================================
		// โฟลว์ตรวจสอบจาก localStorage ปกติ (ถ้าไม่ใช่รหัส pt-123)
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
				"บัญชีนี้จำเป็นต้องสมัครและตั้งรหัสผ่านใหม่ก่อนใช้งานครั้งแรก",
			);
		}

		setCurrentSession(validPatient.tempUser);
		router.push("/");
	};

	return (
		<div className="w-full max-w-none bg-slate-100 min-h-screen flex items-center justify-center p-4 text-slate-800 antialiased">
			<div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-md border border-slate-200 space-y-6">
				{/* ส่วนหัวหน้าจอ */}
				<div className="text-center space-y-2">
					<div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-2xs">
						{isRegisterMode ? "🔑" : "🔐"}
					</div>
					<h1 className="text-xl font-black text-slate-900">
						{isRegisterMode
							? "ลงทะเบียน"
							: "เข้าสู่ระบบ"}
					</h1>
				</div>

				{/* ฟอร์มการทำงานสลับโหมด */}
				{isRegisterMode ? (
					// --- FORM REGISTRATION / ACTIVATE ---
					<form onSubmit={handleActivateAccount} className="space-y-4">
						<div>
							<label className="text-[11px] font-bold text-slate-500 block mb-1">
								Username ชั่วคราว (จาก OT)
							</label>
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="เช่น pt_942"
								className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-indigo-500"
								required
							/>
						</div>
						<div>
							<label className="text-[11px] font-bold text-slate-500 block mb-1">
								กำหนดรหัสผ่านใหม่ (สร้างเอง)
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="ตั้งรหัสผ่านผู้ป่วย/ญาติ"
								className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-indigo-500"
								required
							/>
						</div>
						<div>
							<label className="text-[11px] font-bold text-slate-500 block mb-1">
								ยืนยันรหัสผ่านอีกครั้ง
							</label>
							<input
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="กรอกรหัสผ่านซ้ำอีกครั้ง"
								className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-indigo-500"
								required
							/>
						</div>
						<button
							type="submit"
							className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3 rounded-xl transition cursor-pointer shadow-xs"
						>
							💾 บันทึกรหัสผ่านและเปิดใช้งานบัญชี
						</button>
						<div className="text-center pt-2">
							<button
								type="button"
								onClick={() => {
									setIsRegisterMode(false);
									setPassword("");
								}}
								className="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer"
							>
								กลับไปหน้าเข้าสู่ระบบปกติ
							</button>
						</div>
					</form>
				) : (
					// --- FORM NORMAL LOGIN ---
					<form onSubmit={handleLogin} className="space-y-4">
						<div>
							<label className="text-[11px] font-bold text-slate-500 block mb-1">
								ชื่อผู้ใช้งาน (Username)
							</label>
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="ระบุบัญชีผู้ใช้ของคุณ"
								className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-indigo-500"
								required
							/>
						</div>
						<div>
							<label className="text-[11px] font-bold text-slate-500 block mb-1">
								รหัสผ่าน (Password)
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="ระบุรหัสผ่านเข้าใช้งาน"
								className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-indigo-500"
								required
							/>
						</div>
						<button
							type="submit"
							className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-3 rounded-xl transition cursor-pointer shadow-xs"
						>
							เข้าสู่ระบบ
						</button>
						<div className="text-center pt-2 border-t border-slate-100 mt-2">
							<p className="text-[11px] text-slate-400 mb-1">
								ไม่เคยมีบัญชีมาก่อน?
							</p>
							<button
								type="button"
								onClick={() => {
									setIsRegisterMode(true);
									setPassword("");
								}}
								className="text-xs text-indigo-600 hover:underline font-extrabold cursor-pointer"
							>
								ลงทะเบียน
							</button>
						</div>
					</form>
				)}

				{/* ปุ่มอำนวยความสะดวกสำหรับ Dev/Prototype สลับไปหน้าควบคุม OT */}
				<div className="pt-2 text-center">
					<button
						onClick={() => router.push("/ot-admin")}
						className="text-[10px] text-slate-400 hover:text-slate-600 underline font-medium"
					>
						⚙️ สลับไปยังแผงควบคุมหลักฝั่ง OT Admin
						เพื่อดูรายชื่อสิทธิ์บัญชีผู้ใช้
					</button>
				</div>
			</div>
		</div>
	);
}
