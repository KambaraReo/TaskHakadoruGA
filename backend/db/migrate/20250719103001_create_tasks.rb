class CreateTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :tasks do |t|
      t.string :title, null: false
      t.text :description
      t.datetime :deadline
      t.integer :duration, null: false                # 単位: 分
      t.integer :energy_required, default: 5          # 1〜10想定
      t.integer :importance, default: 3               # 1〜5
      t.integer :urgency, default: 3                  # 1〜5
      t.integer :ease, default: 3                     # 1〜5 (実装の容易さ)
      t.string :status, default: 'todo'              # enum的に使う
      t.text :dependencies                            # JSON配列で依存関係
      t.references :user, null: true, foreign_key: true  # ユーザー関連付け

      t.timestamps
    end

    add_index :tasks, :status
    add_index :tasks, :deadline
  end
end
