// src/features/Navbar/presentation/components/AuthButtons.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AuthButtonsProps {
  isAuthenticated: boolean;
  userName?: string;
  userRole?: "client" | "admin";
  onLogout?: () => void;
}

export function AuthButtons({
  isAuthenticated,
  userName,
  userRole,
  onLogout,
}: AuthButtonsProps) {
  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-right hidden md:flex flex-col items-end">
          <span className="text-slate-200 text-sm font-medium">{userName}</span>
          {userRole && (
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                userRole === "admin"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {userRole === "admin" ? "Administrador" : "Cliente"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center border border-slate-600">
            <span className="text-white text-sm font-medium">
              {userName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <Button size="sm" onClick={onLogout}>
            Salir
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button size="sm" >
        <Link href="/login">Iniciar Sesión</Link>
      </Button>
    </div>
  );
}
