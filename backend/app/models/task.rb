class Task < ApplicationRecord
  def dependencies
    JSON.parse(self[:dependencies] || '[]')
  end

  def dependencies=(value)
    self[:dependencies] = value.to_json
  end

  enum :status, { todo: 'todo', in_progress: 'in_progress', completed: 'completed', cancelled: 'cancelled' }

  validates :title, presence: true
  validates :duration, presence: true, numericality: { greater_than: 0 }
  validates :energy_required, inclusion: { in: 1..10 }
  validates :importance, inclusion: { in: 1..5 }
  validates :urgency, inclusion: { in: 1..5 }
  validates :ease, inclusion: { in: 1..5 }

  # デフォルト値の設定
  after_initialize :set_defaults

  private

  def set_defaults
    self.dependencies ||= []
  end
end
