"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { waitlistRoleLabels, waitlistRoles, waitlistSchema, type WaitlistInput } from "@/lib/waitlist";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/motion/magnetic-button";

export function WaitlistForm({ defaultCompany, source }: { defaultCompany?: string; source?: string } = {}) {
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistInput>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { propertyName: defaultCompany },
  });

  async function onSubmit(data: WaitlistInput) {
    try {
      const res = await fetch("/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          source: source ?? (typeof document !== "undefined" ? document.referrer : undefined),
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Something went wrong. Try again.");
        return;
      }

      setSubmitted(true);
      toast.success(json.alreadyJoined ? "We already have your application." : "Application received.");
    } catch {
      toast.error("Something went wrong. Try again.");
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-signal/30 bg-signal/5 px-6 py-8 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-signal/15 text-signal">
          <Check className="size-5" />
        </div>
        <p className="font-semibold text-white">Application received.</p>
        <p className="text-sm text-fog">We&apos;ll be in touch to set up a scoping call.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full max-w-md flex-col gap-4">
      {/* Honeypot — hidden from real users, visible to naive bots. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] size-px opacity-0"
        aria-hidden
        {...register("company")}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
        {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="propertyName">Company or app URL (optional)</Label>
          <Input id="propertyName" placeholder="yourapp.com" {...register("propertyName")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role">Role (optional)</Label>
          <Select onValueChange={(v) => setValue("role", v as WaitlistInput["role"])} value={watch("role")}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {waitlistRoles.map((r) => (
                <SelectItem key={r} value={r}>
                  {waitlistRoleLabels[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <MagneticButton className="w-full">
        <Button type="submit" variant="gold" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Sending…" : "Apply for commissioning"}
        </Button>
      </MagneticButton>
    </form>
  );
}
