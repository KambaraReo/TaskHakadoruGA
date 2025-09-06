FactoryBot.define do
  factory :task do
    title { "Test Task" }
    description { "Test Description" }
    duration { 60 }
    energy_required { 5 }
    importance { 3 }
    urgency { 4 }
    ease { 2 }
    status { "todo" }
    dependencies { [] }
    association :user
  end
end
