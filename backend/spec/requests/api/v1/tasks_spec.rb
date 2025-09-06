require 'rails_helper'

RSpec.describe "Api::V1::Tasks", type: :request do
  let(:user) { authenticated_user }
  let(:headers) { auth_headers(user) }

  describe "GET /api/v1/tasks" do
    context "when tasks exist" do
      let!(:tasks) do
        [
          create(:task,
            title: "Task 1",
            description: "Description 1",
            duration: 60,
            energy_required: 5,
            importance: 3,
            urgency: 4,
            ease: 2,
            dependencies: [],
            user: user
          ),
          create(:task,
            title: "Task 2",
            description: "Description 2",
            duration: 120,
            energy_required: 7,
            importance: 5,
            urgency: 2,
            ease: 4,
            dependencies: [1],
            user: user
          )
        ]
      end

      it "returns all tasks" do
        get "/api/v1/tasks", headers: headers

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
        get "/api/v1/tasks", headers: headers

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response).to eq([])
      end
    end
  end

  describe "GET /api/v1/tasks/:id" do
    let!(:task) do
      create(:task,
        title: "Test Task",
        description: "Test Description",
        duration: 90,
        energy_required: 6,
        importance: 4,
        urgency: 3,
        ease: 3,
        dependencies: [],
        user: user
      )
    end

    context "when task exists" do
      it "returns the task" do
        get "/api/v1/tasks/#{task.id}", headers: headers

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response["title"]).to eq("Test Task")
        expect(json_response["duration"]).to eq(90)
      end
    end

    context "when task does not exist" do
      it "returns 404" do
        get "/api/v1/tasks/999999", headers: headers

        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response["message"]).to include("Couldn't find Task")
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
          description: "a" * 201, # 201文字で文字数制限違反
          duration: -1,
          energy_required: 15
        }
      }
    end

    context "with valid parameters" do
      it "creates a new task" do
        expect {
          post "/api/v1/tasks", params: valid_attributes, headers: headers, as: :json
        }.to change(Task, :count).by(1)

        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)
        expect(json_response["title"]).to eq("New Task")
        expect(json_response["dependencies"]).to eq([1, 2])
      end
    end

    context "with invalid parameters" do
      it "returns validation errors" do
        post "/api/v1/tasks", params: invalid_attributes, headers: headers, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response["errors"]).to be_present
      end
    end
  end

  describe "PUT /api/v1/tasks/:id" do
    let!(:task) do
      create(:task,
        title: "Original Task",
        description: "Original Description",
        duration: 60,
        energy_required: 5,
        importance: 3,
        urgency: 4,
        ease: 2,
        status: "todo",
        dependencies: [],
        user: user
      )
    end

    let(:valid_update_attributes) do
      {
        task: {
          title: "Updated Task",
          description: "Updated Description",
          duration: 120,
          energy_required: 7,
          importance: 5,
          urgency: 3,
          ease: 4,
          status: "completed",
          dependencies: [1, 2]
        }
      }
    end

    let(:invalid_update_attributes) do
      {
        task: {
          title: "",
          description: "a" * 201, # 201文字で文字数制限違反
          duration: -1,
          energy_required: 15
        }
      }
    end

    context "when task exists" do
      context "with valid parameters" do
        it "updates the task" do
          put "/api/v1/tasks/#{task.id}", params: valid_update_attributes, headers: headers, as: :json

          expect(response).to have_http_status(:ok)
          json_response = JSON.parse(response.body)
          expect(json_response["title"]).to eq("Updated Task")
          expect(json_response["description"]).to eq("Updated Description")
          expect(json_response["duration"]).to eq(120)
          expect(json_response["status"]).to eq("completed")
          expect(json_response["dependencies"]).to eq([1, 2])

          # データベースでも更新されていることを確認
          task.reload
          expect(task.title).to eq("Updated Task")
          expect(task.status).to eq("completed")
        end

        it "updates only specified fields" do
          partial_update = {
            task: {
              title: "Partially Updated Task",
              status: "in_progress"
            }
          }

          put "/api/v1/tasks/#{task.id}", params: partial_update, headers: headers, as: :json

          expect(response).to have_http_status(:ok)
          json_response = JSON.parse(response.body)
          expect(json_response["title"]).to eq("Partially Updated Task")
          expect(json_response["status"]).to eq("in_progress")
          expect(json_response["description"]).to eq("Original Description") # 元の値が保持される
        end
      end

      context "with invalid parameters" do
        it "returns validation errors" do
          put "/api/v1/tasks/#{task.id}", params: invalid_update_attributes, headers: headers, as: :json

          expect(response).to have_http_status(:unprocessable_entity)
          json_response = JSON.parse(response.body)
          expect(json_response["errors"]).to be_present

          # データベースは更新されていないことを確認
          task.reload
          expect(task.title).to eq("Original Task")
        end
      end
    end

    context "when task does not exist" do
      it "returns 404" do
        put "/api/v1/tasks/999999", params: valid_update_attributes, headers: headers, as: :json

        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response["message"]).to include("Couldn't find Task")
      end
    end
  end

  describe "DELETE /api/v1/tasks/:id" do
    let!(:task) do
      create(:task,
        title: "Task to Delete",
        description: "Description",
        duration: 60,
        dependencies: [],
        user: user
      )
    end

    context "when task exists" do
      it "deletes the task" do
        expect {
          delete "/api/v1/tasks/#{task.id}", headers: headers
        }.to change(Task, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end
    end

    context "when task does not exist" do
      it "returns 404" do
        delete "/api/v1/tasks/999999", headers: headers

        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response["message"]).to include("Couldn't find Task")
      end
    end
  end
end
