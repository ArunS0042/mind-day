// =================================================================
// 1. DEFINING INTERFACES (กำหนดโครงสร้างข้อมูลตามหลัก Strong Type)
// =================================================================

export interface QuestionItem {
	question?: string;
	memorizeText?: string;
	questionText?: string;
	options: string[];
	correct: string;
	isDynamic?: boolean;
	imageSet?: string[];
}

export interface ExerciseCategory {
	name: string;
	questions: QuestionItem[];
}

// =================================================================
// 2. DYNAMIC LOGIC FUNCTION (ฟังก์ชันคำนวณหาคำตอบจากปฏิทินและเวลาจริง)
// =================================================================

export const getDynamicAnswers = (
	type: string,
): { correct: string; formattedOptions: string[] } => {
	const now = new Date();

	// กรณีทดสอบวันประจำสัปดาห์
	if (type === "DYNAMIC_DAY") {
		const days = [
			"วันอาทิตย์",
			"วันจันทร์",
			"วันอังคาร",
			"วันพุธ",
			"วันพฤหัสบดี",
			"วันศุกร์",
			"วันเสาร์",
		];
		const currentDay = days[now.getDay()];
		return {
			correct: currentDay,
			formattedOptions: ["วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี"],
		};
	}

	// กรณีทดสอบช่วงเวลาในชีวิตประจำวัน
	if (type === "DYNAMIC_TIME") {
		const hours = now.getHours();
		let timeText = "ช่วงกลางวัน";
		if (hours >= 5 && hours < 11) timeText = "ช่วงเช้า";
		else if (hours >= 11 && hours < 16) timeText = "ช่วงกลางวัน";
		else if (hours >= 16 && hours < 19) timeText = "ช่วงเย็น";
		else timeText = "ช่วงกลางคืน";
		return {
			correct: timeText,
			formattedOptions: ["ช่วงเช้า", "ช่วงกลางวัน", "ช่วงเย็น", "ช่วงกลางคืน"],
		};
	}

	// กรณีทดสอบเดือนปัจจุบัน
	const months = [
		"มกราคม",
		"กุมภาพันธ์",
		"มีนาคม",
		"เมษายน",
		"พฤษภาคม",
		"มิถุนายน",
		"กรกฎาคม",
		"สิงหาคม",
		"กันยายน",
		"ตุลาคม",
		"พฤศจิกายน",
		"ธันวาคม",
	];
	const currentMonth = months[now.getMonth()];
	return {
		correct: currentMonth,
		formattedOptions: ["มกราคม", "กุมภาพันธ์", "มีนาคม", currentMonth],
	};
};

// =================================================================
// 3. MISSION DATA POOL (คลังคำถาม 5 ข้อเต็ม ทั้ง 5 หมวดหมู่หลัก)
// =================================================================

