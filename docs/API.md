# swipe-lp-creator - API仕様書

**バージョン**: 1.0.0
**最終更新**: 2025-12-27
**ベースURL**: `https://swipe-lp-creator.pages.dev`

---

## 1. API概要

### 1.1 アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Structure                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Firebase SDK (Client-side)     Cloudflare Functions (Server)   │
│  ┌─────────────────────────┐   ┌─────────────────────────────┐ │
│  │ - Authentication        │   │ - AI Generation             │ │
│  │ - Firestore CRUD        │   │ - Image Processing          │ │
│  │ - Storage Upload        │   │ - External API Proxy        │ │
│  └─────────────────────────┘   └─────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 認証方式

- **Firebase SDK操作**: Firebase Authentication (JWT)
- **Cloudflare Functions**: Bearer Token (Firebase ID Token)
- **AUTH_REQUIRED が有効な場合**: すべての AI API に Authorization ヘッダー必須

```typescript
// リクエストヘッダー
{
  "Authorization": "Bearer {firebase_id_token}",
  "Content-Type": "application/json"
}
```

---

## 2. Cloudflare Functions API

### 2.1 LP生成 API

#### POST `/api/generate-lp`

AIを使用してLP全体を自動生成する。

**リクエスト**:

```typescript
interface GenerateLPRequest {
  productName: string; // 商品名（必須）
  targetAudience: string; // ターゲット層（必須）
  keyBenefits: string[]; // 訴求ポイント（必須）
  tone?: string; // トーン&マナー（オプション）
  slideCount?: number; // スライド数（デフォルト: 8）
  lpId?: string; // LP ID（オプション）
}
```

**リクエスト例**:

```json
{
  "productName": "オーガニック美容液 ナノバナナ",
  "targetAudience": "30代女性、敏感肌、オーガニック志向",
  "keyBenefits": ["天然成分100%", "3日で肌荒れ改善", "無添加・無香料"],
  "tone": "高級感、信頼感、ナチュラル",
  "slideCount": 8,
  "lpId": "beauty-serum-2025"
}
```

**レスポンス**:

```typescript
interface GenerateLPResponse {
  success: boolean;
  storyboard?: StoryboardItem[];
  images?: { slideNumber: number; imageUrl: string }[];
  error?: string;
}

interface StoryboardItem {
  slideNumber: number;
  purpose: string; // Hook, Problem, Solution, etc.
  headline: string;
  description: string;
  imagePrompt: string;
}
```

**レスポンス例**:

```json
{
  "success": true,
  "storyboard": [
    {
      "slideNumber": 1,
      "purpose": "Hook",
      "headline": "あなたの肌、輝いていますか？",
      "description": "視聴者の注意を引き、肌の美しさへの関心を喚起",
      "imagePrompt": "A close-up of a woman with radiant, glowing skin..."
    }
  ],
  "images": [
    {
      "slideNumber": 1,
      "imageUrl": "data:image/png;base64,..."
    }
  ]
}
```

**エラーレスポンス**:

```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again in 60 seconds.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

**エラーコード**:
| コード | 説明 |
|--------|------|
| `UNAUTHORIZED` | 認証トークンが無効 |
| `RATE_LIMIT_EXCEEDED` | レート制限超過 |
| `QUOTA_EXCEEDED` | 月間生成回数超過 |
| `INVALID_INPUT` | 入力パラメータが不正 |
| `AI_SERVICE_ERROR` | AIサービスエラー |
| `INTERNAL_ERROR` | 内部エラー |

---

### 2.2 スライド再生成 API

#### POST `/api/regenerate-slide`

特定のスライドのみを再生成する。

**リクエスト**:

```typescript
interface RegenerateSlideRequest {
  prompt: string; // 再生成プロンプト（必須）
  style?: string; // スタイル（オプション）
  lpId?: string; // LP ID（オプション）
}
```

**リクエスト例**:

```json
{
  "prompt": "もっと明るい雰囲気で、笑顔の女性を含めて",
  "style": "Clean, minimalist, Japanese aesthetic",
  "lpId": "beauty-serum-2025"
}
```

**レスポンス**:

```typescript
interface RegenerateSlideResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}
```

---

### 2.3 画像アップロード API

#### POST `/api/upload-image`

画像をFirebase Storageにアップロードし、最適化する。

**リクエスト**:

```
Content-Type: multipart/form-data

