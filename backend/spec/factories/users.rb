FactoryBot.define do
  factory :user do
    sequence(:name) { |n| "Test User #{n}" }
    sequence(:email) { |n| "test#{n}@example.com" }
    password { "password123" }
  end
end
