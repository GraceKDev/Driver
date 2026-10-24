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

const DEMO_EMAIL = "demo@chaosdrive.app";
const DEMO_PASSWORD = "ChaosDrive123!";

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("That email looks a little off."),
  password: z.string().min(1, "Enter your password."),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({ mutationFn: api.login });

  const fillDemo = () => {
    setServerError(null);
    setValue("email", DEMO_EMAIL, { shouldValidate: true });
    setValue("password", DEMO_PASSWORD, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    try {
      await loginMutation.mutateAsync(values);
      queryClient.clear();
      const requested = new URLSearchParams(window.location.search).get("next");
      const destination =
        requested && requested.startsWith("/") && !requested.startsWith("//")
          ? requested
          : "/drive";
      router.replace(destination);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = error.fieldErrors;
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
      title="Welcome back to the pile."
      description="Your folders haven’t moved. Probably. Sign in and pick up where the mess left off."
      footer={
        <p className="text-sm text-ink-soft">
          New around here?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-marker hover:text-ink"
          >
            Create a drive
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <ServerBanner message={serverError} />

        <fieldset
          disabled={loginMutation.isPending}
          className="space-y-4 disabled:opacity-60"
        >
          <legend className="sr-only">Sign in to ChaosDrive</legend>

          <TextField
            id="signin-email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@somewhere.com"
            required
            error={errors.email?.message}
            {...register("email")}
          />

          <PasswordField
            id="signin-password"
            label="Password"
            autoComplete="current-password"
            placeholder="Your password"
            required
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            variant="marker"
            size="lg"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </fieldset>

        <div className="rounded-xl border border-line bg-paper p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-sans text-sm font-semibold text-ink">
              Demo access
            </p>
            <button
              type="button"
              onClick={fillDemo}
              className="rounded-md font-sans text-xs font-semibold text-marker hover:text-ink"
            >
              Fill them in
            </button>
          </div>
          <p className="mt-2 select-all break-all font-mono text-[11px] leading-relaxed text-ink">
            {DEMO_EMAIL}
            <span className="mx-1.5 text-ink-soft/90">/</span>
            {DEMO_PASSWORD}
          </p>
          <p className="mt-1.5 text-xs leading-snug text-ink-soft/90">
            A spare desk with a few things already in it.
          </p>
        </div>

        <p className="text-center text-xs text-ink-soft/90">
          The demo keys are always available.
        </p>
      </form>
    </AuthPanel>
  );
}