Fields:
- file: File (image/jpeg, image/png, image/webp)
- lpId: string
- generateThumbnail: boolean (default: true)
```

**レスポンス**:

```typescript
interface UploadImageResponse {
  success: boolean;
  data: {
    imageUrl: string;
    thumbnailUrl: string | null;
    fileSize: number;
    dimensions: {
      width: number;
      height: number;
    };
  };
  error?: string;
}
```

**制限**:

- 最大ファイルサイズ: 10MB
- 対応形式: JPEG, PNG, WebP
- 自動変換: WebP形式に変換（品質80%）

---

## 3. Firebase SDK Operations

### 3.1 認証 (Firebase Auth)

```typescript
// src/lib/firebase/auth.ts

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// メール/パスワードでログイン
export const loginWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// 新規登録
export const registerWithEmail = async (email: string, password: string) => {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  // Firestoreにユーザードキュメント作成
  await createUserDocument(credential.user);
  return credential;
};

// Googleログイン
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  await createUserDocument(credential.user);
  return credential;
};

// ログアウト
export const logout = async () => {
  return signOut(auth);
};

// IDトークン取得（API呼び出し用）
export const getIdToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
};
```

### 3.2 LP CRUD (Firestore)

```typescript
// src/lib/firebase/firestore.ts

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// LP一覧取得
export const getUserLPs = async (userId: string): Promise<LP[]> => {
  const q = query(
    collection(db, "lps"),
    where("ownerId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as LP);
};

// LP取得（単一）
export const getLP = async (lpId: string): Promise<LP | null> => {
  const docRef = doc(db, "lps", lpId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as LP;
};

// 公開LP取得（ビューア用）
export const getPublishedLP = async (lpId: string): Promise<LP | null> => {
  const lp = await getLP(lpId);
  if (!lp || lp.status !== "published") return null;
  return lp;
};

// LP作成
export const createLP = async (
  data: Omit<LP, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const docRef = await addDoc(collection(db, "lps"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// カスタムIDでLP作成
export const createLPWithId = async (
  lpId: string,
  data: Omit<LP, "id" | "createdAt" | "updatedAt">
): Promise<void> => {
  const docRef = doc(db, "lps", lpId);
  await setDoc(docRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// LP更新
export const updateLP = async (
  lpId: string,
  data: Partial<LP>
): Promise<void> => {
  const docRef = doc(db, "lps", lpId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// LP削除
export const deleteLP = async (lpId: string): Promise<void> => {
  const docRef = doc(db, "lps", lpId);
  await deleteDoc(docRef);
  // 関連するStorage画像も削除
  await deleteLPImages(lpId);
};

// 公開状態トグル
export const toggleLPStatus = async (lpId: string): Promise<void> => {
  const lp = await getLP(lpId);
  if (!lp) throw new Error("LP not found");

  const newStatus = lp.status === "published" ? "draft" : "published";
  await updateDoc(doc(db, "lps", lpId), {
    status: newStatus,
    publishedAt: newStatus === "published" ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
};
```

### 3.3 スライド操作

```typescript
// src/lib/firebase/slides.ts

// スライド追加
export const addSlide = async (
  lpId: string,
  slide: Omit<Slide, "order">
): Promise<void> => {
  const lp = await getLP(lpId);
  if (!lp) throw new Error("LP not found");

  const newSlide = {
    ...slide,
    order: lp.slides.length,
    createdAt: Timestamp.now(),
  };

  await updateDoc(doc(db, "lps", lpId), {
    slides: [...lp.slides, newSlide],
    updatedAt: serverTimestamp(),
  });
};

// スライド並び替え
export const reorderSlides = async (
  lpId: string,
  slideIds: string[]
): Promise<void> => {
  const lp = await getLP(lpId);
  if (!lp) throw new Error("LP not found");

  const reorderedSlides = slideIds.map((id, index) => {
    const slide = lp.slides.find((s) => s.id === id);
    if (!slide) throw new Error(`Slide ${id} not found`);
    return { ...slide, order: index };
  });

  await updateDoc(doc(db, "lps", lpId), {
    slides: reorderedSlides,
    updatedAt: serverTimestamp(),
  });
};

// スライド削除
export const deleteSlide = async (
  lpId: string,
  slideId: string
): Promise<void> => {
  const lp = await getLP(lpId);
  if (!lp) throw new Error("LP not found");

  const updatedSlides = lp.slides
    .filter((s) => s.id !== slideId)
    .map((s, i) => ({ ...s, order: i }));

  await updateDoc(doc(db, "lps", lpId), {
    slides: updatedSlides,
    updatedAt: serverTimestamp(),
  });

  // Storage から画像削除
  await deleteSlideImage(lpId, slideId);
};

// スライド更新
export const updateSlide = async (
  lpId: string,
  slideId: string,
  data: Partial<Slide>
): Promise<void> => {
  const lp = await getLP(lpId);
  if (!lp) throw new Error("LP not found");

  const updatedSlides = lp.slides.map((s) =>
    s.id === slideId ? { ...s, ...data } : s
  );

  await updateDoc(doc(db, "lps", lpId), {
    slides: updatedSlides,
    updatedAt: serverTimestamp(),
  });
};
```

### 3.4 画像アップロード (Storage)

```typescript
// src/lib/firebase/storage.ts

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";

// 画像アップロード
export const uploadSlideImage = async (
  userId: string,
  lpId: string,
  slideId: string,
  file: File
): Promise<string> => {
  const storageRef = ref(
    storage,
    `users/${userId}/lps/${lpId}/slides/${slideId}.webp`
  );

  // WebP変換（クライアントサイド）
  const webpBlob = await convertToWebP(file);

  await uploadBytes(storageRef, webpBlob, {
    contentType: "image/webp",
  });

  return getDownloadURL(storageRef);
};

// 複数画像一括アップロード
export const uploadMultipleImages = async (
  userId: string,
  lpId: string,
  files: File[]
): Promise<{ id: string; url: string }[]> => {
  const results = await Promise.all(
    files.map(async (file, index) => {
      const slideId = `slide-${Date.now()}-${index}`;
      const url = await uploadSlideImage(userId, lpId, slideId, file);
      return { id: slideId, url };
    })
  );
  return results;
};

// 画像削除
export const deleteSlideImage = async (
  lpId: string,
  slideId: string
): Promise<void> => {
  const storageRef = ref(storage, `users/${lpId}/slides/${slideId}.webp`);
  try {
    await deleteObject(storageRef);
  } catch (e) {
    console.warn("Image not found:", e);
  }
};

// LP関連画像全削除
export const deleteLPImages = async (lpId: string): Promise<void> => {
  const folderRef = ref(storage, `users/${lpId}`);
  const list = await listAll(folderRef);
  await Promise.all(list.items.map((item) => deleteObject(item)));
};

// WebP変換ユーティリティ
const convertToWebP = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("Conversion failed")),
        "image/webp",
        0.8
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
```

---

## 4. React Hooks

### 4.1 useAuth

```typescript
// src/hooks/useAuth.ts

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => setState({ user, loading: false, error: null }),
      (error) => setState({ user: null, loading: false, error })
    );
    return unsubscribe;
  }, []);

  return state;
};
```

### 4.2 useLP

```typescript
// src/hooks/useLP.ts

import useSWR from "swr";
import { getLP, getUserLPs } from "@/lib/firebase/firestore";

// 単一LP
export const useLP = (lpId: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    lpId ? `lp/${lpId}` : null,
    () => getLP(lpId!)
  );

  return {
    lp: data,
    isLoading,
    isError: error,
    mutate,
  };
};

// ユーザーのLP一覧
export const useUserLPs = (userId: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `lps/${userId}` : null,
    () => getUserLPs(userId!)
  );

  return {
    lps: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};
```

### 4.3 useAIGenerate

```typescript
// src/hooks/useAIGenerate.ts

import { useState } from "react";
import { getIdToken } from "@/lib/firebase/auth";

interface GenerateOptions {
  productName: string;
  targetAudience: string;
  keyAppeal: string;
  toneAndManner?: string;
  slideCount?: number;
}

interface GenerateState {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  error: Error | null;
}

export const useAIGenerate = () => {
  const [state, setState] = useState<GenerateState>({
    isGenerating: false,
    progress: 0,
    currentStep: "",
    error: null,
  });

  const generate = async (options: GenerateOptions) => {
    setState({
      isGenerating: true,
      progress: 0,
      currentStep: "Preparing...",
      error: null,
    });

    try {
      const token = await getIdToken();

      setState((s) => ({
        ...s,
        progress: 10,
        currentStep: "Creating storyboard...",
      }));

      const response = await fetch("/api/generate-lp", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Generation failed");
      }

      setState((s) => ({
        ...s,
        progress: 50,
        currentStep: "Generating images...",
      }));

      const result = await response.json();

      setState((s) => ({ ...s, progress: 100, currentStep: "Complete!" }));

      return result.data;
    } catch (error) {
      setState((s) => ({ ...s, error: error as Error }));
      throw error;
    } finally {
      setState((s) => ({ ...s, isGenerating: false }));
    }
  };

  const regenerateSlide = async (
    lpId: string,
    slideId: string,
    customPrompt?: string
  ) => {
    setState({
      isGenerating: true,
      progress: 0,
      currentStep: "Regenerating...",
      error: null,
    });

    try {
      const token = await getIdToken();

      const response = await fetch("/api/regenerate-slide", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lpId,
          slideId,
          customPrompt,
          keepContext: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Regeneration failed");
      }

      const result = await response.json();
      return result.data.slide;
    } catch (error) {
      setState((s) => ({ ...s, error: error as Error }));
      throw error;
    } finally {
      setState((s) => ({ ...s, isGenerating: false }));
    }
  };

  return {
    ...state,
    generate,
    regenerateSlide,
  };
};
```

---

## 5. レート制限

| エンドポイント          | 制限  | ウィンドウ |
| ----------------------- | ----- | ---------- |
| `/api/generate-lp`      | 10回  | 1時間      |
| `/api/regenerate-slide` | 30回  | 1時間      |
| `/api/upload-image`     | 100回 | 1時間      |

**Free プラン制限**:

- 月間AI生成: 10回
- LP作成上限: 5個
- スライド上限: 10枚/LP

---

## 6. エラーハンドリング

### 6.1 共通エラーフォーマット

```typescript
interface APIError {
  success: false;
  error: string;
  code: ErrorCode;
  details?: Record<string, any>;
}

type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "RATE_LIMIT_EXCEEDED"
  | "QUOTA_EXCEEDED"
  | "AI_SERVICE_ERROR"
  | "STORAGE_ERROR"
  | "INTERNAL_ERROR";
```

### 6.2 HTTPステータスコード

| コード | 意味                  | 使用場面           |
| ------ | --------------------- | ------------------ |
| 200    | OK                    | 成功               |
| 201    | Created               | リソース作成成功   |
| 400    | Bad Request           | 入力パラメータ不正 |
| 401    | Unauthorized          | 認証エラー         |
| 403    | Forbidden             | 権限エラー         |
| 404    | Not Found             | リソース不存在     |
| 429    | Too Many Requests     | レート制限         |
| 500    | Internal Server Error | サーバーエラー     |
| 503    | Service Unavailable   | AIサービス一時停止 |

---

## 7. Webhook (将来拡張)

### 7.1 LP公開通知

```typescript
// POST (configured URL)
interface LPPublishedWebhook {
  event: "lp.published";
  data: {
    lpId: string;
    title: string;
    url: string;
    publishedAt: string;
  };
}
```

### 7.2 AI生成完了通知

```typescript
// POST (configured URL)
interface AIGenerationCompleteWebhook {
  event: "ai.generation.complete";
  data: {
    lpId: string;
    slideCount: number;
    generationTimeMs: number;
  };
}
```

---

**作成者**: Claude Code (Miyabi Agent)
**レビュー**: Pending
