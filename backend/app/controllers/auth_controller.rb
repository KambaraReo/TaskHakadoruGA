class AuthController < ApplicationController
  skip_before_action :authenticate_request

  # POST /auth/register
  def register
    decoded_params = decode_auth_data
    user = User.create!(decoded_params)
    auth_token = AuthenticateUser.new(user.email, decoded_params[:password]).call
    response = { message: 'Account created successfully', auth_token: auth_token, user: user_response(user) }
    render json: response, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  rescue StandardError => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  # POST /auth/login
  def login
    decoded_params = decode_auth_data
    auth_token = AuthenticateUser.new(decoded_params[:email], decoded_params[:password]).call
    user = User.find_by(email: decoded_params[:email])
    response = { message: 'Login successful', auth_token: auth_token, user: user_response(user) }
    render json: response, status: :ok
  rescue StandardError => e
    raise ExceptionHandler::AuthenticationError, e.message
  end

  # GET /auth/me
  def me
    render json: { user: user_response(current_user) }, status: :ok
  end

  private

  def decode_auth_data
    if params[:data].present?
      # エンコードされたデータをデコード（Base64 -> JSON）
      decoded_json = Base64.decode64(params[:data])
      JSON.parse(decoded_json).with_indifferent_access
    else
      # 従来の形式もサポート（後方互換性）
      params.permit(:name, :email, :password, :password_confirmation)
    end
  rescue JSON::ParserError, ArgumentError => e
    Rails.logger.error "Auth data decode error: #{e.message}"
    # デコードに失敗した場合は従来の形式を試す
    params.permit(:name, :email, :password, :password_confirmation)
  end

  def user_params
    decode_auth_data
  end

  def auth_params
    decode_auth_data
  end

  def user_response(user)
    {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at
    }
  end
end
