from utils import Process
def simulate_rr(proc_list, quantum=4):
    procs = [Process(p.pid,p.arrival,p.burst,p.priority) for p in proc_list]
    time = 0
    gantt = []
    queue = []
    procs_sorted = sorted(procs, key=lambda x: x.arrival)
    i = 0
    last_pid = None
    segment_start = None
    while True:
        while i < len(procs_sorted) and procs_sorted[i].arrival <= time:
            queue.append(procs_sorted[i]); i+=1
        if not queue:
            if i < len(procs_sorted):
                time = procs_sorted[i].arrival
                continue
            else:
                break
        p = queue.pop(0)
        if p.start_time is None:
            p.start_time = time
        run = min(quantum, p.remaining)
        if last_pid != p.pid:
            if last_pid is not None:
                gantt.append((last_pid, segment_start, time))
            segment_start = time
            last_pid = p.pid
        p.remaining -= run
        time += run
        while i < len(procs_sorted) and procs_sorted[i].arrival <= time:
            queue.append(procs_sorted[i]); i+=1
        if p.remaining == 0:
            p.completion_time = time
            gantt.append((p.pid, segment_start, time))
            last_pid = None
            segment_start = None
        else:
            queue.append(p)
    return gantt, procs
