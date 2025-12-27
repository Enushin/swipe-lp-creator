import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Mesh gradient background */}
      <div className="mesh-bg fixed inset-0 -z-10" />
      <div className="fixed inset-0 -z-10 bg-[var(--surface-base)]" />

      {/* Animated gradient orbs */}
      <div className="-z-5 fixed left-1/4 top-1/4 h-[500px] w-[500px] animate-float rounded-full bg-[var(--color-brand)] opacity-10 blur-[120px]" />
      <div className="-z-5 fixed right-1/4 top-1/2 h-[400px] w-[400px] animate-float rounded-full bg-[var(--color-accent-violet)] opacity-10 blur-[100px] [animation-delay:2s]" />
      <div className="-z-5 opacity-8 fixed bottom-1/4 left-1/2 h-[300px] w-[300px] animate-float rounded-full bg-[var(--color-accent-fuchsia)] blur-[80px] [animation-delay:4s]" />

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-light)] px-4 py-2 backdrop-blur-xl">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-brand)]" />
            <span className="font-display text-sm font-medium text-[var(--text-secondary)]">
              AI-Powered LP Creator
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-6 animate-slide-up font-display text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl">
            <span className="text-gradient">最短で売れる</span>
            <br />
            <span className="text-[var(--text-primary)]">スワイプLPを作成</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mb-10 max-w-xl animate-slide-up text-lg text-[var(--text-secondary)] [animation-delay:0.1s] sm:text-xl">
            商品情報を入力するだけで、AIが魅力的なランディングページを自動生成。
            <br className="hidden sm:block" />
            モバイルファーストで、高いコンバージョンを実現します。
          </p>

          {/* CTA Buttons */}
          <div className="flex animate-slide-up flex-col items-center gap-4 [animation-delay:0.2s] sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="btn-primary group flex items-center gap-3 text-lg"
            >
              <span>無料で始める</span>
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/p/demo"
              className="btn-secondary flex items-center gap-2 text-lg"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>デモを見る</span>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="h-6 w-6 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          {/* Section header */}
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
              なぜ<span className="text-gradient">Swipe LP</span>なのか
            </h2>
            <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
              従来のLPビルダーとは一線を画す、次世代のランディングページ体験を提供します
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="glass-card hover:border-[var(--color-brand)]/30 group p-8 transition-all duration-500">
              <div className="shadow-[var(--color-brand)]/25 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] shadow-lg transition-transform duration-500 group-hover:scale-110">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 font-display text-xl font-semibold text-[var(--text-primary)]">
                モバイルファースト
              </h3>
              <p className="text-[var(--text-secondary)]">
                スマートフォンでの閲覧に最適化されたスワイプ操作で、直感的なユーザー体験を実現
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card hover:border-[var(--color-accent-violet)]/30 group p-8 transition-all duration-500">
              <div className="shadow-[var(--color-accent-violet)]/25 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-accent-violet)] to-purple-700 shadow-lg transition-transform duration-500 group-hover:scale-110">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 font-display text-xl font-semibold text-[var(--text-primary)]">
                AI自動生成
              </h3>
              <p className="text-[var(--text-secondary)]">
                商品情報を入力するだけで、AIがコピーライティングからデザインまで自動生成
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card hover:border-[var(--color-accent-fuchsia)]/30 group p-8 transition-all duration-500">
              <div className="shadow-[var(--color-accent-fuchsia)]/25 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-accent-fuchsia)] to-pink-700 shadow-lg transition-transform duration-500 group-hover:scale-110">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 font-display text-xl font-semibold text-[var(--text-primary)]">
                高度なトラッキング
              </h3>
              <p className="text-[var(--text-secondary)]">
                GTM/Meta
                Pixel対応で詳細な分析が可能。コンバージョン最適化をデータドリブンで実現
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="glass-card p-10">
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-gradient mb-2 font-display text-4xl font-bold sm:text-5xl">
                  3x
                </div>
                <p className="text-[var(--text-secondary)]">より高いCVR</p>
              </div>
              <div className="text-center">
                <div className="text-gradient-accent mb-2 font-display text-4xl font-bold sm:text-5xl">
                  5分
                </div>
                <p className="text-[var(--text-secondary)]">でLP作成完了</p>
              </div>
              <div className="text-center">
                <div className="text-gradient mb-2 font-display text-4xl font-bold sm:text-5xl">
                  ¥0
                </div>
                <p className="text-[var(--text-secondary)]">から始められる</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 font-display text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            今すぐ<span className="text-gradient">スワイプLP</span>を作成しよう
          </h2>
          <p className="mb-10 text-lg text-[var(--text-secondary)]">
            無料プランでも基本機能は全て使えます。
            <br />
            アカウント登録不要でデモを体験できます。
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="btn-primary animate-pulse-glow px-10 py-5 text-lg"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--glass-border)] px-6 py-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} Swipe LP Creator. All rights
            reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
