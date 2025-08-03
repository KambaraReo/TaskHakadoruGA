require 'rails_helper'

RSpec.describe Task, type: :model do
  describe "validations" do
    it "is valid with valid attributes" do
      task = Task.new(
        title: "Test Task",
        description: "Test Description",
        duration: 60,
        energy_required: 5,
        importance: 3,
        urgency: 4,
        ease: 2,
        dependencies: []
      )
      expect(task).to be_valid
    end

    it "is invalid without a title" do
      task = Task.new(duration: 60)
      expect(task).not_to be_valid
      expect(task.errors[:title]).to include("can't be blank")
    end

    it "is invalid without duration" do
      task = Task.new(title: "Test Task")
      expect(task).not_to be_valid
      expect(task.errors[:duration]).to include("can't be blank")
    end

    it "is invalid with negative duration" do
      task = Task.new(title: "Test Task", duration: -1)
      expect(task).not_to be_valid
      expect(task.errors[:duration]).to include("must be greater than 0")
    end

    it "is invalid with energy_required out of range" do
      task = Task.new(title: "Test Task", duration: 60, energy_required: 15)
      expect(task).not_to be_valid
      expect(task.errors[:energy_required]).to include("is not included in the list")
    end

    it "is invalid with importance out of range" do
      task = Task.new(title: "Test Task", duration: 60, importance: 6)
      expect(task).not_to be_valid
      expect(task.errors[:importance]).to include("is not included in the list")
    end

    it "is valid with description up to 200 characters" do
      description = "a" * 200
      task = Task.new(title: "Test Task", duration: 60, description: description)
      expect(task).to be_valid
    end

    it "is invalid with description over 200 characters" do
      description = "a" * 201
      task = Task.new(title: "Test Task", duration: 60, description: description)
      expect(task).not_to be_valid
      expect(task.errors[:description]).to include("is too long (maximum is 200 characters)")
    end

    it "is valid with empty description" do
      task = Task.new(title: "Test Task", duration: 60, description: "")
      expect(task).to be_valid
    end

    it "is valid with nil description" do
      task = Task.new(title: "Test Task", duration: 60, description: nil)
      expect(task).to be_valid
    end
  end

  describe "dependencies" do
    it "handles dependencies as JSON array" do
      task = Task.create!(
        title: "Test Task",
        duration: 60,
        dependencies: [1, 2, 3]
      )

      expect(task.dependencies).to eq([1, 2, 3])
      expect(task.dependencies).to be_a(Array)
    end

    it "initializes with empty dependencies array" do
      task = Task.new(title: "Test Task", duration: 60)
      expect(task.dependencies).to eq([])
    end

    it "can update dependencies" do
      task = Task.create!(title: "Test Task", duration: 60, dependencies: [])
      task.dependencies = [4, 5]
      task.save!

      task.reload
      expect(task.dependencies).to eq([4, 5])
    end
  end

  describe "status enum" do
    let(:task) { Task.create!(title: "Test Task", duration: 60) }

    it "defaults to todo status" do
      expect(task.status).to eq('todo')
      expect(task.todo?).to be true
    end

    it "can change status" do
      task.in_progress!
      expect(task.status).to eq('in_progress')
      expect(task.in_progress?).to be true
    end

    it "supports all status values" do
      expect(Task.statuses.keys).to contain_exactly('todo', 'in_progress', 'completed', 'cancelled')
    end
  end

  describe "default values" do
    let(:task) { Task.create!(title: "Test Task", duration: 60) }

    it "sets default values correctly" do
      expect(task.energy_required).to eq(5)
      expect(task.importance).to eq(3)
      expect(task.urgency).to eq(3)
      expect(task.ease).to eq(3)
      expect(task.status).to eq('todo')
      expect(task.dependencies).to eq([])
    end
  end
end
