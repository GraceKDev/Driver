import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to your ChaosDrive desk. The folders are exactly where you left them.",
};

export default function SignInPage() {
  return <SignInForm />;
}
