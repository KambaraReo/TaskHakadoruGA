class AuthController < ApplicationController
  skip_before_action :authenticate_request

  # POST /auth/register
  def register
    user = User.create!(user_params)
    auth_token = AuthenticateUser.new(user.email, user_params[:password]).call
    response = { message: 'Account created successfully', auth_token: auth_token, user: user_response(user) }
    render json: response, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  rescue StandardError => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  # POST /auth/login
  def login
    auth_token = AuthenticateUser.new(auth_params[:email], auth_params[:password]).call
    user = User.find_by(email: auth_params[:email])
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

  def user_params
    params.permit(:name, :email, :password, :password_confirmation)
  end

  def auth_params
    params.permit(:email, :password)
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
