// ในไฟล์ page.tsx
"use client";

import { Suspense } from "react";
import MissionContent from "./MissionContent"; // นำเข้า Component ใหม่

export default function MissionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MissionContent />
    </Suspense>
  );
}
