# swipe-lp-creator - アーキテクチャ設計書

**バージョン**: 1.0.0
**最終更新**: 2025-12-27

---

## 1. アーキテクチャ概要

### 1.1 設計思想

**"Weak & Fast Architecture"**

サーバーレス・静的エクスポートを基盤とし、低コストかつ高可用性を実現する。

### 1.2 システム全体図

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USERS                                       │
│                    (Mobile / PC Browser)                                 │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE EDGE                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │
│  │ Cloudflare Pages │  │   CDN Cache     │  │  Cloudflare Functions   │ │
│  │  (Static Host)   │  │  (Asset Cache)  │  │   (API Proxy)           │ │
│  │                  │  │                 │  │   /api/generate-lp      │ │
│  │  Next.js Static  │  │  Images, JS,    │  │   /api/regenerate-slide │ │
│  │  Export          │  │  CSS            │  │                         │ │
│  └─────────────────┘  └─────────────────┘  └───────────┬─────────────┘ │
└───────────────────────────────┬─────────────────────────┼───────────────┘
                                │                         │
                                ▼                         ▼
┌─────────────────────────────────────────┐  ┌─────────────────────────────┐
│              FIREBASE                    │  │         AI SERVICES          │
│  ┌─────────────┐  ┌─────────────────┐   │  │                             │
│  │   Auth      │  │   Firestore     │   │  │  ┌─────────────────────┐   │
│  │             │  │                 │   │  │  │  OpenAI GPT-5.2     │   │
│  │  - Email    │  │  - users        │   │  │  │  (Thinking High)    │   │
│  │  - Google   │  │  - lps          │   │  │  │                     │   │
│  │             │  │  - slides       │   │  │  │  Storyboard Gen     │   │
│  └─────────────┘  └─────────────────┘   │  │  └─────────────────────┘   │
│                                          │  │                             │
│  ┌──────────────────────────────────┐   │  │  ┌─────────────────────┐   │
│  │         Firebase Storage          │   │  │  │ Gemini 3 Pro Image │   │
│  │                                   │   │  │  │ (gemini-3-pro-     │   │
│  │  - Uploaded images               │   │  │  │  image-preview)     │   │
│  │  - AI generated images           │   │  │  │                     │   │
│  │  - Optimized thumbnails          │   │  │  │  Image Generation   │   │
│  └──────────────────────────────────┘   │  │  └─────────────────────┘   │
└─────────────────────────────────────────┘  └─────────────────────────────┘
```

---

## 2. 技術スタック

### 2.1 フロントエンド

| カテゴリ      | 技術                 | バージョン | 用途              |
| ------------- | -------------------- | ---------- | ----------------- |
| Framework     | Next.js (App Router) | 14.x       | SSG + CSR         |
| Language      | TypeScript           | 5.x        | 型安全性          |
| Styling       | Tailwind CSS         | 3.x        | ユーティリティCSS |
| UI Components | Radix UI             | latest     | アクセシブルUI    |
| Swipe         | Swiper.js            | 11.x       | スワイプ操作      |
| DnD           | @dnd-kit/core        | 6.x        | ドラッグ&ドロップ |
| Forms         | React Hook Form      | 7.x        | フォーム管理      |
| Validation    | Zod                  | 3.x        | スキーマ検証      |

### 2.2 バックエンド (BaaS)

| カテゴリ       | 技術                 | 用途           |
| -------------- | -------------------- | -------------- |
| Authentication | Firebase Auth        | ユーザー認証   |
| Database       | Cloud Firestore      | ドキュメントDB |
| Storage        | Firebase Storage     | 画像ストレージ |
| Functions      | Cloudflare Functions | APIプロキシ    |

### 2.3 AI サービス

| 用途               | サービス         | モデル                     |
| ------------------ | ---------------- | -------------------------- |
| テキスト生成・推論 | OpenAI API       | GPT-5.2 (Thinking High)    |
| 画像生成           | Google AI Studio | gemini-3-pro-image-preview |

### 2.4 インフラ

| カテゴリ       | 技術                 | 用途                   |
| -------------- | -------------------- | ---------------------- |
| Hosting        | Cloudflare Pages     | 静的サイトホスティング |
| CDN            | Cloudflare CDN       | アセット配信           |
| Domain         | Cloudflare DNS       | DNS管理                |
| Edge Functions | Cloudflare Functions | サーバーレス処理       |

---

## 3. ディレクトリ構造

```
swipe-lp-creator/
├── .claude/                    # Claude Code設定
│   ├── agents/                 # Agentプロンプト
│   ├── commands/               # カスタムコマンド
│   └── settings.json
├── .github/
│   └── workflows/              # GitHub Actions
├── docs/                       # ドキュメント
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   └── API.md
├── functions/                  # Cloudflare Functions
│   └── api/
│       ├── generate-lp.ts
│       └── regenerate-slide.ts
├── public/                     # 静的アセット
│   └── images/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 認証関連ページ
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # 管理画面
│   │   │   ├── page.tsx       # LP一覧
│   │   │   └── editor/[id]/   # LP編集
│   │   ├── p/[id]/            # 公開ビューア
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx           # ランディング
│   ├── components/
│   │   ├── ui/                # 基本UIコンポーネント
│   │   ├── viewer/            # ビューア関連
│   │   │   ├── SwipeViewer.tsx
│   │   │   ├── ScrollViewer.tsx
│   │   │   └── CTAButton.tsx
│   │   ├── editor/            # エディタ関連
│   │   │   ├── SlideList.tsx
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── AIGenerator.tsx
│   │   │   └── SettingsPanel.tsx
│   │   └── dashboard/         # ダッシュボード
│   │       └── LPCard.tsx
│   ├── lib/
│   │   ├── firebase/          # Firebase設定
│   │   │   ├── config.ts
│   │   │   ├── auth.ts
│   │   │   ├── firestore.ts
│   │   │   └── storage.ts
│   │   ├── api/               # API クライアント
│   │   │   └── ai.ts
│   │   └── utils/             # ユーティリティ
│   ├── hooks/                 # カスタムフック
│   │   ├── useAuth.ts
│   │   ├── useLP.ts
│   │   └── useAIGenerate.ts
│   ├── types/                 # 型定義
│   │   ├── lp.ts
│   │   └── api.ts
│   └── styles/
│       └── globals.css
├── tests/                     # テスト
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 4. コンポーネント設計

