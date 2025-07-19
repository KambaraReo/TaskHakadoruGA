class Api::V1::BaseController < ApplicationController
  # API共通の設定をここに記述
  # protect_from_forgery with: :null_session

  # JSON形式のレスポンスを強制
  before_action :ensure_json_request

  private

  def ensure_json_request
    request.format = :json
  end
end
