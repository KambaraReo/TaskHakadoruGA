module AuthHelpers
  def auth_headers(user)
    token = JsonWebToken.encode(user_id: user.id)
    { 'Authorization' => "Bearer #{token}" }
  end

  def authenticated_user
    @authenticated_user ||= create(:user)
  end
end

RSpec.configure do |config|
  config.include AuthHelpers, type: :request
end
