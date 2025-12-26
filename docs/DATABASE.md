# swipe-lp-creator - データベース設計書

**バージョン**: 1.0.0
**最終更新**: 2025-12-27

---

## 1. データベース概要

### 1.1 使用技術

- **Database**: Cloud Firestore (NoSQL)
- **Storage**: Firebase Storage

### 1.2 設計方針

- ドキュメント指向設計
- 読み取り最適化（公開ビューアの高速表示）
- スライドデータは埋め込み（サブコレクション不使用）

---

## 2. コレクション構造

```
firestore/
├── users/                    # ユーザー情報
│   └── {userId}/
├── lps/                      # LP情報（メイン）
│   └── {lpId}/
└── usage/                    # 利用統計（将来用）
    └── {userId}/
```

---

## 3. コレクション詳細

### 3.1 users コレクション

ユーザーのプロファイル情報を管理。

```typescript
// Collection: users
// Document ID: Firebase Auth UID

interface User {
  // 基本情報
  uid: string; // Firebase Auth UID
  email: string; // メールアドレス
  displayName: string | null; // 表示名
  photoURL: string | null; // プロフィール画像URL

  // プラン情報（将来拡張用）
  plan: "free" | "pro" | "enterprise";
  planExpiresAt: Timestamp | null;

  // 利用制限
  limits: {
    maxLPs: number; // 作成可能LP数
    maxSlidesPerLP: number; // LP当たりスライド数
    aiGenerationsPerMonth: number; // 月間AI生成回数
    aiGenerationsUsed: number; // 今月使用済み回数
    resetAt: Timestamp; // リセット日時
  };

  // メタデータ
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
}
```

**インデックス**:
| フィールド | 順序 | 用途 |
|-----------|------|------|
| email | ASC | メール検索 |
| createdAt | DESC | 新規ユーザー一覧 |

**サンプルデータ**:

```json
{
  "uid": "abc123xyz",
  "email": "user@example.com",
  "displayName": "田中太郎",
  "photoURL": null,
  "plan": "free",
  "planExpiresAt": null,
  "limits": {
    "maxLPs": 5,
    "maxSlidesPerLP": 10,
    "aiGenerationsPerMonth": 10,
    "aiGenerationsUsed": 3,
    "resetAt": "2025-02-01T00:00:00Z"
  },
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-20T14:00:00Z",
  "lastLoginAt": "2025-01-20T14:00:00Z"
}
```

---

### 3.2 lps コレクション

LP（ランディングページ）のデータを管理。

```typescript
// Collection: lps
// Document ID: カスタムID（URLスラッグ）または auto-generated

interface LP {
  // 識別情報
  id: string; // ドキュメントID（URLの末尾になる）
  ownerId: string; // 作成者のUID

  // 基本情報
  title: string; // 管理用タイトル
  description: string | null; // 管理用メモ

  // ステータス
  status: "draft" | "published"; // 公開状態
  viewMode: "swipe" | "scroll"; // 表示モード

  // スライドデータ（埋め込み）
  slides: Slide[];

  // CTA設定
  ctaConfig: CTAConfig;

  // トラッキングタグ
  trackingTags: TrackingTags;

  // AI生成メタデータ（オプション）
  aiMetadata: AIMetadata | null;

  // メタデータ
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt: Timestamp | null;

  // 統計（将来用）
  stats: {
    views: number;
    ctaClicks: number;
  };
}

// スライド
interface Slide {
  id: string; // UUID
  imageUrl: string; // Firebase Storage URL
  thumbnailUrl: string | null; // サムネイルURL（最適化済み）
  captionText: string | null; // キャプション/メモ
  order: number; // 表示順序（0始まり）
  aiPrompt: string | null; // AI生成時のプロンプト
  createdAt: Timestamp;
}

// CTA設定
interface CTAConfig {
  text: string; // ボタンテキスト
  url: string; // リンク先URL
  bgColor: string; // 背景色（HEX）
  textColor: string; // 文字色（HEX）
  isVisible: boolean; // 表示/非表示
  position: "bottom" | "overlay"; // 表示位置（将来拡張）
}

// トラッキングタグ
interface TrackingTags {
  headHtml: string; // <head>に挿入するHTML
  bodyHtml: string; // <body>直後に挿入するHTML
}

// AI生成メタデータ
interface AIMetadata {
  productName: string; // 商品名
  targetAudience: string; // ターゲット層
  keyAppeal: string; // 訴求ポイント
  generatedAt: Timestamp; // 生成日時
  model: {
    text: string; // 使用テキストモデル
    image: string; // 使用画像モデル
  };
}
```

