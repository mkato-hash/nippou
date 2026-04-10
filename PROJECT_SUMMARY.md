# 日報アプリ プロジェクト概要

## ✅ 実装完了

新人研修向け日報アプリの全フルスタック実装が完了しました。

---

## 📁 プロジェクト構成

```
sample003/
├── backend/                          # Node.js/Express REST API
│   ├── src/
│   │   ├── index.ts                  # メインアプリケーション
│   │   ├── routes/
│   │   │   ├── auth.ts               # 認証エンドポイント
│   │   │   └── reports.ts            # 日報エンドポイント
│   │   └── middleware/
│   │       └── auth.ts               # JWT 認証ミドルウェア
│   ├── prisma/
│   │   └── schema.prisma             # データベーススキーマ
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env.example
│
├── mobile/                           # React Native/Expo (iOS)
│   ├── app/
│   │   ├── _layout.tsx               # ルートレイアウト
│   │   ├── login.tsx                 # ログイン画面
│   │   └── (app)/
│   │       ├── _layout.tsx           # アプリレイアウト（タブナビゲーション）
│   │       ├── home.tsx              # ホーム画面
│   │       ├── submit-report.tsx     # 日報入力画面
│   │       ├── history.tsx           # 過去の日報一覧
│   │       └── profile.tsx           # プロフィール画面
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── web/                              # Next.js メンター管理画面
│   ├── pages/
│   │   ├── login.tsx                 # ログイン画面
│   │   └── dashboard.tsx             # 日報管理ダッシュボード
│   ├── styles/
│   │   ├── auth.module.css           # ログインスタイル
│   │   └── dashboard.module.css      # ダッシュボードスタイル
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── Dockerfile
│   └── .env.example
│
├── analytics/                        # Python FastAPI 集計サービス
│   ├── main.py                       # FastAPI アプリケーション
│   ├── requirements.txt              # Python 依存パッケージ
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml                # Docker Compose 設定
├── README.md                         # プロジェクト説明
├── SETUP.md                          # セットアップガイド
├── PROJECT_SUMMARY.md               # このファイル
└── .gitignore                        # Git 除外ファイル
```

---

## 🚀 すぐに始める方法

### 方法 1: Docker Compose（推奨・最も簡単）

```bash
cd sample003
docker-compose up
```

その後：
- Web 管理画面: http://localhost:3002
- Backend API: http://localhost:3000
- Analytics API: http://localhost:3001

### 方法 2: 手動セットアップ

詳細は [SETUP.md](SETUP.md) を参照してください。

---

## 📋 実装済み機能

### Backend API（Node.js/Express）
- ✅ JWT 認証（ログイン/ユーザー登録）
- ✅ 日報の CRUD エンドポイント
- ✅ 新人・メンター向けのロールベースアクセス制御
- ✅ SQLite データベース（Prisma ORM）
- ✅ エラーハンドリング

### モバイルアプリ（React Native/Expo）
- ✅ iOS ネイティブアプリ
- ✅ ログイン画面
- ✅ 日報入力フォーム（4つの項目）
- ✅ 日報提出機能
- ✅ 過去の日報履歴表示
- ✅ プロフィール表示
- ✅ ローカル ストレージでのトークン管理
- ✅ シンプルで分かりやすいUI

### Web 管理画面（Next.js）
- ✅ メンター向けログイン画面
- ✅ 提出された日報の一覧表示
- ✅ 日報詳細表示
- ✅ 既読マーク機能
- ✅ 統計ダッシュボード（件数表示）
- ✅ 未読フィルタリング
- ✅ レスポンシブデザイン

### Analytics サービス（Python/FastAPI）
- ✅ 週次集計レポート API
- ✅ CSV エクスポート機能
- ✅ 統計情報の集約

---

## 🔐 認証・セキュリティ

- JWT トークンベースの認証
- bcryptjs によるパスワードハッシング
- ロールベースのアクセス制御（TRAINEE / MENTOR）
- 認証ミドルウェアによる API 保護

---

## 📊 データモデル

### users テーブル
| カラム | 型 | 説明 |
|--------|-----|------|
| id | String | UUID |
| name | String | ユーザー名 |
| email | String | メールアドレス（ユニーク） |
| password | String | ハッシュ化されたパスワード |
| role | Enum | TRAINEE / MENTOR |
| createdAt | DateTime | 作成日時 |

### reports テーブル
| カラム | 型 | 説明 |
|--------|-----|------|
| id | String | UUID |
| userId | String | 提出者 ID |
| trainingContent | String | 本日の研修内容 |
| progressStatus | String | 進捗状況 |
| problems | String | 問題・困ったこと |
| tomorrowPlan | String | 明日の予定 |
| isRead | Boolean | メンター既読フラグ |
| submittedAt | DateTime | 提出日時 |

---

## 🔌 API エンドポイント

### 認証
- `POST /api/auth/login` - ログイン（トークン取得）
- `POST /api/auth/register` - ユーザー登録

