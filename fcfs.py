from utils import Process
def simulate_fcfs(proc_list):
    procs = [Process(p.pid,p.arrival,p.burst,p.priority) for p in proc_list]
    procs.sort(key=lambda x:(x.arrival,x.pid))
    time = 0
    gantt = []
    for p in procs:
        if time < p.arrival: time = p.arrival
        p.start_time = time
        p.completion_time = time + p.burst
        gantt.append((p.pid,p.start_time,p.completion_time))
        time = p.completion_time
    return gantt, procs
