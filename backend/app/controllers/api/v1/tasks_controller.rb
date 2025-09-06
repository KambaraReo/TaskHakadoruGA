class Api::V1::TasksController < ApplicationController
  before_action :set_task, only: [:show, :update, :destroy]

  # GET /api/v1/tasks
  def index
    @tasks = current_user.tasks.order(created_at: :desc)
    render json: @tasks.map { |task| task_response(task) }
  end

  # GET /api/v1/tasks/:id
  def show
    render json: task_response(@task)
  end

  # POST /api/v1/tasks
  def create
    @task = current_user.tasks.build(task_params)

    if @task.save
      render json: task_response(@task), status: :created
    else
      render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/tasks/:id
  def update
    if @task.update(task_params)
      render json: task_response(@task)
    else
      render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/tasks/:id
  def destroy
    @task.destroy
    head :no_content
  end

  private

  def set_task
    @task = current_user.tasks.find(params[:id])
  end

  def task_params
    params.require(:task).permit(:title, :description, :status, :duration, :energy_required,
      :importance, :urgency, :ease, dependencies: [])
  end

  def task_response(task)
    {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      duration: task.duration,
      energy_required: task.energy_required,
      importance: task.importance,
      urgency: task.urgency,
      ease: task.ease,
      dependencies: task.dependencies,
      created_at: task.created_at,
      updated_at: task.updated_at
    }
  end
end