### 日報
- `POST /api/reports` - 日報提出
- `GET /api/reports` - 日報一覧取得（メンターのみ）
- `GET /api/reports/:id` - 日報詳細取得
- `PATCH /api/reports/:id/read` - 既読マーク（メンターのみ）
- `GET /api/reports/me/reports` - 自分の日報一覧取得

### 集計・分析
- `GET /api/analytics/weekly` - 週次集計レポート
- `GET /api/analytics/export/csv` - CSV エクスポート

---

## 🧪 テストユーザー

初期セットアップ後、以下のコマンドでテストユーザーを作成します：

```bash
# 新人ユーザー
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trainee@example.com",
    "password": "password123",
    "name": "新人太郎",
    "role": "TRAINEE"
  }'

# メンターユーザー
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mentor@example.com",
    "password": "password123",
    "name": "メンター花子",
    "role": "MENTOR"
  }'
```

ログイン情報：
- **モバイルアプリ**: trainee@example.com / password123
- **Web 管理画面**: mentor@example.com / password123

---

## 🛠️ 技術スタック

| 領域 | 技術 |
|---|---|
| **Backend API** | Node.js 20, Express.js, TypeScript, Prisma ORM |
| **Mobile App** | React Native, Expo, TypeScript |
| **Web Admin** | Next.js 14, React 18, TypeScript, CSS Modules |
| **Database** | SQLite（開発）/ PostgreSQL（本番推奨） |
| **Auth** | JWT, bcryptjs |
| **Analytics** | Python 3.11, FastAPI, pandas |
| **Containerization** | Docker, Docker Compose |

---

## ⚙️ 環境変数

### Backend
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_jwt_secret_key_here"
PORT=3000
NODE_ENV="development"
```

### Mobile
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Web
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Analytics
```env
API_BASE_URL=http://localhost:3000/api
JWT_SECRET="your_jwt_secret_key_here"
```

---

## 📚 次のステップ

### 短期（すぐできる）
1. ✅ Docker Compose でセットアップ確認
2. ✅ テストユーザーでログイン確認
3. ✅ モバイルアプリから日報提出テスト
4. ✅ Web 管理画面で日報確認テスト

### 中期（今週中）
1. **本番準備**
   - DATABASE_URL を PostgreSQL に変更
   - JWT_SECRET を強力な値に設定
   - CORS 設定を調整

2. **デプロイ準備**
   - Docker イメージを確認
   - docker-compose.yml の本番設定を追加
   - CI/CD パイプラインの設定

3. **データ管理**
   - サンプルデータの作成
   - データ移行スクリプトの準備

### 長期（機能拡張）
1. **UX 改善**
   - メンターからのフィードバック機能
   - 日報テンプレート機能
   - 通知機能

2. **分析機能強化**
   - グラフ・チャート表示
   - カスタムレポート生成
   - データ分析ダッシュボード

3. **システム拡張**
   - メンター複数割当
   - 権限管理の細かい設定
   - 監査ログ

---

## 🐛 トラブルシューティング

詳細は [SETUP.md](SETUP.md) のトラブルシューティングセクションを参照してください。

### よくある問題

| 問題 | 解決方法 |
|---|---|
| ポート競合 | `lsof -i :3000` でプロセス確認、kill で終了 |
| npm install エラー | `rm -rf node_modules` 後に再実行 |
| API に接続できない | `mobile/.env` の API URL をホスト IP に変更 |
| Docker が起動しない | `docker-compose down -v` で削除後、再度起動 |

---

## 📞 サポート情報

- **ドキュメント**: README.md, SETUP.md
- **ソースコード**: 各ディレクトリの main.ts/main.py
- **設定ファイル**: package.json, docker-compose.yml

---

## 🎓 学習リソース

このプロジェクトは以下の技術を学ぶのに適しています：

- **Backend**: REST API 設計、JWT 認証、ORM 使用法
- **Mobile**: React Native アプリ開発、状態管理
- **Web**: Next.js フレームワーク、API 統合
- **DevOps**: Docker、Docker Compose、マイクロサービス

---

## 📝 プロジェクト開始のための注意点

1. **Node.js/Python のインストール確認**
   - `node --version` (v20 以上)
   - `python --version` (3.11 以上)

2. **Docker のインストール**（推奨）
   - Docker Desktop をダウンロード・インストール

3. **環境変数の設定**
   - `.env.example` をコピーして `.env` を作成

4. **初期データベースセットアップ**
   - `npm run prisma:migrate` を実行

---

## ✨ まとめ

**本アプリは新人エンジニアが簡単に使える、分かりやすい UI/UX を重視した設計になっています。**

- モバイルアプリは必要最小限の機能に絞られ、操作が直感的
- Web 管理画面はメンターが効率的に日報を確認できる設計
- すべてのファイルが整備され、すぐに運用開始可能

**セットアップから運用まで、ご不明な点があればお気軽にお問い合わせください！** 🎉
