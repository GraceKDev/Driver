"use client";

import { Eye, EyeOff } from "lucide-react";
import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
  inputClassName?: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      id,
      label,
      error,
      hint,
      className,
      containerClassName,
      inputClassName,
      required,
      ...props
    },
    ref,
  ) {
    const describedBy = [
      hint ? `${id}-hint` : null,
      error ? `${id}-error` : null,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        <label
          htmlFor={id}
          className="flex items-baseline justify-between gap-3 font-sans text-[13px] font-medium text-ink"
        >
          <span>
            {label}
            {required ? (
              <span className="ml-1 text-marker" aria-hidden="true">
                *
              </span>
            ) : null}
          </span>
        </label>
        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn("field-input text-[15px]", inputClassName, className)}
          {...props}
        />
        {hint ? (
          <p id={`${id}-hint`} className="text-xs leading-snug text-ink-soft">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p
            id={`${id}-error`}
            className="flex items-start gap-1.5 text-xs font-medium leading-snug text-marker"
          >
            <span aria-hidden="true" className="font-mono">
              !
            </span>
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

export const PasswordField = forwardRef<HTMLInputElement, TextFieldProps>(
  function PasswordField(
    {
      id,
      label,
      error,
      hint,
      className,
      containerClassName,
      inputClassName,
      required,
      ...props
    },
    ref,
  ) {
    const [visible, setVisible] = useState(false);
    const describedBy = [
      hint ? `${id}-hint` : null,
      error ? `${id}-error` : null,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        <label
          htmlFor={id}
          className="flex items-baseline justify-between gap-3 font-sans text-[13px] font-medium text-ink"
        >
          <span>
            {label}
            {required ? (
              <span className="ml-1 text-marker" aria-hidden="true">
                *
              </span>
            ) : null}
          </span>
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy || undefined}
            className={cn(
              "field-input text-[15px]",
              inputClassName,
              className,
            )}
            style={{ paddingRight: "3rem" }}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-ink-soft hover:bg-ink/5 hover:text-ink"
          >
            {visible ? (
              <EyeOff aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Eye aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
        </div>
        {hint ? (
          <p id={`${id}-hint`} className="text-xs leading-snug text-ink-soft">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p
            id={`${id}-error`}
            className="flex items-start gap-1.5 text-xs font-medium leading-snug text-marker"
          >
            <span aria-hidden="true" className="font-mono">
              !
            </span>
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
