"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/validations/auth";
import type { z } from "zod";

export type RegisterFormData = z.infer<typeof registerSchema>;

interface UseRegisterFormOptions {
  onSubmit?: (data: RegisterFormData) => void | Promise<void>;
  defaultValues?: Partial<RegisterFormData>;
}

export function useRegisterForm(options: UseRegisterFormOptions = {}) {
  const {
    onSubmit,
    defaultValues = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      secretCode: "",
    },
  } = options;

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
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
