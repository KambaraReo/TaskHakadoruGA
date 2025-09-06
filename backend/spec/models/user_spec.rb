require 'rails_helper'

RSpec.describe User, type: :model do
  describe "validations" do
    it "is valid with valid attributes" do
      user = User.new(
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      )
      expect(user).to be_valid
    end

    describe "name validation" do
      it "is invalid without a name" do
        user = User.new(email: "test@example.com", password: "password123")
        expect(user).not_to be_valid
        expect(user.errors[:name]).to include("can't be blank")
      end

      it "is invalid with name shorter than 2 characters" do
        user = User.new(name: "A", email: "test@example.com", password: "password123")
        expect(user).not_to be_valid
        expect(user.errors[:name]).to include("is too short (minimum is 2 characters)")
      end

      it "is invalid with name longer than 50 characters" do
        long_name = "a" * 51
        user = User.new(name: long_name, email: "test@example.com", password: "password123")
        expect(user).not_to be_valid
        expect(user.errors[:name]).to include("is too long (maximum is 50 characters)")
      end

      it "is valid with name exactly 2 characters" do
        user = User.new(name: "AB", email: "test@example.com", password: "password123")
        expect(user).to be_valid
      end

      it "is valid with name exactly 50 characters" do
        name_50_chars = "a" * 50
        user = User.new(name: name_50_chars, email: "test@example.com", password: "password123")
        expect(user).to be_valid
      end
    end

    describe "email validation" do
      it "is invalid without an email" do
        user = User.new(name: "Test User", password: "password123")
        expect(user).not_to be_valid
        expect(user.errors[:email]).to include("can't be blank")
      end

      it "is invalid with invalid email format" do
        invalid_emails = ["invalid", "test@", "@example.com", "test.example.com", "test@.com"]

        invalid_emails.each do |invalid_email|
          user = User.new(name: "Test User", email: invalid_email, password: "password123")
          expect(user).not_to be_valid
          expect(user.errors[:email]).to include("is invalid")
        end
      end

      it "is valid with valid email formats" do
        valid_emails = [
          "test@example.com",
          "user.name@example.com",
          "user+tag@example.co.jp",
          "123@example.org"
        ]

        valid_emails.each do |valid_email|
          user = User.new(name: "Test User", email: valid_email, password: "password123")
          expect(user).to be_valid
        end
      end

      it "is invalid with duplicate email (case insensitive)" do
        create(:user, email: "test@example.com")

        user = User.new(name: "Another User", email: "TEST@EXAMPLE.COM", password: "password123")
        expect(user).not_to be_valid
        expect(user.errors[:email]).to include("has already been taken")
      end
    end

    describe "password validation" do
      it "is invalid without a password" do
        user = User.new(name: "Test User", email: "test@example.com")
        expect(user).not_to be_valid
        expect(user.errors[:password]).to include("can't be blank")
      end

      it "is valid with a password" do
        user = User.new(name: "Test User", email: "test@example.com", password: "password123")
        expect(user).to be_valid
      end
    end
  end

  describe "callbacks" do
    describe "before_save" do
      it "converts email to lowercase before saving" do
        user = create(:user, email: "TEST@EXAMPLE.COM")
        expect(user.email).to eq("test@example.com")
      end

      it "preserves already lowercase email" do
        user = create(:user, email: "test@example.com")
        expect(user.email).to eq("test@example.com")
      end
    end
  end

  describe "associations" do
    describe "tasks" do
      let(:user) { create(:user) }

      it "has many tasks" do
        expect(user).to respond_to(:tasks)
        expect(user.tasks).to be_empty
      end

      it "can have multiple tasks" do
        task1 = create(:task, user: user, title: "Task 1")
        task2 = create(:task, user: user, title: "Task 2")

        expect(user.tasks.count).to eq(2)
        expect(user.tasks).to include(task1, task2)
      end

      it "destroys associated tasks when user is destroyed" do
        create(:task, user: user)
        create(:task, user: user)

        expect { user.destroy }.to change(Task, :count).by(-2)
      end
    end
  end

  describe "has_secure_password" do
    let(:user) { create(:user, password: "password123") }

    it "authenticates with correct password" do
      expect(user.authenticate("password123")).to eq(user)
    end

    it "does not authenticate with incorrect password" do
      expect(user.authenticate("wrongpassword")).to be_falsey
    end

    it "has password_digest attribute" do
      expect(user).to respond_to(:password_digest)
      expect(user.password_digest).to be_present
    end
  end

  describe "factory" do
    it "creates a valid user with factory" do
      user = create(:user)
      expect(user).to be_valid
      expect(user).to be_persisted
    end

    it "creates unique emails for multiple users" do
      user1 = create(:user)
      user2 = create(:user)

      expect(user1.email).not_to eq(user2.email)
    end
  end
end
