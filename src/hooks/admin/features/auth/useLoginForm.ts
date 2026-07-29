"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/validations/auth";
import type { z } from "zod";

export type LoginFormData = z.infer<typeof loginSchema>;

interface UseLoginFormOptions {
  onSubmit?: (data: LoginFormData) => void | Promise<void>;
  defaultValues?: Partial<LoginFormData>;
}

export function useLoginForm(options: UseLoginFormOptions = {}) {
  const {
    onSubmit,
    defaultValues = {
      emailOrUsername: "",
      password: "",
    },
  } = options;

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues,
    mode: "onChange",
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  });

  return {
    ...form,
    handleSubmit,
    isLoading: form.formState.isSubmitting,
    errors: form.formState.errors,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
  };
}
