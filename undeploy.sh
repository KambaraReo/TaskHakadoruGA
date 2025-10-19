#!/bin/bash

# Task Hakadoru-ga 削除スクリプト

set -e

echo "Task Hakadoru-ga を削除しています..."

# 1. Ingress削除
echo "Ingress を削除中..."
kubectl delete -f k8s/ingress.yaml --ignore-not-found=true

# 2. Services削除
echo "Services を削除中..."
kubectl delete -f k8s/frontend/service.yaml --ignore-not-found=true
kubectl delete -f k8s/optimizer/service.yaml --ignore-not-found=true
kubectl delete -f k8s/backend/service.yaml --ignore-not-found=true
kubectl delete -f k8s/database/service.yaml --ignore-not-found=true

# 3. Deployments削除
echo "Deployments を削除中..."
kubectl delete -f k8s/frontend/deployment.yaml --ignore-not-found=true
kubectl delete -f k8s/optimizer/deployment.yaml --ignore-not-found=true
kubectl delete -f k8s/backend/deployment.yaml --ignore-not-found=true
kubectl delete -f k8s/database/deployment.yaml --ignore-not-found=true

# 4. PVC削除（データが削除されるので注意）
echo "PVC を削除中（データが削除されます）..."
read -p "データベースのデータを削除しますか？ (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    kubectl delete -f k8s/database/pvc.yaml --ignore-not-found=true
else
    echo "PVCの削除をスキップしました"
fi

# 5. ConfigMaps and Secrets削除
echo "ConfigMaps と Secrets を削除中..."
kubectl delete -f k8s/backend/configmap.yaml --ignore-not-found=true
kubectl delete -f k8s/backend/secret.yaml --ignore-not-found=true

# 6. Namespace削除
echo "Namespace を削除中..."
read -p "Namespace全体を削除しますか？ (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    kubectl delete -f k8s/namespace.yaml --ignore-not-found=true
else
    echo "Namespaceの削除をスキップしました"
fi

echo ""
echo "削除完了！"
echo ""
echo "残存リソース確認:"
kubectl get all -n task-hakadoru-ga 2>/dev/null || echo "Namespace task-hakadoru-ga は存在しません"
