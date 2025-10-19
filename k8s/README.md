# Task Hakadoru-ga K8s Deployment

## 前提条件

1. Docker がインストールされている
2. kubectl が k3s クラスタに接続されている
3. Docker レジストリにログインしている（Docker Hub 等）

## デプロイ手順

### 1. 設定の更新

deploy.sh の設定を更新：

```bash
# deploy.sh内の設定を変更
REGISTRY="yourusername"  # Docker Hub の場合
# または
REGISTRY="ghcr.io/yourusername"  # GitHub Container Registry の場合
```

k8s/backend/secret.yaml のパスワードを変更：

```yaml
stringData:
  MYSQL_ROOT_PASSWORD: "your_secure_password"
  MYSQL_PASSWORD: "your_app_password"
```

### 2. デプロイ実行

```bash
# フルデプロイ（ビルド + プッシュ + デプロイ）
./deploy.sh

# ビルドをスキップしてデプロイのみ
./deploy.sh --skip-build
```

### 3. 削除

```bash
./undeploy.sh
```

## 手動デプロイ

```bash
# 1. イメージビルド
docker build -t yourusername/task-hakadoru-ga-backend:latest ./backend
docker build -t yourusername/task-hakadoru-ga-frontend:latest ./frontend
docker build -t yourusername/task-hakadoru-ga-optimizer:latest ./optimizer

# 2. イメージプッシュ
docker push yourusername/task-hakadoru-ga-backend:latest
docker push yourusername/task-hakadoru-ga-frontend:latest
docker push yourusername/task-hakadoru-ga-optimizer:latest

# 3. Kubernetesデプロイ
kubectl apply -f namespace.yaml
kubectl apply -f backend/
kubectl apply -f database/
kubectl apply -f optimizer/
kubectl apply -f frontend/
kubectl apply -f ingress.yaml
```

## 確認コマンド

```bash
# Pod 状態確認
kubectl get pods -n task-hakadoru-ga

# サービス確認
kubectl get svc -n task-hakadoru-ga

# Ingress 確認
kubectl get ingress -n task-hakadoru-ga

# ログ確認
kubectl logs -f deployment/backend -n task-hakadoru-ga
kubectl logs -f deployment/frontend -n task-hakadoru-ga
kubectl logs -f deployment/optimizer -n task-hakadoru-ga
```

## リソース使用量

- **Backend**: CPU 250m-500m, Memory 256Mi-512Mi
- **Frontend**: CPU 100m-200m, Memory 64Mi-128Mi
- **Optimizer**: CPU 100m-300m, Memory 128Mi-256Mi
- **MySQL**: CPU 250m-500m, Memory 512Mi-1Gi
- **合計予想**: CPU 700m-1.5, Memory 960Mi-1.9Gi

## トラブルシューティング

```bash
# Pod の詳細確認
kubectl describe pod <pod-name> -n task-hakadoru-ga

# イベント確認
kubectl get events -n task-hakadoru-ga --sort-by='.lastTimestamp'

# リソース使用量確認
kubectl top pods -n task-hakadoru-ga
```
