# User を作成（全タスク共通で使用）
user = User.find_or_create_by!(
    name: "ゲスト",
    email: "guest@example.com"
  ) do |u|
    u.password = "password"
end

# 既存の Task を削除（開発環境でのリセット用）
Task.destroy_all

# タスクデータ定義
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
    dependencies: [1]
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
    dependencies: [2]
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
    dependencies: [1]
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
    dependencies: [3, 4]
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
    dependencies: [5]
  }
]

# タスク作成処理
created_tasks = []

tasks_data.each_with_index do |task_data, index|
  # 依存タスク ID の調整
  adjusted_dependencies = task_data[:dependencies].map do |dep_index|
    created_tasks[dep_index - 1]&.id
  end.compact

  # Task 作成
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
    dependencies: adjusted_dependencies,
    user: user  # User を紐付け
  )

  created_tasks << task
  puts "Created task: #{task.title}"
end

puts "All #{Task.count} tasks created successfully!"