export const MISSION_POOL: Record<string, ExerciseCategory> = {
	memory_digit: {
		name: "🧠 1.1 จำตัวเลข (Digit Recall)",
		questions: [
			{
				memorizeText: "3 8 5",
				questionText: "ตัวเลขตัวสุดท้ายคืออะไร?",
				options: ["3", "5", "8", "9"],
				correct: "5",
			},
			{
				memorizeText: "7 2 9 4 1",
				questionText: "ตัวเลขตัวที่ 3 คืออะไร",
				options: ["2", "4", "9", "1"],
				correct: "9",
			},
			{
				memorizeText: "4 7 2 9",
				questionText: "เรียงลำดับตัวเลขจากหลังมาหน้าได้ถูกต้อง",
				options: [
					"9 - 2 - 7 - 4",
					"4 - 7 - 2 - 9",
					"9 - 4 - 2 - 7",
					"7 - 2 - 9 - 4",
				],
				correct: "9 - 2 - 7 - 4",
			},
			{
				memorizeText: "1 6 8",
				questionText: "ตัวแรกสุดคือเลขอะไร",
				options: ["1", "6", "8", "0"],
				correct: "1",
			},
			{
				memorizeText: "5 3 9 2",
				questionText: "เลข 3 อยู่ตัวที่เท่าไหร่",
				options: ["ตัวที่ 1", "ตัวที่ 2", "ตัวที่ 3", "ตัวที่ 4"],
				correct: "ตัวที่ 2",
			},
		],
	},

	memory_words: {
		name: "🧠 1.2 จำคำศัพท์ (Word Association)",
		questions: [
			{
				memorizeText: "จดจำคำศัพท์ต่อไปนี้:\n[ เสื้อผ้า - พัดลม - สมุด ]",
				questionText: "คำศัพท์ใดปรากฏอยู่ในชุดคำศัพท์ข้างต้น?",
				options: ["กางเกง", "พัดลม", "ดินสอ", "ร่ม"],
				correct: "พัดลม",
			},
			{
				memorizeText:
					"จดจำคำศัพท์ต่อไปนี้:\n[ มะม่วง - ส้มโอ - แตงโม - กล้วย ]",
				questionText: 'คำศัพท์ใดในตัวเลือก "ไม่ได้" อยู่ในชุดคำศัพท์ข้างต้น?',
				options: ["มะม่วง", "ส้มโอ", "แอปเปิ้ล", "กล้วย"],
				correct: "แอปเปิ้ล",
			},
			{
				memorizeText:
					"จดจำคู่คำศัพท์เชื่อมโยง:\n[ นก คู่กับ ท้องฟ้า ] และ [ ปลา คู่กับ แม่น้ำ ]",
				questionText:
					'จากข้อมูลข้างต้น คำศัพท์ใดที่มีคู่เชื่อมโยงกับคำว่า "นก"?',
				options: ["ท้องฟ้า", "แม่น้ำ", "ต้นไม้", "ภูเขา"],
				correct: "ท้องฟ้า",
			},
			{
				memorizeText: "จดจำคำศัพท์ต่อไปนี้:\n[ รถยนต์ - รถไฟ - เครื่องบิน ]",
				questionText: "คำศัพท์ตัวแรกสุดของชุดคำนี้คือคำว่าอะไร?",
				options: ["รถยนต์", "รถไฟ", "เครื่องบิน", "เรือ"],
				correct: "รถยนต์",
			},
			{
				memorizeText: "จดจำคำศัพท์ต่อไปนี้:\n[ หมอน - ที่นอน - มุ้ง - ผ้าห่ม ]",
				questionText:
					"คำศัพท์ในชุดข้างต้นทั้งหมดนี้ มีความเกี่ยวข้องกับสถานที่ใดมากที่สุด?",
				options: ["ห้องครัว", "ห้องนอน", "ห้องนั่งเล่น", "ห้องน้ำ"],
				correct: "ห้องนอน",
			},
		],
	},

	memory_story: {
		name: "🧠 1.3 จำเรื่องราว (Story Retention)",
		questions: [
			{
				memorizeText:
					'ป้าสมศรีไปตลาด ซื้อปลาทู 2 ตัว และมะนาว 3 ลูก',
				questionText: "ป้าสมศรีเดินไปซื้ออะไรที่ตลาด",
				options: ["ไก่สด", "ปลาทูและมะนาว", "หมูสับ", "ผลไม้"],
				correct: "ปลาทูและมะนาว",
			},
			{
				memorizeText:
					'ป้าสมศรีไปตลาด ซื้อปลาทู 2 ตัว และมะนาว 3 ลูก',
				questionText:
					"ป้าสมศรีซื้อปลาทูมาทั้งหมดจำนวนกี่ตัว",
				options: ["1 ตัว", "2 ตัว", "3 ตัว", "4 ตัว"],
				correct: "2 ตัว",
			},
			{
				memorizeText:
					'ลุงชาลีเลี้ยงสุนัขสีดำชื่อ โกโก้ มันชอบวิ่งเล่นตอนบ่ายโมง',
				questionText: "สุนัขของลุงชาลีชื่ออะไร",
				options: ["โกโก้", "กิโล", "โบโบ้", "ดำ"],
				correct: "โกโก้",
			},
			{
				memorizeText:
					'ลุงชาลีเลี้ยงสุนัขสีดำชื่อ โกโก้ มันชอบวิ่งเล่นตอนบ่ายโมง',
				questionText: "สุนัขตัวนี้ชอบออกไปวิ่งเล่น ณ เวลาใด",
				options: ["ตอนเช้าตรู่", "ตอนเที่ยงวัน", "ตอนบ่ายโมง", "ตอนเย็น"],
				correct: "ตอนบ่ายโมง",
			},
			{
				memorizeText:
					'น้องแก้วลืมร่มสีฟ้าไว้ที่โรงเรียนเมื่อวันศุกร์',
				questionText:
					"น้องแก้วลืมร่มไว้ที่ไหน",
				options: ["บ้าน", "ตลาด", "โรงเรียน", "สนามเด็กเล่น"],
				correct: "โรงเรียน",
			},
		],
	},
	calculation: {
		name: "🔢 2. Calculation (บวก ลบ คูณ หาร)",
		questions: [
			{
				question: "12 + 8 = ?",
				options: ["18", "19", "20", "21"],
				correct: "20",
			},
			{
				question: "50 - 17 = ?",
				options: ["31", "32", "33", "34"],
				correct: "33",
			},
			{
				question: "ภาพนี้รวมกันได้กี่บาท?",
				imageSet: [
					"/images/20THB.png",
					"/images/10THB.png",
					"/images/10THB.png",
				], // 20+10+10
				options: ["30", "40", "50", "60"],
				correct: "40",
			},
			{
				question: "ธนบัตรและเหรียญในภาพรวมกันได้กี่บาท?",
				imageSet: [
					"/images/100THB.png",
					"/images/100THB.png",
					"/images/5THB.png",
				], // 100+100+5
				options: ["105", "205", "210", "150"],
				correct: "205",
			},
			{
				question: "รวมมูลค่าทั้งหมดในภาพนี้เป็นกี่บาท?",
				imageSet: [
					"/images/500THB.png",
					"/images/20THB.png",
					"/images/2THB.png",
					"/images/1THB.png",
				], // 500+20+2+1
				options: ["523", "525", "533", "535"],
				correct: "523",
			},
		],
	},
	// ในส่วนของหมวด attention:
	attention: {
		name: "⚡ 3. สังเกตความแตกต่าง (Visual Attention)",
		questions: [
			{
				question: "รูปภาพในข้อใดแตกต่างจากพวก?",
				imageSet: [
					"/images/Square.png",
					"/images/Square - Copy.png",
					"/images/Square - Copy (2).png",
					"/images/Triangle.png",
				],
				// เพิ่มตัวเลือกให้ครบ 4 ช่อง โดยอ้างอิงจากลำดับรูปใน imageSet
				options: [
					"/images/Square.png",
					"/images/Square - Copy.png",
					"/images/Square - Copy (2).png",
					"/images/Triangle.png",
				],
				correct: "/images/Triangle.png",
			},
			{
				question: "รูปภาพในข้อใดแตกต่างจากพวก?",
				imageSet: [
					"/images/Pentagon.png",
					"/images/Octagon.png",
					"/images/Pentagon - Copy.png",
					"/images/Pentagon - Copy (2).png",
				],
				options: [
					"/images/Pentagon.png",
					"/images/Octagon.png",
					"/images/Pentagon - Copy.png",
					"/images/Pentagon - Copy (2).png",
				],
				correct: "/images/Octagon.png",
			},
			{
				question: "รูปภาพในข้อใดแตกต่างจากพวก?",
				imageSet: [
					"/images/Hexagon.png",
					"/images/Hexagon - Copy.png",
					"/images/Star.png",
					"/images/Hexagon - Copy (2).png",
				],
				options: [
					"/images/Hexagon.png",
					"/images/Hexagon - Copy.png",
					"/images/Star.png",
					"/images/Hexagon - Copy (2).png",
				],
				correct: "/images/Star.png",
			},
			{
				question: "กิจกรรมใดเกิดหลังสุดในแต่ละวัน",
				options: ["ตื่นนอน", "กินข้าว", "เข้านอน", "อาบน้ำ"],
				correct: "เข้านอน",
			},
			{
				question: "หากต้องการชงกาแฟร้อน สิ่งใดควรทำเป็นขั้นตอนสุดท้าย?",
				options: [
					"ต้มน้ำ",
					"ตักกาแฟใส่แก้ว",
					"คนให้เข้ากัน",
					"เทน้ำร้อนลงในแก้ว",
				],
				correct: "คนให้เข้ากัน",
			},
		],
	},
	orientation: {
		name: "📅 4. Orientation (การรับรู้วันเวลา)",
		questions: [
			{
				question: "วันนี้เป็นวันอะไร?",
				options: ["วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี"],
				correct: "DYNAMIC_DAY",
				isDynamic: true,
			},
			{
				question: "ตอนนี้เป็นช่วงเวลาใด?",
				options: ["ช่วงเช้า", "ช่วงกลางวัน", "ช่วงเย็น", "ช่วงกลางคืน"],
				correct: "DYNAMIC_TIME",
				isDynamic: true,
			},
			{
				question: "ตอนนี้เป็นเดือนใด?",
				options: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "กรกฎาคม"],
				correct: "DYNAMIC_MONTH",
				isDynamic: true,
			},
			{
				question: "ปีนี้คือปี ค.ศ. ใด?",
				options: ["2024", "2025", "2026", "2027"],
				correct: "2026",
			},
			{
				question: "เวลาที่แสดงบนหน้าจอคอมพิวเตอร์ขณะนี้เข้าข่ายช่วงชั่วโมงใด?",
				options: [
					"ช่วงชั่วโมงเร่งด่วน",
					"ตามเวลาปัจจุบันของเครื่อง",
					"ช่วงเช้าตรู่",
					"ช่วงก่อนเที่ยง",
				],
				correct: "DYNAMIC_TIME",
				isDynamic: true,
			},
		],
	},
	language: {
		name: "🗣️ 5. ทักษะการคิดคำนวณและภาษา",
		questions: [
			// ข้อ 1: ผลไม้
			{
				question: "ภาพที่เห็นนี้คือผลไม้ชนิดใด?",
				imageSet: ["/images/Durian.png"],
				options: [
					"ทุเรียน (Durian)",
					"ส้ม (Orange)",
					"แอปเปิ้ล (Apple)",
					"กล้วย (Banana)",
				],
				correct: "ทุเรียน (Durian)",
			},
			// ข้อ 2: สัตว์
			{
				question: "ภาพที่เห็นนี้คือสัตว์ชนิดใด?",
				imageSet: ["/images/Bear.png"],
				options: [
					"หมี (Bear)",
					"จระเข้ (Crocodile)",
					"ม้า (Horse)",
					"ช้าง (Elephant)",
				],
				correct: "หมี (Bear)",
			},
			{
				question: 'คำว่า "ก _ ะ ด า น" ตัวอักษรใดหายไป?',
				options: ["ร", "ล", "น", "ม"],
				correct: "ร",
			},
			{
				question: "ข้อใดมีหมายความ 'ไม่เหมือน' กับพวก?",
				options: ["เร็ว", "ไว", "ด่วน", "ช้า"],
				correct: "ช้า", 
			},
			{
				question: "คำใดมีความหมายเหมือนกับคำว่า 'สวย'?",
				options: ["งาม", "ฉลาด", "เก่ง", "หิน"],
				correct: "งาม",
			},
		],
	},
};

export interface DailyStatLog {
	date: string; // วันที่บันทึก เช่น '2026-07-01'
	accuracyRate: number; // อัตราความถูกต้อง (%)
	timeSpentSec: number; // เวลาที่ใช้ (วินาที)
	cognitiveDomain: string; // หมวดที่เน้นฝึกในวันนั้น
	completionStatus: "Passed" | "Needs Review";
}
