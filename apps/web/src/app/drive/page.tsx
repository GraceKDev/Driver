import type { Metadata } from "next";
import { Suspense } from "react";
import { DriveScreen } from "@/components/drive/drive-screen";
import { DriveSkeleton } from "@/components/drive/drive-skeleton";

export const metadata: Metadata = {
  title: "Your desk",
  description:
    "Folders, files, and the beautiful mess in between. Welcome to your ChaosDrive desk.",
};

export default function DrivePage() {
  return (
    <Suspense fallback={<DriveSkeleton />}>
      <DriveScreen />
    </Suspense>
  );
}