**インデックス**:
| フィールド | 順序 | 用途 |
|-----------|------|------|
| ownerId | ASC | ユーザーのLP一覧 |
| ownerId, createdAt | ASC, DESC | ユーザーのLP一覧（新しい順） |
| status | ASC | 公開LP一覧 |
| updatedAt | DESC | 最近更新順 |

**サンプルデータ**:

```json
{
  "id": "beauty-serum-2025",
  "ownerId": "abc123xyz",
  "title": "オーガニック美容液LP",
  "description": "春のキャンペーン用",
  "status": "published",
  "viewMode": "swipe",
  "slides": [
    {
      "id": "slide-001",
      "imageUrl": "https://storage.googleapis.com/.../slide1.webp",
      "thumbnailUrl": "https://storage.googleapis.com/.../slide1_thumb.webp",
      "captionText": "フック：肌の悩み、解決します",
      "order": 0,
      "aiPrompt": "A beautiful woman with glowing skin...",
      "createdAt": "2025-01-20T10:00:00Z"
    },
    {
      "id": "slide-002",
      "imageUrl": "https://storage.googleapis.com/.../slide2.webp",
      "thumbnailUrl": null,
      "captionText": "問題提起：乾燥・くすみに悩んでいませんか？",
      "order": 1,
      "aiPrompt": null,
      "createdAt": "2025-01-20T10:01:00Z"
    }
  ],
  "ctaConfig": {
    "text": "今すぐ購入する",
    "url": "https://shop.example.com/product/123",
    "bgColor": "#FF6B6B",
    "textColor": "#FFFFFF",
    "isVisible": true,
    "position": "bottom"
  },
  "trackingTags": {
    "headHtml": "<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXXX');</script>",
    "bodyHtml": "<noscript><iframe src=\"https://www.googletagmanager.com/ns.html?id=GTM-XXXXX\"></iframe></noscript>"
  },
  "aiMetadata": {
    "productName": "オーガニック美容液",
    "targetAudience": "30代女性、敏感肌",
    "keyAppeal": "天然成分100%、肌荒れ改善",
    "generatedAt": "2025-01-20T09:55:00Z",
    "model": {
      "text": "gpt-5.2-thinking-high",
      "image": "gemini-3-pro-image-preview"
    }
  },
  "createdAt": "2025-01-20T09:50:00Z",
  "updatedAt": "2025-01-20T12:30:00Z",
  "publishedAt": "2025-01-20T12:30:00Z",
  "stats": {
    "views": 1523,
    "ctaClicks": 89
  }
}
```

---

## 4. Firebase Storage 構造

```
storage/
├── users/
│   └── {userId}/
│       └── lps/
│           └── {lpId}/
│               ├── slides/
│               │   ├── {slideId}.webp      # オリジナル
│               │   └── {slideId}_thumb.webp # サムネイル
│               └── temp/                    # AI生成一時ファイル
└── public/
    └── assets/                              # 共通アセット
```

### 4.1 ファイル命名規則

```
{slideId}.webp
{slideId}_thumb.webp
{slideId}_{timestamp}.webp  # バージョン管理時
```

