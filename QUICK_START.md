# 🚀 クイックスタート

最速でアプリを起動するための手順です。

---

## 📦 前提条件の確認

```bash
# Docker & Docker Compose がインストール済み？
docker --version
docker-compose --version
```

Docker がない場合は [こちら](https://www.docker.com/products/docker-desktop) からインストール

---

## 🎯 3ステップで起動

### ステップ 1: サービス起動（1-2分）

```bash
cd sample003
docker-compose up
```

✅ ログに以下が表示されたら成功：
```
daily-report-backend | Server is running on port 3000
```

### ステップ 2: テストユーザー作成（別ターミナル）

```bash
# 新人ユーザー作成
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trainee@example.com",
    "password": "password123",
    "name": "新人太郎",
    "role": "TRAINEE"
  }'

# メンターユーザー作成
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mentor@example.com",
    "password": "password123",
    "name": "メンター花子",
    "role": "MENTOR"
  }'
```

### ステップ 3: アプリにアクセス

**メンター Web 管理画面：**
- 🌐 http://localhost:3002
- 👤 Email: `mentor@example.com`
- 🔐 Password: `password123`

**モバイルアプリ：**
```bash
cd mobile
npm install
npm run ios
```
- 👤 Email: `trainee@example.com`
- 🔐 Password: `password123`

---

## 📝 動作確認チェックリスト

- [ ] Web ダッシュボードにログインできた
- [ ] モバイルアプリが起動した
- [ ] モバイルから日報を提出できた
- [ ] Web で提出された日報が見えた
- [ ] Web で既読にできた

---

## 🛑 トラブル時のコマンド

```bash
# ✓ サービスを完全に停止・削除
docker-compose down -v

# ✓ ログを確認
docker-compose logs -f backend

# ✓ 再起動
docker-compose up --build
```

---

## 📚 詳細ドキュメント

- 詳細なセットアップ: [SETUP.md](SETUP.md)
- プロジェクト概要: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
- 全体説明: [README.md](README.md)

---

## ✨ 次は何する？

**API テストをしたい:**
```bash
# ログイン
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trainee@example.com",
    "password": "password123"
  }'
```

**ソースコードを見たい:**
- Backend: `backend/src/`
- Mobile: `mobile/app/`
- Web: `web/pages/`

**本番環境に向けて準備したい:**
- [SETUP.md](SETUP.md) の「本番環境への展開」セクションを参照

---

## 🎉 完了！

これで日報アプリが使える状態になりました。楽しい開発を！
