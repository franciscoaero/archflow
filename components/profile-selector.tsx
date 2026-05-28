"use client";

import { useState, useEffect } from "react";
import { User, ChevronDown } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  hourlyRate: number | null;
  currency: string;
}

export function ProfileSelector() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/profiles")
      .then((r) => r.json())
      .then((data) => {
        setProfiles(data);
        const stored = localStorage.getItem("archflow-profile");
        if (stored && data.find((p: Profile) => p.id === stored)) {
          setActiveId(stored);
        } else if (data.length > 0) {
          setActiveId(data[0].id);
          localStorage.setItem("archflow-profile", data[0].id);
        }
      });
  }, []);

  function selectProfile(id: string) {
    setActiveId(id);
    localStorage.setItem("archflow-profile", id);
    setOpen(false);
    window.location.reload();
  }

  const active = profiles.find((p) => p.id === activeId);

  if (profiles.length <= 1) return null;

  return (
    <div className="relative px-3 pb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
      >
        <User className="h-3.5 w-3.5" />
        <span className="flex-1 text-left truncate">{active?.name || "Perfil"}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute bottom-full left-3 right-3 mb-1 rounded-md border bg-card shadow-lg z-50">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => selectProfile(p.id)}
              className={`block w-full text-left px-3 py-2 text-sm hover:bg-accent ${
                p.id === activeId ? "font-medium text-primary" : ""
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
