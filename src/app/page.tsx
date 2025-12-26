import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Swipe LP Creator
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          AI-Powered Swipe LP Builder
          <br />
          最短で「売れるスワイプLP」を作成
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="rounded-xl bg-primary-600 px-8 py-4 font-bold text-white shadow-lg transition-colors hover:bg-primary-700"
          >
            ダッシュボードへ
          </Link>
          <Link
            href="/p/demo"
            className="rounded-xl border-2 border-primary-600 bg-white px-8 py-4 font-bold text-primary-600 transition-colors hover:bg-primary-50"
          >
            デモを見る
          </Link>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          <div className="card">
            <div className="mb-2 text-3xl">📱</div>
            <h3 className="mb-1 font-bold">モバイルファースト</h3>
            <p className="text-sm text-gray-600">スマホで最適なスワイプ体験</p>
          </div>
          <div className="card">
            <div className="mb-2 text-3xl">🤖</div>
            <h3 className="mb-1 font-bold">AI自動生成</h3>
            <p className="text-sm text-gray-600">商品情報だけでLP作成</p>
          </div>
          <div className="card">
            <div className="mb-2 text-3xl">📊</div>
            <h3 className="mb-1 font-bold">トラッキング対応</h3>
            <p className="text-sm text-gray-600">GTM/Pixel タグ設置可能</p>
          </div>
        </div>
      </div>
    </main>
  );
}
