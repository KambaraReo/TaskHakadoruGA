from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from optimizer import run_optimization
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

class Task(BaseModel):
    name: str
    urgency: int
    time: int

@app.post("/optimize")
def optimize(tasks: List[Task]):
    return run_optimization([task.dict() for task in tasks])
