from utils import Process
def simulate_srtf(proc_list):
    procs = [Process(p.pid,p.arrival,p.burst,p.priority) for p in proc_list]
    time = 0
    gantt = []
    procs_sorted = sorted(procs, key=lambda x: x.arrival)
    ready = []
    i = 0
    last_pid = None
    segment_start = None
    remaining_count = len(procs_sorted)
    while remaining_count > 0:
        while i < len(procs_sorted) and procs_sorted[i].arrival <= time:
            ready.append(procs_sorted[i]); i+=1
        if not ready:
            time = procs_sorted[i].arrival
            continue
        ready.sort(key=lambda x: (x.remaining, x.arrival, x.pid))
        p = ready[0]
        if p.start_time is None:
            p.start_time = time
        if last_pid != p.pid:
            if last_pid is not None:
                gantt.append((last_pid, segment_start, time))
            segment_start = time
            last_pid = p.pid
        p.remaining -= 1
        time += 1
        if p.remaining == 0:
            p.completion_time = time
            ready.pop(0)
            remaining_count -= 1
            gantt.append((p.pid, segment_start, time))
            last_pid = None
            segment_start = None
    return gantt, procs