### 4.1 ページ構成

```
/                       → ランディングページ（サービス紹介）
/login                  → ログイン
/register               → 新規登録
/dashboard              → LP一覧（要認証）
/dashboard/editor/[id]  → LP編集画面（要認証）
/p/[id]                 → 公開ビューア（認証不要）
```

### 4.2 ビューアコンポーネント階層

```tsx
// /p/[id]/page.tsx
<ViewerPage>
  <TrackingTagInjector tags={lp.tracking_tags} />

  {lp.view_mode === "swipe" ? (
    <SwipeViewer>
      <Swiper pagination={{ type: "progressbar" }}>
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <SlideImage src={slide.image_url} />
          </SwiperSlide>
        ))}
      </Swiper>
    </SwipeViewer>
  ) : (
    <ScrollViewer>
      {slides.map((slide) => (
        <ScrollSlide key={slide.id}>
          <SlideImage src={slide.image_url} />
        </ScrollSlide>
      ))}
    </ScrollViewer>
  )}

  <CTAButton config={lp.cta_config} />
</ViewerPage>
```

### 4.3 エディタコンポーネント階層

```tsx
// /dashboard/editor/[id]/page.tsx
<EditorPage>
  <EditorHeader lpTitle={lp.title} />

  <EditorContent>
    <SlidePanel>
      <SlideList slides={slides} onReorder={handleReorder} />
      <AddSlideButton />
    </SlidePanel>

    <PreviewPanel>
      <DeviceFrame>
        <SwipeViewer slides={slides} />
      </DeviceFrame>
    </PreviewPanel>

    <SettingsPanel>
      <Tabs>
        <Tab label="CTA設定">
          <CTASettings config={cta_config} />
        </Tab>
        <Tab label="トラッキング">
          <TrackingSettings tags={tracking_tags} />
        </Tab>
        <Tab label="AI生成">
          <AIGenerator onGenerate={handleAIGenerate} />
        </Tab>
      </Tabs>
    </SettingsPanel>
  </EditorContent>
</EditorPage>
```

