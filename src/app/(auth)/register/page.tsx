"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, loading, error, clearError } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError("");

    if (password !== confirmPassword) {
      setLocalError("パスワードが一致しません");
      return;
    }

    if (password.length < 8) {
      setLocalError("パスワードは8文字以上で入力してください");
      return;
    }

    try {
      await signUp(email, password, displayName || undefined);
      router.push("/dashboard");
    } catch {
      // Error is handled by useAuth
    }
  };

  const displayError = localError || error;

  return (
    <div className="card">
      <h1 className="mb-6 text-center text-2xl font-bold">アカウント作成</h1>

      {displayError && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="displayName"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            表示名（任意）
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full"
            placeholder="山田 太郎"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            パスワード（8文字以上）
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            パスワード（確認）
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary-600 py-3 font-bold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? "作成中..." : "アカウントを作成"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        すでにアカウントをお持ちですか？{" "}
        <Link href="/login" className="text-primary-600 hover:underline">
          ログイン
        </Link>
      </div>
    </div>
  );
}
