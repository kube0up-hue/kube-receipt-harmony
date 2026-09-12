import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { PermissionGuard, Can } from "@/components/permission-guard";
import { toast } from "sonner";
import { BookOpen, Plus } from "lucide-react";

type RecipeItem = { product_id: string; qty: number };

export const Route = createFileRoute("/_authenticated/admin/recipes")({
  head: () => ({
    meta: [
      { title: "الوصفات — KUBE Kitchen" },
      { name: "description", content: "وصفات KUBE بالمكوّنات والكميات مع حفظ كل إصدار سابق." },
      { property: "og:title", content: "الوصفات — KUBE Kitchen" },
      { property: "og:description", content: "وصفات المشروبات والحلا بالمكوّنات والإصدارات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["recipes_manage", "inventory_view"]}>
      <RecipesPage />
    </PermissionGuard>
  ),
});

function RecipesPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [yieldQty, setYieldQty] = useState("1");
  const [openId, setOpenId] = useState<string | null>(null);

  const products = useQuery({
    queryKey: ["recipe-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, name, unit").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const recipes = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("id, name, category, yield_qty, yield_unit, is_active, recipe_versions(id, version, items, note, created_at)")
        .order("name");
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const addRecipe = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("recipes").insert({
        name: name.trim(),
        category: category.trim() || null,
        yield_qty: Number(yieldQty) || 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم إضافة الوصفة");
      setName(""); setCategory("");
      qc.invalidateQueries({ queryKey: ["recipes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const list = recipes.data ?? [];

  return (
    <AppShell title="الوصفات" back={{ to: "/admin" }}>
      <Can anyOf={["recipes_manage"]}>
        <div className="kube-card mb-4 space-y-3">
          <h2 className="font-bold">وصفة جديدة</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <input className="kube-input" placeholder="اسم الوصفة" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="kube-input" placeholder="التصنيف (مشروب، حلا...)" value={category} onChange={(e) => setCategory(e.target.value)} />
            <input className="kube-input" type="number" inputMode="decimal" placeholder="الكمية الناتجة" value={yieldQty} onChange={(e) => setYieldQty(e.target.value)} />
          </div>
          <button className="kube-btn-primary" disabled={!name.trim() || addRecipe.isPending} onClick={() => addRecipe.mutate()}>
            <Plus className="w-4 h-4" /> إضافة
          </button>
        </div>
      </Can>

      {recipes.isLoading ? (
        <div className="kube-card text-center text-muted-foreground">جارٍ التحميل...</div>
      ) : list.length === 0 ? (
        <div className="kube-card text-center space-y-2">
          <BookOpen className="w-6 h-6 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">لا توجد وصفات بعد.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((r) => {
            const versions = [...(r.recipe_versions ?? [])].sort((a: any, b: any) => b.version - a.version);
            const latest = versions[0];
            return (
              <div key={r.id} className="kube-card">
                <button className="w-full text-right" onClick={() => setOpenId(openId === r.id ? null : r.id)}>
                  <div className="font-bold">{r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.category ?? "—"} · ينتج {Number(r.yield_qty)} {r.yield_unit} ·{" "}
                    {latest ? `الإصدار ${latest.version} (${(latest.items ?? []).length} مكوّن)` : "بلا إصدار بعد"}
                  </div>
                </button>

                {openId === r.id && (
                  <div className="mt-3 pt-3 border-t space-y-3">
                    {latest ? (
                      <div className="space-y-1">
                        {(latest.items ?? []).map((it: RecipeItem, i: number) => {
                          const p = (products.data ?? []).find((x) => x.id === it.product_id);
                          return (
                            <div key={i} className="text-sm flex justify-between">
                              <span>{p?.name ?? "صنف محذوف"}</span>
                              <span className="text-muted-foreground">{it.qty} {p?.unit ?? ""}</span>
                            </div>
                          );
                        })}
                        {latest.note && <div className="text-xs text-muted-foreground">{latest.note}</div>}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">لم يُسجَّل أي إصدار للمكوّنات.</p>
                    )}

                    <Can anyOf={["recipes_manage"]}>
                      <VersionEditor
                        recipeId={r.id}
                        nextVersion={(latest?.version ?? 0) + 1}
                        initial={(latest?.items ?? []) as RecipeItem[]}
                        products={products.data ?? []}
                        onSaved={() => qc.invalidateQueries({ queryKey: ["recipes"] })}
                      />
                    </Can>

                    {versions.length > 1 && (
                      <div className="text-xs text-muted-foreground">
                        الإصدارات السابقة: {versions.slice(1).map((v: any) => v.version).join(", ")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function VersionEditor({
  recipeId, nextVersion, initial, products, onSaved,
}: {
  recipeId: string;
  nextVersion: number;
  initial: RecipeItem[];
  products: Array<{ id: string; name: string; unit: string }>;
  onSaved: () => void;
}) {
  const [items, setItems] = useState<RecipeItem[]>(initial.length ? initial : [{ product_id: "", qty: 0 }]);
  const [note, setNote] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      const clean = items.filter((i) => i.product_id && Number(i.qty) > 0);
      if (clean.length === 0) throw new Error("أضف مكوّنًا واحدًا على الأقل");
      const { error } = await supabase.from("recipe_versions").insert({
        recipe_id: recipeId,
        version: nextVersion,
        items: clean,
        note: note.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`تم حفظ الإصدار ${nextVersion}`);
      setNote("");
      onSaved();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-2">
      <div className="text-sm font-bold">حفظ إصدار جديد ({nextVersion})</div>
      {items.map((it, i) => (
        <div key={i} className="grid grid-cols-[1fr_90px] gap-2">
          <select
            className="kube-input"
            value={it.product_id}
            onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, product_id: e.target.value } : x)))}
          >
            <option value="">اختر المكوّن</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            className="kube-input"
            type="number"
            inputMode="decimal"
            placeholder="الكمية"
            value={it.qty || ""}
            onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, qty: Number(e.target.value) } : x)))}
          />
        </div>
      ))}
      <button className="kube-btn-ghost text-sm" onClick={() => setItems([...items, { product_id: "", qty: 0 }])}>
        <Plus className="w-4 h-4" /> مكوّن آخر
      </button>
      <input className="kube-input" placeholder="سبب التعديل / ملاحظة" value={note} onChange={(e) => setNote(e.target.value)} />
      <button className="kube-btn-primary" disabled={save.isPending} onClick={() => save.mutate()}>
        حفظ الإصدار
      </button>
    </div>
  );
}