---

## 5. データフロー

### 5.1 認証フロー

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐
│  Client  │────▶│ Firebase Auth │────▶│  Firestore  │
│          │◀────│              │◀────│  (users)    │
└──────────┘     └──────────────┘     └─────────────┘
     │
     │ onAuthStateChanged
     ▼
┌──────────────────┐
│ useAuth Hook     │
│ - user state     │
│ - loading state  │
│ - error handling │
└──────────────────┘
```

### 5.2 LP表示フロー（公開ビューア）

```
┌──────────────────────────────────────────────────────────────────┐
│                         /p/[lp_id]                                │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ 1. URL Param から lp_id を取得                                    │
│ 2. Firestore から LP データ取得                                   │
│    - doc: lps/{lp_id}                                            │
│    - fields: slides, cta_config, tracking_tags, view_mode        │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ 3. tracking_tags を Head/Body に注入                              │
│    - head_html → <Head> に挿入                                   │
│    - body_html → <body> 直後に挿入                               │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ 4. view_mode に応じてレンダリング                                 │
│    - swipe → SwipeViewer (Swiper.js)                             │
│    - scroll → ScrollViewer (縦スクロール)                        │
└──────────────────────────────────────────────────────────────────┘
```

### 5.3 AI生成フロー

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ AIGenerator Component                                            │   │
│  │ - Product Name: "オーガニック美容液"                              │   │
│  │ - Target: "30代女性、敏感肌"                                      │   │
│  │ - Appeal: "天然成分100%、肌荒れ改善"                             │   │
│  └──────────────────────────────┬──────────────────────────────────┘   │
└─────────────────────────────────┼───────────────────────────────────────┘
                                  │ POST /api/generate-lp
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE FUNCTIONS                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ /functions/api/generate-lp.ts                                    │   │
│  └──────────────────────────────┬──────────────────────────────────┘   │
└─────────────────────────────────┼───────────────────────────────────────┘
                                  │
              ┌───────────────────┴───────────────────┐
              ▼                                       ▼
┌─────────────────────────┐             ┌─────────────────────────┐
│     OpenAI GPT-5.2      │             │   Gemini 3 Pro Image    │
│    (Thinking High)      │             │                         │
│                         │             │                         │
│ Input:                  │             │ Input:                  │
│ - Product info          │ ──────────▶ │ - Image prompts         │
│                         │  Prompts    │   (from GPT-5.2)        │
│ Output:                 │             │                         │
│ - Storyboard (5-10)     │             │ Output:                 │
│ - Image prompts         │             │ - Generated images      │
└─────────────────────────┘             └───────────┬─────────────┘
                                                    │
                                                    ▼
                                        ┌─────────────────────────┐
                                        │   Firebase Storage      │
                                        │                         │
                                        │ Upload generated images │
                                        │ Return URLs             │
                                        └───────────┬─────────────┘
                                                    │
                                                    ▼
                                        ┌─────────────────────────┐
                                        │   Response to Client    │
                                        │                         │
                                        │ { slides: [...] }       │
                                        └─────────────────────────┘
```

---

## 6. セキュリティ設計

### 6.1 認証・認可

