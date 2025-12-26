"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface DashboardHeaderProps {
  children?: React.ReactNode;
}

export function DashboardHeader({ children }: DashboardHeaderProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    if (confirm("ログアウトしますか？")) {
      await signOut();
    }
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            Swipe LP Creator
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {children}

          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
