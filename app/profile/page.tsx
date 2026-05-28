"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Profile {
  id: string;
  name: string;
  hourlyRate: number | null;
  currency: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formRate, setFormRate] = useState("");
  const [formCurrency, setFormCurrency] = useState("USD");
  const [creating, setCreating] = useState(false);

  const activeId = typeof window !== "undefined"
    ? localStorage.getItem("archflow-profile") || ""
    : "";

  const fetchProfiles = useCallback(async () => {
    const res = await fetch("/api/profiles");
    const data = await res.json();
    setProfiles(data);
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  function startEdit(profile: Profile) {
    setEditing(profile.id);
    setFormName(profile.name);
    setFormRate(profile.hourlyRate?.toString() || "");
    setFormCurrency(profile.currency);
  }

  function startCreate() {
    setCreating(true);
    setFormName("");
    setFormRate("");
    setFormCurrency("USD");
  }

  async function handleSave() {
    if (!formName.trim()) return;

    if (editing) {
      await fetch("/api/profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing,
          name: formName,
          hourlyRate: formRate ? parseFloat(formRate) : null,
          currency: formCurrency,
        }),
      });
      setEditing(null);
    } else {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          hourlyRate: formRate ? parseFloat(formRate) : null,
          currency: formCurrency,
        }),
      });
      const newProfile = await res.json();
      localStorage.setItem("archflow-profile", newProfile.id);
      setCreating(false);
    }
    fetchProfiles();
  }

  function setActive(id: string) {
    localStorage.setItem("archflow-profile", id);
    window.location.reload();
  }

  const isEditing = editing || creating;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Perfis</h2>
        <Button onClick={startCreate} disabled={!!isEditing}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Perfil
        </Button>
      </div>

      {(editing || creating) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editing ? "Editar Perfil" : "Novo Perfil"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-xs text-muted-foreground">Nome *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Seu nome"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Valor/hora</label>
                <input
                  type="number"
                  value={formRate}
                  onChange={(e) => setFormRate(e.target.value)}
                  placeholder="35.00"
                  step="0.01"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Moeda</label>
                <select
                  value={formCurrency}
                  onChange={(e) => setFormCurrency(e.target.value)}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="USD">USD ($)</option>
                  <option value="BRL">BRL (R$)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={!formName.trim()} size="sm">
                  <Check className="h-4 w-4 mr-1" />
                  Salvar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setEditing(null); setCreating(false); }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {profiles.map((profile) => (
          <Card
            key={profile.id}
            className={profile.id === activeId ? "border-primary" : ""}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{profile.name}</h3>
                    {profile.id === activeId && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        ativo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.hourlyRate
                      ? `${profile.currency} ${profile.hourlyRate.toFixed(2)}/h`
                      : "Sem rate definido"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {profile.id !== activeId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActive(profile.id)}
                    >
                      Ativar
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => startEdit(profile)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
