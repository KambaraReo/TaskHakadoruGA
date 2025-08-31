class User < ApplicationRecord
  has_secure_password

  # バリデーション
  validates :name, presence: true, length: { minimum: 2, maximum: 50 }
  validates :email, presence: true, uniqueness: { case_sensitive: false }, 
                   format: { with: URI::MailTo::EMAIL_REGEXP }

  # 関連付け
  has_many :tasks, dependent: :destroy

  # メールアドレスを小文字で保存
  before_save { self.email = email.downcase }
end
