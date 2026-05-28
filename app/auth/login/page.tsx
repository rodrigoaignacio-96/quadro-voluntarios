"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Church, Eye, EyeOff, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/* ─────────────────────────────────────────
   Schema de validação
───────────────────────────────────────── */
const loginSchema = z.object({
  email:    z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});
type LoginForm = z.infer<typeof loginSchema>;

/* ─────────────────────────────────────────
   Componente
───────────────────────────────────────── */
export default function LoginPage() {
  const { login, user, loading, authError, clearError } = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirect") ?? "/dashboard";

  const [showPwd,    setShowPwd]    = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  /* Já logado → vai direto */
  useEffect(() => {
    if (!loading && user) router.replace(redirectTo);
  }, [user, loading, router, redirectTo]);

  /* Propaga erro do Firebase para o campo senha */
  useEffect(() => {
    if (authError) {
      setError("password", { message: authError });
    }
  }, [authError, setError]);

  async function onSubmit(data: LoginForm) {
    clearError();
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      router.replace(redirectTo);
    } catch {
      /* Erro já propagado pelo useEffect acima */
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Background decorativo ── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
        {/* Glow âmbar central */}
        <div className="absolute top-[-15%] left-[35%] w-[700px] h-[700px] rounded-full bg-brand-500/[0.035] blur-[140px]" />
        {/* Glow roxo canto inferior */}
        <div className="absolute bottom-[-5%] right-[10%] w-[500px] h-[500px] rounded-full bg-violet-500/[0.04] blur-[120px]" />
        {/* Grid de pontos */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
        {/* Linha diagonal decorativa */}
        <div
          className="absolute top-0 right-0 w-px h-full opacity-[0.04]"
          style={{ background: "linear-gradient(to bottom, transparent, #eab308 40%, transparent)" }}
        />
      </div>

      {/* ── Card de login ── */}
      <div
        className="relative w-full max-w-[380px]"
        style={{ animation: "loginEnter 0.5s cubic-bezier(0.16,1,0.3,1) forwards" }}
      >

        {/* Logo + título */}
        <div className="text-center mb-8">
          {/* Ícone animado */}
          <div className="relative inline-flex mb-5">
            <div className="w-16 h-16 rounded-2xl bg-surface-100 border border-surface-400/60 flex items-center justify-center shadow-glow-sm">
              <Church className="w-8 h-8 text-brand-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-surface-0 border border-surface-400/60 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-brand-400" />
            </span>
          </div>

          <h1
            className="text-[26px] font-semibold text-white leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Quadro de Voluntários
          </h1>
          <p className="text-sm text-white/35 mt-2">
            Gestão ministerial · Acesso restrito
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-100 border border-surface-400/50 rounded-2xl overflow-hidden shadow-card">

          {/* Topo do card — label */}
          <div className="px-6 pt-6 pb-5 border-b border-surface-400/40">
            <h2 className="text-sm font-semibold text-white">Entrar na plataforma</h2>
            <p className="text-xs text-white/35 mt-0.5">Use seu e-mail e senha cadastrados</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5" noValidate>

            {/* Campo: e-mail */}
            <Field label="E-mail" error={errors.email?.message}>
              <input
                {...register("email")}
                type="email"
                placeholder="admin@suaigreja.com"
                autoComplete="email"
                disabled={submitting}
                className={cn(
                  "input-base",
                  errors.email && "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/10",
                  dirtyFields.email && !errors.email && "border-emerald-500/40"
                )}
              />
            </Field>

            {/* Campo: senha */}
            <Field label="Senha" error={errors.password?.message}>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={submitting}
                  className={cn(
                    "input-base pr-10",
                    errors.password && "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/10"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            {/* Erro global (Firebase) */}
            {authError && (
              <div
                className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/8 border border-red-500/20"
                role="alert"
                style={{ animation: "shake 0.4s cubic-bezier(.36,.07,.19,.97) both" }}
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 leading-relaxed">{authError}</p>
              </div>
            )}

            {/* Botão submit */}
            <button
              type="submit"
              disabled={submitting || !isValid}
              className={cn(
                "btn-primary w-full h-11 text-sm font-semibold mt-1",
                "transition-all duration-200",
                (!isValid && !submitting) && "opacity-40 cursor-not-allowed"
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                "Entrar no sistema"
              )}
            </button>

          </form>
        </div>

        {/* Rodapé */}
        <p className="text-center text-xs text-white/18 mt-6 select-none">
          Sistema interno · Não compartilhe suas credenciais
        </p>
      </div>

      {/* Animações locais */}
      <style>{`
        @keyframes loginEnter {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX( 2px); }
          30%, 50%, 70% { transform: translateX(-3px); }
          40%, 60% { transform: translateX( 3px); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────
   Field — wrapper de campo com label + erro
───────────────────────────────────────── */
function Field({
  label,
  error,
  children,
}: {
  label:    string;
  error?:   string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/40">
        {label}
      </label>
      {children}
      {error && (
        <p
          className="text-[11px] text-red-400 flex items-center gap-1"
          style={{ animation: "fadeIn 0.2s ease" }}
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
