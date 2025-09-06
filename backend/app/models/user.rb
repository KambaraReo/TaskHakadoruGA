class User < ApplicationRecord
  has_secure_password

  # バリデーション
  validates :name,
    presence: { message: "名前は必須です" },
    length: { minimum: 2, maximum: 50,
              too_short: "名前は2文字以上で入力してください",
              too_long: "名前は50文字以下で入力してください" }

  validates :email,
    presence: { message: "メールアドレスは必須です" },
    uniqueness: { case_sensitive: false, message: "このメールアドレスは既に使用されています" },
    format: { with: URI::MailTo::EMAIL_REGEXP, message: "有効なメールアドレスを入力してください" }

  validates :password,
    length: { minimum: 6, message: "パスワードは6文字以上で入力してください" },
    if: :password_required?

  # 関連付け
  has_many :tasks, dependent: :destroy

  # メールアドレスを小文字で保存
  before_save { self.email = email.downcase }

  private

  def password_required?
    new_record? || password.present?
  end
end
