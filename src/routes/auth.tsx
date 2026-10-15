import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { signInWithPin, adminExists, bootstrapAdmin } from "@/lib/auth.functions";
import { fetchCurrentUser, primaryRoleHome } from "@/lib/current-user";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const cu = await fetchCurrentUser();
      throw redirect({ to: primaryRoleHome(cu?.roles ?? []) });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const [tab, setTab] = useState<"pin" | "email">("pin");
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);
  const checkAdmin = useServerFn(adminExists);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { checkAdmin().then((r) => setHasAdmin(r.exists)).catch(() => setHasAdmin(true)); }, [checkAdmin]);

  // هذا المسار ssr:false — الخادم لا يرسم شيئاً، فأول رسمة في المتصفح يجب أن تكون فارغة أيضاً.
  if (!mounted) return null;

  if (hasAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <img src={"/kube-logo.png"} alt="KUBE" className="h-32 sm:h-40 w-auto opacity-70" />
      </div>
    );
  }

  if (hasAdmin === false) return <SetupAdmin onDone={() => setHasAdmin(true)} />;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={"/kube-logo.png"} alt="KUBE" className="h-28 sm:h-36 w-auto mx-auto" />
          <div className="mt-4 font-display font-extrabold text-2xl tracking-tight text-foreground">KUBE ERP</div>
          <p className="text-muted-foreground text-xs font-display font-medium mt-1">منظومة إدارة التوريد والاستلامات ومطابقة الفواتير</p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex gap-1.5 mb-6 bg-muted/60 p-1.5 rounded-2xl border border-border/60">
            <button
              onClick={() => setTab("pin")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-display font-bold transition-all cursor-pointer ${
                tab === "pin" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              موظف فرع (PIN)
            </button>
            <button
              onClick={() => setTab("email")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-display font-bold transition-all cursor-pointer ${
                tab === "email" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              محاسب / إدارة
            </button>
          </div>
          {tab === "pin" ? <PinLogin /> : <EmailLogin />}
        </div>
      </div>
    </div>
  );
}

function PinLogin() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const doSignIn = useServerFn(signInWithPin);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin.trim()) return;
    setLoading(true);
    try {
      const { access_token, refresh_token } = await doSignIn({ data: { pin: pin.trim() } });
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) throw error;
      toast.success("تم تسجيل الدخول بنجاح");
      navigate({ to: "/employee" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="block text-xs font-display font-bold text-foreground mb-2">أدخل رمز الدخول السريع (PIN)</span>
        <input
          type="tel"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          maxLength={8}
          className="w-full h-14 rounded-2xl border border-border/80 bg-muted/20 text-center font-display font-black text-3xl tracking-[0.4em] focus:bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
          placeholder="••••"
        />
      </label>
      <button
        disabled={loading || pin.length < 4}
        className="kube-btn-primary w-full h-12 rounded-xl text-sm font-display font-bold disabled:opacity-40 cursor-pointer"
      >
        {loading ? "جارٍ التحقق والدخول…" : "تسجيل الدخول"}
      </button>
    </form>
  );
}

function EmailLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const cu = await fetchCurrentUser();
      toast.success("تم تسجيل الدخول");
      navigate({ to: primaryRoleHome(cu?.roles ?? []) });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="block text-sm font-semibold mb-2">البريد الإلكتروني</span>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="kube-input" dir="ltr" />
      </label>
      <label className="block">
        <span className="block text-sm font-semibold mb-2">كلمة المرور</span>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="kube-input" dir="ltr" />
      </label>
      <button disabled={loading} className="kube-btn-primary w-full disabled:opacity-50">
        {loading ? "جارٍ الدخول..." : "دخول"}
      </button>
    </form>
  );
}

function SetupAdmin({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const bootstrap = useServerFn(bootstrapAdmin);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await bootstrap({ data: { email, password, full_name: name } });
      toast.success("تم إنشاء حساب المدير. سجّل الدخول الآن.");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الإنشاء");
    } finally { setLoading(false); }
  }
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={"/kube-logo.png"} alt="KUBE" className="h-28 w-auto mx-auto" />
          <h1 className="mt-5 text-xl font-bold">تجهيز حساب المدير</h1>
          <p className="text-sm text-muted-foreground mt-1">هذه الخطوة تُنفَّذ مرة واحدة فقط.</p>
        </div>
        <form onSubmit={submit} className="kube-card space-y-4">
          <label className="block">
            <span className="block text-sm font-semibold mb-2">الاسم الكامل</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="kube-input" />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-2">البريد الإلكتروني</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="kube-input" dir="ltr" />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-2">كلمة المرور (8 أحرف على الأقل)</span>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="kube-input" dir="ltr" />
          </label>
          <button disabled={loading} className="kube-btn-primary w-full disabled:opacity-50">
            {loading ? "جارٍ الإنشاء..." : "إنشاء حساب المدير"}
          </button>
        </form>
      </div>
    </div>
  );
}
