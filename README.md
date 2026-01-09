# Swipe LP Creator

**AI-Powered Swipe LP Builder** - 最短で「売れるスワイプLP」を作成・公開

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.1-orange?logo=firebase)](https://firebase.google.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare)](https://pages.cloudflare.com/)

---

## Overview

Swipe LP Creatorは、スワイプ型ランディングページを簡単に作成・公開できるWebアプリケーションです。

**画像がある人はアップロードだけ。ない人はAIで0から生成。**

## Features

### Core Features

| 機能                       | 説明                                           |
| -------------------------- | ---------------------------------------------- |
| **スワイプビューア**       | モバイル最適化されたフルスクリーンスワイプ表示 |
| **スクロールビューア**     | 代替表示モードとしてスクロール表示も対応       |
| **画像アップロード**       | 複数画像の一括アップロード対応                 |
| **ドラッグ&ドロップ**      | 直感的なスライド並び替え                       |
| **CTAボタン設定**          | テキスト・色・リンク先のカスタマイズ           |
| **トラッキング設定**       | GTM / Meta Pixel / カスタムスクリプト対応      |
| **リアルタイムプレビュー** | 編集内容を即座に確認                           |

### AI Features (Powered by OpenAI + Google Gemini)

| 機能               | 説明                                          |
| ------------------ | --------------------------------------------- |
| **AI LP生成**      | 商品情報からストーリーボード + 画像を自動生成 |
| **スライド再生成** | 個別スライドをプロンプト指定で再生成          |
| **利用制限管理**   | プランに応じたAI生成回数制限                  |

### User Management

| 機能                | 説明                                  |
| ------------------- | ------------------------------------- |
| **認証**            | メール/パスワード認証 (Firebase Auth) |
| **ダッシュボード**  | LP一覧管理・作成・削除                |
| **公開/非公開切替** | ワンクリックでLP公開状態を変更        |

---

## Tech Stack

| Layer          | Technology                                    |
| -------------- | --------------------------------------------- |
| **Frontend**   | Next.js 14 (App Router), React 18, TypeScript |
| **Styling**    | Tailwind CSS, Swiper.js                       |
| **Backend**    | Cloudflare Pages Functions                    |
| **Database**   | Firebase Firestore                            |
| **Storage**    | Firebase Storage                              |
| **Auth**       | Firebase Authentication                       |
| **AI (Text)**  | OpenAI GPT-4o                                 |
| **AI (Image)** | Google Gemini 2.0 Flash                       |
| **Hosting**    | Cloudflare Pages                              |

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Firebase Project
- Cloudflare Account
- OpenAI API Key
- Google AI (Gemini) API Key

### Installation

```bash
# Clone repository
git clone https://github.com/Enushin/swipe-lp-creator.git
cd swipe-lp-creator

# Install dependencies
npm install
```

### Environment Setup

1. `.env.example` をコピーして `.env.local` を作成:

```bash
cp .env.example .env.local
```

2. 環境変数を設定:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# AI API Keys (Cloudflare Functions用)
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=AI... # or GEMINI_API_KEY

# Firebase Project (Cloudflare Functions用)
FIREBASE_PROJECT_ID=your-project-id

# Auth Gate (Cloudflare Functions用)
AUTH_REQUIRED=true

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.pages.dev
```

### Firebase Setup

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクト作成
2. Authentication > Sign-in method で「メール/パスワード」を有効化
3. Firestore Database を作成
4. Storage を作成
5. Security Rules を設定:

```bash
# Firestore rules
cat firestore.rules

# Storage rules
cat storage.rules
```

### Development

```bash
# Start development server
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run build
```

---

## Project Structure

```
swipe-lp-creator/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── dashboard/         # Dashboard & Editor
│   │   ├── p/[id]/           # Public LP viewer
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   ├── dashboard/        # Dashboard components
│   │   ├── editor/           # Editor components
│   │   └── viewer/           # Viewer components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/
│   │   ├── ai/               # AI client
│   │   └── firebase/         # Firebase services
│   └── types/                 # TypeScript definitions
├── functions/
│   └── api/                   # Cloudflare Pages Functions
│       ├── generate-lp.ts    # AI LP generation
│       └── regenerate-slide.ts
├── docs/                      # Documentation
└── public/                    # Static assets
```

---

## Deployment

### Cloudflare Pages

1. Cloudflare Dashboard > Pages > Create a project
2. Connect to Git repository
3. Build settings:
   - Framework preset: `Next.js (Static HTML Export)`
   - Build command: `npm run build`
   - Build output directory: `out`
4. Environment variables を設定
5. Deploy

### Environment Variables (Cloudflare)

Cloudflare Pages の Settings > Environment variables で以下を設定:

| Variable         | Description           |
| ---------------- | --------------------- |
| `OPENAI_API_KEY` | OpenAI API Key        |
| `GOOGLE_AI_API_KEY` | Google Gemini API Key |
| `FIREBASE_PROJECT_ID` | Firebase Project ID |
| `AUTH_REQUIRED` | Require auth for AI endpoints |

---

## Usage

### 1. LP作成 (手動)

1. ダッシュボードで「新規作成」
2. 画像をアップロード
3. ドラッグ&ドロップで順序調整
4. CTA・トラッキング設定
5. 公開

### 2. LP作成 (AI生成)

1. ダッシュボードで「新規作成」
2. 「AI生成」タブを選択
3. 商品情報を入力:
   - 商品名
   - ターゲット層
   - 主要訴求ポイント
   - トーン（任意）
4. 「生成開始」をクリック
5. 生成されたスライドを確認・編集
6. 公開

### 3. 公開LP閲覧

```
https://your-domain.pages.dev/p/{lp-id}
```

---

## API Reference

### POST /api/generate-lp

AIによるLP生成

```json
{
  "productName": "商品名",
  "targetAudience": "20-30代女性",
  "keyBenefits": ["効果1", "効果2"],
  "tone": "カジュアル",
  "slideCount": 8
}
```

### POST /api/regenerate-slide

個別スライドの再生成

```json
{
  "slideType": "benefit",
  "prompt": "より具体的なベネフィットを強調",
  "context": {
    "productName": "商品名",
    "targetAudience": "ターゲット"
  }
}
```

---

## Plans & Limits

| Plan           | LP数   | スライド/LP | AI生成/月 |
| -------------- | ------ | ----------- | --------- |
| **Free**       | 3      | 10          | 10        |
| **Pro**        | 20     | 20          | 100       |
| **Enterprise** | 無制限 | 50          | 無制限    |

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Links

- [PRD (Product Requirements Document)](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Database Schema](docs/DATABASE.md)

---

**Built with Miyabi Framework** - Autonomous Development powered by Claude Code