```typescript
// Firebase Security Rules (Firestore)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のLPのみ読み書き可能
    match /lps/{lpId} {
      allow read: if resource.data.status == 'published'
                  || request.auth.uid == resource.data.owner_id;
      allow write: if request.auth.uid == resource.data.owner_id;
      allow create: if request.auth != null;
    }

    // ユーザープロファイル
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### 6.2 APIキー管理

```
┌─────────────────────────────────────────────────────────────────┐
│                 CLOUDFLARE FUNCTIONS                             │
│                                                                  │
│  Environment Variables (Secret):                                 │
│  - OPENAI_API_KEY                                               │
│  - GOOGLE_AI_API_KEY                                            │
│  - FIREBASE_SERVICE_ACCOUNT                                     │
│                                                                  │
│  ※ クライアントには一切露出しない                                │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 トラッキングタグのセキュリティ

```typescript
// XSS対策（基本的には信頼するが、危険なパターンは警告）
const validateTrackingTag = (html: string): ValidationResult => {
  const dangerousPatterns = [
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, etc.
    /<script[^>]*>[^<]*<\/script>/i, // inline script (GTM以外)
  ];

  // GTM/Pixel の正規パターンは許可
  const allowedPatterns = [
    /googletagmanager\.com/,
    /gtag\(/,
    /fbq\(/,
    /connect\.facebook\.net/,
  ];

  return { isValid, warnings };
};
```

---

## 7. パフォーマンス最適化

### 7.1 画像最適化

```typescript
// Firebase Storage + Cloudflare 画像変換
const getOptimizedImageUrl = (originalUrl: string, options: ImageOptions) => {
  // Cloudflare Image Resizing を活用
  return `${originalUrl}?width=${options.width}&format=webp&quality=80`;
};

// Next.js Image コンポーネント使用
<Image
  src={slide.image_url}
  alt=""
  fill
  sizes="(max-width: 430px) 100vw, 430px"
  priority={index === 0}  // First slide は優先読み込み
/>
```

### 7.2 データ取得最適化

```typescript
// Firestore クエリ最適化
const fetchLP = async (lpId: string) => {
  // 必要なフィールドのみ取得
  const lpRef = doc(db, "lps", lpId);
  const lpSnap = await getDoc(lpRef);

  // クライアントキャッシュ
  return lpSnap.data();
};

// SWR によるキャッシュ戦略
const { data: lp } = useSWR(lpId ? `lp/${lpId}` : null, () => fetchLP(lpId), {
  revalidateOnFocus: false,
  dedupingInterval: 60000, // 1分間は再フェッチしない
});
```

### 7.3 バンドル最適化

```javascript
// next.config.js
module.exports = {
  output: "export",
  images: {
    unoptimized: true, // Static export では必須
  },
  experimental: {
    optimizeCss: true,
  },
};
```

---

## 8. デプロイメント

### 8.1 Cloudflare Pages 設定

```yaml
# wrangler.toml
name = "swipe-lp-creator"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"
output_directory = "out"

[[routes]]
pattern = "/api/*"
script = "functions/api/[[path]].ts"

[env.production]
# 環境変数は Cloudflare Dashboard で設定
```

### 8.2 デプロイフロー

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│   GitHub    │────▶│   Actions   │────▶│  Cloudflare Pages   │
│   (main)    │     │   (Build)   │     │  (Deploy)           │
└─────────────┘     └─────────────┘     └─────────────────────┘
      │                   │                       │
      │                   ▼                       ▼
      │            ┌─────────────┐         ┌─────────────┐
      │            │  npm test   │         │  Preview    │
      │            │  npm build  │         │  Production │
      │            └─────────────┘         └─────────────┘
      │
      └── PR → Preview URL自動生成
```

---

## 9. 監視・ログ

### 9.1 エラー監視

- Cloudflare Analytics
- Firebase Crashlytics (将来的に)
- Sentry (オプション)

### 9.2 パフォーマンス監視

- Core Web Vitals (Cloudflare)
- Firebase Performance Monitoring

---

**作成者**: Claude Code (Miyabi Agent)
**レビュー**: Pending
