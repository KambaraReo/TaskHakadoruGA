#!/bin/bash

# Task Hakadoru-ga デプロイスクリプト

set -e

# 設定
REGISTRY="sakuraore"  # Docker Hub: yourusername, GitHub: ghcr.io/yourusername
PROJECT_NAME="task-hakadoru-ga"
# コミットハッシュをタグとして使用
COMMIT_HASH=$(git rev-parse --short HEAD)
TAG="${COMMIT_HASH}"
SKIP_BUILD=${1:-false}  # 第1引数で --skip-build を指定可能

echo "使用するイメージタグ: ${TAG}"

echo "Task Hakadoru-ga をデプロイしています..."

if [ "$SKIP_BUILD" != "--skip-build" ]; then
    # Docker イメージのビルドとプッシュ
    echo "Docker イメージをビルド中..."

echo "  Backend イメージをビルド中..."
docker build --platform linux/amd64 -t ${REGISTRY}/${PROJECT_NAME}-backend:${TAG} ./backend

echo "  Frontend イメージをビルド中..."
docker build --platform linux/amd64 -t ${REGISTRY}/${PROJECT_NAME}-frontend:${TAG} ./frontend

echo "  Optimizer イメージをビルド中..."
docker build --platform linux/amd64 -t ${REGISTRY}/${PROJECT_NAME}-optimizer:${TAG} ./optimizer

echo "Docker イメージをプッシュ中..."
docker push ${REGISTRY}/${PROJECT_NAME}-backend:${TAG}
docker push ${REGISTRY}/${PROJECT_NAME}-frontend:${TAG}
docker push ${REGISTRY}/${PROJECT_NAME}-optimizer:${TAG}
else
    echo "Docker ビルドをスキップしています..."
fi

# デプロイメントファイルのイメージ名を更新
echo "デプロイメントファイルのイメージ名を更新中..."
sed -i.bak "s|sakuraore/task-hakadoru-ga|${REGISTRY}/${PROJECT_NAME}|g" k8s/*/deployment.yaml

# Namespaceを作成（存在しない場合のみ）
echo "Namespaceを確認中..."
kubectl apply -f k8s/namespace.yaml

# 1. Secrets and ConfigMaps
echo "Secrets と ConfigMaps を適用中..."
kubectl apply -f k8s/backend/secret.yaml
kubectl apply -f k8s/backend/configmap.yaml

# 2. Database (PVC -> Deployment -> Service)
echo "Database を適用中..."
kubectl apply -f k8s/database/pvc.yaml
kubectl apply -f k8s/database/deployment.yaml
kubectl apply -f k8s/database/service.yaml

echo "Databaseの起動を待機中..."
kubectl wait --for=condition=ready pod -l app=database -n task-hakadoru-ga --timeout=300s

# 3. Backend (Deployment -> Service)
echo "Backend を適用中..."
kubectl apply -f k8s/backend/deployment.yaml
kubectl apply -f k8s/backend/service.yaml

# 4. Optimizer (Deployment -> Service)
echo "Optimizer を適用中..."
kubectl apply -f k8s/optimizer/deployment.yaml
kubectl apply -f k8s/optimizer/service.yaml

# 5. Frontend (Deployment -> Service)
echo "Frontend を適用中..."
kubectl apply -f k8s/frontend/deployment.yaml
kubectl apply -f k8s/frontend/service.yaml

# 6. Ingress
echo "Ingress を適用中..."
kubectl apply -f k8s/ingress.yaml

# 7. デプロイメントを再起動
if [ "$SKIP_BUILD" != "--skip-build" ]; then
    echo "デプロイメントを再起動して新しいイメージを適用中..."
    kubectl -n task-hakadoru-ga rollout restart deployment/backend
    kubectl -n task-hakadoru-ga rollout restart deployment/frontend
    kubectl -n task-hakadoru-ga rollout restart deployment/optimizer
fi

echo "デプロイメントの完了を待機中..."
kubectl wait --for=condition=available deployment/backend -n task-hakadoru-ga --timeout=600s
kubectl wait --for=condition=available deployment/optimizer -n task-hakadoru-ga --timeout=300s
kubectl wait --for=condition=available deployment/frontend -n task-hakadoru-ga --timeout=300s

echo ""
echo "デプロイ完了！"
echo ""
echo "デプロイメント状況:"
kubectl get pods,svc,ingress -n task-hakadoru-ga

echo ""
echo "アクセス情報:"
echo "  URL: https://taskhakadoruga.reokambara.com"
echo ""
echo "ログ確認コマンド:"
echo "  Backend:   kubectl logs -f deployment/backend -n task-hakadoru-ga"
echo "  Optimizer: kubectl logs -f deployment/optimizer -n task-hakadoru-ga"
echo "  Frontend:  kubectl logs -f deployment/frontend -n task-hakadoru-ga"
echo "  Database:  kubectl logs -f deployment/database -n task-hakadoru-ga"
echo ""
echo "トラブルシューティング:"
echo "  Pod状況:   kubectl get pods -n task-hakadoru-ga"
echo "  詳細情報:  kubectl describe pod <pod-name> -n task-hakadoru-ga"
echo "  Events:    kubectl get events -n task-hakadoru-ga --sort-by='.lastTimestamp'"

# バックアップファイルをクリーンアップ
echo "バックアップファイルをクリーンアップ中..."
find k8s -name "*.bak" -delete 2>/dev/null || true
echo "バックアップファイルをクリーンアップ完了"
