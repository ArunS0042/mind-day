import './globals.css';
// 1. นำเข้าฟอนต์ (ใช้ตัวพิมพ์ใหญ่ขึ้นต้นคำตามมาตรฐาน Next.js)
import { Noto_Sans_Thai } from 'next/font/google';

// 2. ประกาศตัวแปร (ตั้งชื่อเป็น notoSansThai เพื่อให้เรียกใช้ง่าย)
const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '700', '900'],
  display: 'swap',
});

export const metadata = {
  title: 'MindDay',
  description: 'Multi-page interactive prototype',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      {/* 3. เรียกใช้ตัวแปร notoSansThai (ตัว n พิมพ์เล็ก) ให้ตรงกับข้อ 2 */}
      <body className={`${notoSansThai.className} bg-slate-100 text-slate-800 antialiased min-h-screen`}>
        <div className="max-w-full mx-auto bg-slate-50 min-h-screen flex flex-col justify-between shadow-xl border-x border-slate-200">
          <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50 flex justify-between items-center">
            <span className="font-black text-sm tracking-tight text-slate-900">🧠 MindDay</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">ID: #2026-ALEX</span>
          </header>
          
          <main className="flex-1 p-4 space-y-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
