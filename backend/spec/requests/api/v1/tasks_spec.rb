require 'rails_helper'

RSpec.describe "Api::V1::Tasks", type: :request do
  describe "GET /api/v1/tasks" do
    context "when tasks exist" do
      let!(:tasks) do
        [
          Task.create!(
            title: "Task 1",
            description: "Description 1",
            duration: 60,
            energy_required: 5,
            importance: 3,
            urgency: 4,
            ease: 2,
            dependencies: []
          ),
          Task.create!(
            title: "Task 2",
            description: "Description 2",
            duration: 120,
            energy_required: 7,
            importance: 5,
            urgency: 2,
            ease: 4,
            dependencies: [1]
          )
        ]
      end

      it "returns all tasks" do
        get "/api/v1/tasks"

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include("application/json")

        json_response = JSON.parse(response.body)
        expect(json_response.length).to eq(2)
        expect(json_response.first["title"]).to eq("Task 2") # 作成日時降順
        expect(json_response.last["title"]).to eq("Task 1")
      end
    end

    context "when no tasks exist" do
      it "returns empty array" do
        get "/api/v1/tasks"

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response).to eq([])
      end
    end
  end

  describe "GET /api/v1/tasks/:id" do
    let!(:task) do
      Task.create!(
        title: "Test Task",
        description: "Test Description",
        duration: 90,
        energy_required: 6,
        importance: 4,
        urgency: 3,
        ease: 3,
        dependencies: []
      )
    end

    context "when task exists" do
      it "returns the task" do
        get "/api/v1/tasks/#{task.id}"

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response["title"]).to eq("Test Task")
        expect(json_response["duration"]).to eq(90)
      end
    end

    context "when task does not exist" do
      it "returns 404" do
        get "/api/v1/tasks/999999"

        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to eq("Task not found")
      end
    end
  end

  describe "POST /api/v1/tasks" do
    let(:valid_attributes) do
      {
        task: {
          title: "New Task",
          description: "New Description",
          duration: 180,
          energy_required: 8,
          importance: 5,
          urgency: 4,
          ease: 2,
          dependencies: [1, 2]
        }
      }
    end

    let(:invalid_attributes) do
      {
        task: {
          title: "",
          duration: -1,
          energy_required: 15
        }
      }
    end

    context "with valid parameters" do
      it "creates a new task" do
        expect {
          post "/api/v1/tasks", params: valid_attributes, as: :json
        }.to change(Task, :count).by(1)

        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)
        expect(json_response["title"]).to eq("New Task")
        expect(json_response["dependencies"]).to eq([1, 2])
      end
    end

    context "with invalid parameters" do
      it "returns validation errors" do
        post "/api/v1/tasks", params: invalid_attributes, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response["errors"]).to be_present
      end
    end
  end

  describe "DELETE /api/v1/tasks/:id" do
    let!(:task) do
      Task.create!(
        title: "Task to Delete",
        description: "Description",
        duration: 60,
        dependencies: []
      )
    end

    context "when task exists" do
      it "deletes the task" do
        expect {
          delete "/api/v1/tasks/#{task.id}"
        }.to change(Task, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end
    end

    context "when task does not exist" do
      it "returns 404" do
        delete "/api/v1/tasks/999999"

        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to eq("Task not found")
      end
    end
  end
end
