# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# 既存のタスクを削除（開発環境でのリセット用）
Task.destroy_all

# サンプルタスクデータを作成
tasks_data = [
  {
    title: "要件定義書作成",
    description: "プロジェクトの要件を整理し、要件定義書を作成する",
    deadline: 3.days.from_now,
    duration: 480,  # 8時間
    energy_required: 8,
    importance: 5,
    urgency: 4,
    ease: 2,
    status: 'todo',
    dependencies: []
  },
  {
    title: "設計書作成",
    description: "システム設計書とDB設計書を作成する",
    deadline: 1.week.from_now,
    duration: 720,  # 12時間
    energy_required: 9,
    importance: 5,
    urgency: 3,
    ease: 2,
    status: 'todo',
    dependencies: [1]  # 要件定義書作成に依存
  },
  {
    title: "実装",
    description: "設計書に基づいてシステムを実装する",
    deadline: 2.weeks.from_now,
    duration: 1440, # 24時間
    energy_required: 7,
    importance: 5,
    urgency: 3,
    ease: 3,
    status: 'todo',
    dependencies: [2]  # 設計書作成に依存
  },
  {
    title: "テスト計画書作成",
    description: "テスト計画とテストケースを作成する",
    deadline: 5.days.from_now,
    duration: 240,  # 4時間
    energy_required: 6,
    importance: 4,
    urgency: 3,
    ease: 4,
    status: 'todo',
    dependencies: [1]  # 要件定義書作成に依存
  },
  {
    title: "単体テスト実行",
    description: "実装したコードの単体テストを実行する",
    deadline: 2.weeks.from_now + 2.days,
    duration: 360,  # 6時間
    energy_required: 5,
    importance: 4,
    urgency: 2,
    ease: 5,
    status: 'todo',
    dependencies: [3, 4]  # 実装とテスト計画書作成に依存
  },
  {
    title: "ドキュメント整理",
    description: "プロジェクト関連のドキュメントを整理・更新する",
    deadline: 3.weeks.from_now,
    duration: 120,  # 2時間
    energy_required: 3,
    importance: 2,
    urgency: 1,
    ease: 5,
    status: 'todo',
    dependencies: []
  },
  {
    title: "デプロイ準備",
    description: "本番環境へのデプロイ準備を行う",
    deadline: 2.weeks.from_now + 3.days,
    duration: 180,  # 3時間
    energy_required: 7,
    importance: 4,
    urgency: 2,
    ease: 3,
    status: 'todo',
    dependencies: [5]  # 単体テスト実行に依存
  }
]

# タスクを作成
created_tasks = []
tasks_data.each_with_index do |task_data, index|
  # dependenciesの調整（作成されたタスクのIDに合わせる）
  adjusted_dependencies = task_data[:dependencies].map do |dep_index|
    created_tasks[dep_index - 1]&.id
  end.compact

  task = Task.create!(
    title: task_data[:title],
    description: task_data[:description],
    deadline: task_data[:deadline],
    duration: task_data[:duration],
    energy_required: task_data[:energy_required],
    importance: task_data[:importance],
    urgency: task_data[:urgency],
    ease: task_data[:ease],
    status: task_data[:status],
    dependencies: adjusted_dependencies
  )

  created_tasks << task
  puts "Created task: #{task.title}"
end

puts "Created #{Task.count} tasks successfully!"
