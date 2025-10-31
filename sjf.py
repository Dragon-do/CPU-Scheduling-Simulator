from utils import Process
def simulate_sjf_nonpreemptive(proc_list):
    procs = [Process(p.pid,p.arrival,p.burst,p.priority) for p in proc_list]
    time = 0
    gantt = []
    ready = []
    procs_sorted = sorted(procs, key=lambda x: x.arrival)
    i = 0
    n = len(procs_sorted)
    while i < n or ready:
        while i < n and procs_sorted[i].arrival <= time:
            ready.append(procs_sorted[i]); i+=1
        if not ready:
            time = procs_sorted[i].arrival
            continue
        ready.sort(key=lambda x: (x.burst, x.arrival, x.pid))
        p = ready.pop(0)
        p.start_time = time
        p.completion_time = time + p.burst
        gantt.append((p.pid, p.start_time, p.completion_time))
        time = p.completion_time
    return gantt, procs
