import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create a desk",
  description:
    "Claim five gigabytes of controlled chaos. Nested folders, big uploads, and a trash can with a conscience.",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