### 4.2 Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // ユーザーは自分のファイルのみ読み書き可能
    match /users/{userId}/lps/{lpId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // 公開アセットは誰でも読み取り可能
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

## 5. セキュリティルール (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ユーザードキュメント
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId
                    && !request.resource.data.diff(resource.data).affectedKeys()
                       .hasAny(['plan', 'planExpiresAt', 'limits']);
      allow delete: if false;
    }

    // LPドキュメント
    match /lps/{lpId} {
      // 公開済みLPは誰でも読み取り可能
      allow read: if resource.data.status == 'published'
                  || request.auth.uid == resource.data.ownerId;

      // 作成は認証ユーザーのみ
      allow create: if request.auth != null
                    && request.resource.data.ownerId == request.auth.uid;

      // 更新・削除はオーナーのみ
      allow update: if request.auth.uid == resource.data.ownerId;
      allow delete: if request.auth.uid == resource.data.ownerId;
    }

    // 利用統計（将来用）
    match /usage/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if false;  // サーバーサイドのみ
    }
  }
}
```

---

## 6. クエリパターン

### 6.1 よく使うクエリ

```typescript
// ユーザーのLP一覧（新しい順）
const getUserLPs = async (userId: string) => {
  const q = query(
    collection(db, "lps"),
    where("ownerId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  return getDocs(q);
};

// 公開LPの取得（ビューア用）
const getPublishedLP = async (lpId: string) => {
  const docRef = doc(db, "lps", lpId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists() || docSnap.data().status !== "published") {
    throw new Error("LP not found");
  }

  return docSnap.data();
};

// スライド順序の更新
const updateSlideOrder = async (lpId: string, slides: Slide[]) => {
  const docRef = doc(db, "lps", lpId);
  await updateDoc(docRef, {
    slides: slides.map((s, i) => ({ ...s, order: i })),
    updatedAt: serverTimestamp(),
  });
};
```

### 6.2 バッチ操作

```typescript
// 複数スライドの一括追加
const addSlides = async (lpId: string, newSlides: Omit<Slide, "order">[]) => {
  const docRef = doc(db, "lps", lpId);
  const docSnap = await getDoc(docRef);
  const currentSlides = docSnap.data()?.slides || [];

  const slidesWithOrder = newSlides.map((slide, i) => ({
    ...slide,
    order: currentSlides.length + i,
  }));

  await updateDoc(docRef, {
    slides: arrayUnion(...slidesWithOrder),
    updatedAt: serverTimestamp(),
  });
};
```

---

## 7. データマイグレーション

### 7.1 バージョニング戦略

```typescript
// ドキュメントにバージョンフィールドを追加
interface LP {
  _version: number; // スキーマバージョン
  // ... other fields
}

// マイグレーション関数
const migrateLP = (data: any, fromVersion: number): LP => {
  let migrated = { ...data };

  if (fromVersion < 2) {
    // v1 → v2: ctaConfig 構造変更
    migrated.ctaConfig = {
      ...migrated.ctaConfig,
      position: "bottom", // 新規フィールド
    };
  }

  if (fromVersion < 3) {
    // v2 → v3: stats 追加
    migrated.stats = { views: 0, ctaClicks: 0 };
  }

  migrated._version = 3;
  return migrated as LP;
};
```

---

## 8. バックアップ・リカバリ

### 8.1 バックアップ戦略

- **自動バックアップ**: Firebase 自動バックアップ（日次）
- **エクスポート**: 月次で Cloud Storage にエクスポート

### 8.2 リカバリ手順

```bash
# Firestore エクスポート
gcloud firestore export gs://backup-bucket/firestore/$(date +%Y%m%d)

# リストア
gcloud firestore import gs://backup-bucket/firestore/20250120
```

---

## 9. 型定義ファイル

```typescript
// src/types/database.ts

import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  plan: "free" | "pro" | "enterprise";
  planExpiresAt: Timestamp | null;
  limits: UserLimits;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
}

export interface UserLimits {
  maxLPs: number;
  maxSlidesPerLP: number;
  aiGenerationsPerMonth: number;
  aiGenerationsUsed: number;
  resetAt: Timestamp;
}

export interface LP {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  status: "draft" | "published";
  viewMode: "swipe" | "scroll";
  slides: Slide[];
  ctaConfig: CTAConfig;
  trackingTags: TrackingTags;
  aiMetadata: AIMetadata | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt: Timestamp | null;
  stats: LPStats;
}

export interface Slide {
  id: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  captionText: string | null;
  order: number;
  aiPrompt: string | null;
  createdAt: Timestamp;
}

export interface CTAConfig {
  text: string;
  url: string;
  bgColor: string;
  textColor: string;
  isVisible: boolean;
  position: "bottom" | "overlay";
}

export interface TrackingTags {
  headHtml: string;
  bodyHtml: string;
}

export interface AIMetadata {
  productName: string;
  targetAudience: string;
  keyAppeal: string;
  generatedAt: Timestamp;
  model: {
    text: string;
    image: string;
  };
}

export interface LPStats {
  views: number;
  ctaClicks: number;
}
```

---

**作成者**: Claude Code (Miyabi Agent)
**レビュー**: Pending
