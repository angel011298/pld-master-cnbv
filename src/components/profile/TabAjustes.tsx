"use client";

import * as React from "react";
import { Save, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { ProfileData } from "./types";

interface TabAjustesProps {
  profile: ProfileData;
  onProfileUpdate: (fields: Record<string, unknown>) => Promise<void>;
  showToast: (msg: string, type?: "success" | "error") => void;
}

const EXAM_DATES = [
  {
    value: "2026-06-27",
    label: "27 de junio de 2026 — Convocatoria Ordinaria",
  },
  {
    value: "2026-10-24",
    label: "24 de octubre de 2026 — Convocatoria Extraordinaria",
  },
] as const;

function daysUntil(dateStr: string): number {
  const target = new Date(`${dateStr}T00:00:00`);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-brand-500" : "bg-neutral-200",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}

export function TabAjustes({
  profile,
  onProfileUpdate,
  showToast,
}: TabAjustesProps) {
  const [name, setName] = React.useState(profile.full_name || "");
  const [savingName, setSavingName] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);
  const [togglingNotif, setTogglingNotif] = React.useState(false);

  React.useEffect(() => {
    setName(profile.full_name || "");
  }, [profile.full_name]);

  const handleSaveName = async () => {
    setSavingName(true);
    try {
      await onProfileUpdate({ full_name: name });
      showToast("Nombre actualizado");
    } catch {
      showToast("Error al guardar nombre", "error");
    } finally {
      setSavingName(false);
    }
  };

  const handleExamDateChange = async (dateValue: string) => {
    try {
      await onProfileUpdate({ exam_target_date: dateValue });
      showToast("Fecha de examen actualizada");
    } catch {
      showToast("Error al guardar fecha", "error");
    }
  };

  const handleToggleNotif = async (field: string, value: boolean) => {
    setTogglingNotif(true);
    try {
      await onProfileUpdate({ [field]: value });
    } catch {
      showToast("Error al guardar preferencia", "error");
    } finally {
      setTogglingNotif(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      showToast("La contraseña debe tener al menos 8 caracteres", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Las contraseñas no coinciden", "error");
      return;
    }
    setSavingPassword(true);
    try {
      const sb = supabase();
      const { error } = await sb.auth.updateUser({ password: newPassword });
      if (error) throw error;
      showToast("Contraseña actualizada");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al actualizar contraseña";
      showToast(msg, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const isGoogleAuth = profile.provider === "google";
  const planLabel = profile.tier === "premium" ? "PREMIUM" : "PRUEBA";
  const planColor =
    profile.tier === "premium"
      ? "bg-brand-50 text-brand-700 border-brand-200"
      : "bg-orange-50 text-orange-700 border-orange-200";

  return (
    <div className="space-y-6">
      {/* ── Account ── */}
      <div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Cuenta
        </p>

        <div className="space-y-5 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Nombre completo
            </label>
            <div className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="flex-1"
              />
              <Button
                onClick={handleSaveName}
                disabled={
                  savingName ||
                  name.trim() === (profile.full_name || "")
                }
                size="sm"
                className="shrink-0"
              >
                <Save className="mr-1 h-4 w-4" />
                Guardar
              </Button>
            </div>
          </div>

          <div className="border-t border-neutral-100" />

          {/* Exam Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Fecha objetivo de examen
            </label>
            <div className="space-y-2">
              {EXAM_DATES.map((opt) => {
                const isSelected = profile.exam_date === opt.value;
                const remaining = daysUntil(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all duration-200",
                      isSelected
                        ? "border-brand-300 bg-brand-50/50"
                        : "border-neutral-200 hover:border-neutral-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="exam_date"
                      value={opt.value}
                      checked={isSelected}
                      onChange={() => handleExamDateChange(opt.value)}
                      className="mt-0.5 accent-brand-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-neutral-800">
                        {opt.label}
                      </span>
                      {isSelected && remaining > 0 && (
                        <span className="ml-2 inline-block rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700">
                          Faltan {remaining} días
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="border-t border-neutral-100" />

          {/* Email (read-only) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Email
            </label>
            <Input
              value={profile.email}
              disabled
              className="bg-neutral-50 text-neutral-500"
            />
            <p className="mt-1 text-xs text-neutral-400">
              El email no puede modificarse
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-100" />

      {/* ── Notifications ── */}
      <div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Notificaciones
        </p>

        <div className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-800">
                Recordatorios de estudio
              </p>
              <p className="text-xs text-neutral-500">
                Recibe notificaciones para mantener tu racha
              </p>
            </div>
            <Toggle
              checked={profile.notification_study_reminder}
              onChange={(v) =>
                handleToggleNotif("notification_study_reminder", v)
              }
              disabled={togglingNotif}
            />
          </div>
          <div className="border-t border-neutral-100" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-800">
                Novedades y actualizaciones
              </p>
              <p className="text-xs text-neutral-500">
                Recibe información sobre nuevas funciones
              </p>
            </div>
            <Toggle
              checked={profile.notification_email_enabled}
              onChange={(v) =>
                handleToggleNotif("notification_email_enabled", v)
              }
              disabled={togglingNotif}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-100" />

      {/* ── Security ── */}
      <div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Seguridad
        </p>

        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          {isGoogleAuth ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-50">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">
                  Cuenta vinculada con Google
                </p>
                <p className="text-xs text-neutral-500">
                  Cambia tu contraseña desde la configuración de Google
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Confirmar contraseña
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={
                  savingPassword || !newPassword || !confirmPassword
                }
                className="w-full sm:w-auto"
              >
                {savingPassword
                  ? "Actualizando..."
                  : "Actualizar contraseña"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-neutral-100" />

      {/* ── Plan ── */}
      <div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Plan actual
        </p>

        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold",
                planColor
              )}
            >
              {planLabel}
            </span>
          </div>
          {profile.tier === "premium" ? (
            <p className="text-sm text-neutral-600">✓ Acceso completo</p>
          ) : (
            <div>
              <p className="mb-3 text-sm text-neutral-600">
                Desbloquea acceso ilimitado con Premium.
              </p>
              <a
                href="/pricing"
                className="inline-flex items-center gap-1 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                Upgrade →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
