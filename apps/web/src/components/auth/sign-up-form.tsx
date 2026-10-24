"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthPanel } from "@/components/auth/auth-panel";
import { Button } from "@/components/ui/button";
import { PasswordField, TextField } from "@/components/ui/field";
import { ServerBanner } from "@/components/ui/server-banner";
import { ApiError, api, friendlyMessage } from "@/lib/api";

const signUpSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, "Give your drive a name.")
      .max(100, "Keep the name to 100 characters or fewer."),
    email: z
      .string()
      .trim()
      .min(1, "Enter your email address.")
      .email("That email looks a little off."),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .regex(/[a-z]/, "Include at least one lowercase letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string().min(1, "Say the password one more time."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Those two passwords don’t match.",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useMutation({ mutationFn: api.register });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    try {
      await registerMutation.mutateAsync({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
      });
      queryClient.clear();
      router.replace("/drive");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = error.fieldErrors;
        if (fieldErrors.displayName?.[0]) {
          setError("displayName", {
            type: "server",
            message: fieldErrors.displayName[0],
          });
        }
        if (fieldErrors.email?.[0]) {
          setError("email", { type: "server", message: fieldErrors.email[0] });
        }
        if (fieldErrors.password?.[0]) {
          setError("password", {
            type: "server",
            message: fieldErrors.password[0],
          });
        }
      }
      setServerError(friendlyMessage(error));
    }
  });

  return (
    <AuthPanel
      title="Start a new pile."
      description="Five gigabytes, a handful of folders, and no judgment at all about your filing system."
      footer={
        <p className="text-sm text-ink-soft">
          Already have keys?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-marker hover:text-ink"
          >
            Sign in to your drive
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <ServerBanner message={serverError} />

        <fieldset
          disabled={registerMutation.isPending}
          className="space-y-4 disabled:opacity-60"
        >
          <legend className="sr-only">Create a ChaosDrive account</legend>

          <TextField
            id="signup-name"
            label="What should we call you?"
            type="text"
            autoComplete="name"
            placeholder="Alex Morgan"
            required
            error={errors.displayName?.message}
            {...register("displayName")}
          />

          <TextField
            id="signup-email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@somewhere.com"
            required
            error={errors.email?.message}
            {...register("email")}
          />

          <PasswordField
            id="signup-password"
            label="Password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            required
            hint="At least 8 characters, with a lowercase letter and a number."
            error={errors.password?.message}
            {...register("password")}
          />

          <PasswordField
            id="signup-confirm-password"
            label="Password, again"
            autoComplete="new-password"
            placeholder="Same one, please"
            required
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button
            type="submit"
            variant="marker"
            size="lg"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Making your drive…" : "Make my drive"}
          </Button>
        </fieldset>

        <p className="text-center text-xs leading-relaxed text-ink-soft/90">
          5 GB included. No credit card required. Read our{" "}
          <Link
            href="/privacy"
            className="font-medium text-marker hover:text-ink"
          >
            privacy policy
          </Link>
          .
        </p>
      </form>
    </AuthPanel>
  );
}
