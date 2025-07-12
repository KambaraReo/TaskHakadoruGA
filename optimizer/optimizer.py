import json
from pymoo.algorithms.moo.nsga2 import NSGA2
from pymoo.core.problem import ElementwiseProblem
from pymoo.optimize import minimize

class TaskOrderProblem(ElementwiseProblem):
    def __init__(self, tasks):
        self.tasks = tasks
        super().__init__(
            n_var=len(tasks),
            n_obj=2,
            n_constr=0,
            xl=0,
            xu=len(tasks)-1,
            type_var=int
        )

    def _evaluate(self, x, out, *args, **kwargs):
        order = [self.tasks[i] for i in x]
        f1 = sum(task['urgency'] * i for i, task in enumerate(order))  # 重要度順
        f2 = sum(task['time'] for task in order)  # 時間合計（シンプルな例）
        out["F"] = [f1, f2]

def run_optimization(tasks):
    """
    tasks: List of dicts, each with keys 'name', 'urgency', 'time'
    returns: List of solutions with optimized order and objectives
    """
    problem = TaskOrderProblem(tasks)
    result = minimize(problem, NSGA2(pop_size=30), ('n_gen', 20), seed=1, verbose=False)

    solutions = []
    for sol in result.pop:
        order = [tasks[i] for i in sol.X]
        solutions.append({
            "order": [task["name"] for task in order],
            "objectives": sol.F.tolist()
        })

    return solutions

if __name__ == "__main__":
    import sys
    input_data = json.load(sys.stdin)
    tasks = input_data["tasks"]
    solutions = run_optimization(tasks)
    print(json.dumps(solutions))
