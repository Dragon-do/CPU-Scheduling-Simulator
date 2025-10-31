import os, pandas as pd
from utils import Process
from fcfs import simulate_fcfs
from sjf import simulate_sjf_nonpreemptive
from srtf import simulate_srtf
from priority_preemptive import simulate_priority_preemptive
from round_robin import simulate_rr
import matplotlib.pyplot as plt

OUTDIR = os.path.join(os.path.dirname(__file__), '..', 'scheduler_outputs') if os.path.dirname(__file__) else 'scheduler_outputs'
OUTDIR = os.path.abspath(OUTDIR)
os.makedirs(OUTDIR, exist_ok=True)

def compute_metrics(procs):
    rows = []
    for p in sorted(procs, key=lambda x: x.pid):
        tat = p.completion_time - p.arrival
        wt = tat - p.burst
        rt = p.start_time - p.arrival if p.start_time is not None else None
        rows.append({
            'PID': p.pid, 'Arrival': p.arrival, 'Burst': p.burst, 'Priority': p.priority,
            'Start': p.start_time, 'Completion': p.completion_time,
            'Turnaround': tat, 'Waiting': wt, 'Response': rt
        })
    df = pd.DataFrame(rows)
    means = df[['Turnaround','Waiting','Response']].mean().to_frame().T
    means.insert(0, 'PID', 'Average')
    df = pd.concat([df, means], ignore_index=True)
    return df

def save_gantt(gantt, title, fname):
    if not gantt: return
    fig, ax = plt.subplots(figsize=(10,2))
    y = 0
    for seg in gantt:
        pid, start, end = seg
        ax.broken_barh([(start, end-start)], (y, 0.9))
        ax.text((start+end)/2, y+0.45, pid, ha='center', va='center')
    ax.set_ylim(0,1)
    ax.set_xlabel('Time')
    ax.set_yticks([])
    ax.set_title(title)
    ax.grid(True)
    path = os.path.join(OUTDIR, fname)
    fig.savefig(path, bbox_inches='tight')
    plt.close(fig)

# Sample processes
sample = [
    Process('P1',0,8,2),
    Process('P2',1,4,1),
    Process('P3',2,9,3),
    Process('P4',3,5,2),
]

runs = [
    ('FCFS', simulate_fcfs, {}),
    ('SJF', simulate_sjf_nonpreemptive, {}),
    ('SRTF', simulate_srtf, {}),
    ('Priority', simulate_priority_preemptive, {}),
    ('RR_q3', simulate_rr, {'quantum':3}),
]

for name, func, kwargs in runs:
    if kwargs:
        gantt, procs = func(sample, **kwargs)
    else:
        gantt, procs = func(sample)
    df = compute_metrics(procs)
    csv_path = os.path.join(OUTDIR, f"{name.lower()}_metrics.csv")
    df.to_csv(csv_path, index=False)
    save_gantt(gantt, f"{name} Gantt Chart", f"{name.lower()}.png")
    print(f"Saved {name} outputs to {OUTDIR}")
