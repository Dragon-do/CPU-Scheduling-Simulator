// script.js 
document.addEventListener("DOMContentLoaded", function () {
  let processes = [
    { pid: "P1", arrival: 0, burst: 6 },
    { pid: "P2", arrival: 1, burst: 4 },
    { pid: "P3", arrival: 2, burst: 8 },
    { pid: "P4", arrival: 3, burst: 4 },
  ];

  let arrivalMode = document.getElementById("arrivalTime")?.value || "arrival";
  const colors = ["#4caf50", "#ff9800", "#2b76e5", "#9c27b0", "#00acc1", "#607d8b", "#d84315"];
  let ganttChart = null;

  function deepCopy(arr) { return JSON.parse(JSON.stringify(arr)); }

 
  function fcfs(pi) {
    let p = deepCopy(pi).sort((a, b) => a.arrival - b.arrival);
    let t = 0;
    p.forEach((x) => {
      t = Math.max(t, x.arrival);
      x.completion = t + x.burst;
      x.turnaround = x.completion - x.arrival;
      x.waiting = x.turnaround - x.burst;
      t = x.completion;
    });
    return p;
  }

  function sjf(pi) {
    let p = deepCopy(pi).map((x,i) => ({...x, idx:i}));
    let n=p.length, comp=0, t=0, mark=Array(n).fill(false), order=[];
    while (comp < n) {
      let idx=-1, minB=Infinity;
      for (let i=0;i<n;i++){
        if (!mark[i] && p[i].arrival <= t && p[i].burst < minB){ minB=p[i].burst; idx=i; }
      }
      if (idx===-1){ t++; continue; }
      let x=p[idx];
      x.completion = t + x.burst;
      x.turnaround = x.completion - x.arrival;
      x.waiting = x.turnaround - x.burst;
      t = x.completion; mark[idx]=true; order.push(x); comp++;
    }
    order.sort((a,b)=>a.idx - b.idx);
    return order;
  }

  function srtf(pi) {
    let p = deepCopy(pi).map((x,i)=>({...x, idx:i, remain:x.burst}));
    let n=p.length, t=0, comp=0, out=[];
    while (comp < n) {
      let idx=-1, minR=Infinity;
      for (let i=0;i<n;i++){
        if (p[i].arrival <= t && p[i].remain > 0 && p[i].remain < minR){ minR=p[i].remain; idx=i; }
      }
      if (idx===-1){ t++; continue; }
      p[idx].remain--; t++;
      if (p[idx].remain === 0){ p[idx].completion = t; p[idx].turnaround = p[idx].completion - p[idx].arrival; p[idx].waiting = p[idx].turnaround - p[idx].burst; out.push(p[idx]); comp++; }
    }
    out.sort((a,b)=>a.idx - b.idx);
    return out;
  }

  function priorityScheduling(pi) {
    let p = deepCopy(pi);
    p.forEach((x,i)=>{ if (x.priority === undefined) x.priority = i+1; });
    let n=p.length, t=0, comp=0, mark=Array(n).fill(false), out=[];
    while (comp < n) {
      let idx=-1, minPri=Infinity;
      for (let i=0;i<n;i++){
        if (!mark[i] && p[i].arrival <= t && p[i].priority < minPri){ minPri=p[i].priority; idx=i; }
      }
      if (idx===-1){ t++; continue; }
      p[idx].completion = t + p[idx].burst;
      p[idx].turnaround = p[idx].completion - p[idx].arrival;
      p[idx].waiting = p[idx].turnaround - p[idx].burst;
      mark[idx]=true; t = p[idx].completion; out.push(p[idx]); comp++;
    }
    out.sort((a,b)=>parseInt(a.pid.substring(1)) - parseInt(b.pid.substring(1)));
    return out;
  }

  function roundRobin(pi, q) {
    let p = deepCopy(pi).map(x => ({...x, remain:x.burst}));
    let n=p.length, t = Math.min(...p.map(x=>x.arrival)), queue=[], comp=0;
    while (comp < n) {
      for (let i=0;i<n;i++){ if (p[i].arrival <= t && !queue.includes(i) && p[i].remain > 0) queue.push(i); }
      if (queue.length === 0){ t++; continue; }
      let idx = queue.shift();
      let exec = Math.min(q, p[idx].remain);
      p[idx].remain -= exec;
      t += exec;
      for (let i=0;i<n;i++){
        if (p[i].arrival > t - exec && p[i].arrival <= t && !queue.includes(i) && p[i].remain > 0) queue.push(i);
      }
      if (p[idx].remain === 0){ p[idx].completion = t; p[idx].turnaround = p[idx].completion - p[idx].arrival; p[idx].waiting = p[idx].turnaround - p[idx].burst; comp++; }
      else queue.push(idx);
    }
    p.sort((a,b)=>parseInt(a.pid.substring(1)) - parseInt(b.pid.substring(1)));
    return p;
  }

  
  function renderProcesses() {
    const list = document.getElementById("processList");
    list.innerHTML = "";
    processes.forEach((p, idx) => {
      const arrivalHtml = arrivalMode === "manual"
        ? `<input type="number" class="input-arrival" value="${p.arrival}" min="0" style="width:72px;padding:6px;border-radius:6px;border:1px solid rgba(0,0,0,0.06);margin-right:6px" onchange="updateArrival(${idx}, this.value)" />`
        : `<span style="min-width:34px;color:var(--muted);font-weight:600">${p.arrival}</span>`;

      list.innerHTML += `
      <div class="process-row">
        <span>${p.pid}</span>
        ${arrivalHtml}
        <input type="number" class="input-burst" value="${p.burst}" min="1" style="width:58px;text-align:center;height:34px" onchange="updateBurst(${idx}, this.value)" />
        <button class="remove-p" onclick="removeProcess(${idx})">&times;</button>
      </div>`;
    });
  }

  window.updateBurst = function(idx, val) {
    processes[idx].burst = parseInt(val) || 0;
    renderResults(); renderGantt();
  };

  window.updateArrival = function(idx, val) {
    processes[idx].arrival = parseInt(val) || 0;
    renderResults(); renderGantt();
  };

  window.removeProcess = function(idx) {
    processes.splice(idx,1);
    processes.forEach((p,i)=>p.pid = `P${i+1}`);
    renderProcesses(); renderResults(); renderGantt();
  };


  function renderResults() {
    let html = "";
    processes.forEach(p=>{
      html += `<tr>
        <td>${p.pid}</td>
        <td>${p.arrival}</td>
        <td>${p.burst}</td>
        <td>${(p.completion||0).toFixed(2)}</td>
        <td>${(p.turnaround||0).toFixed(2)}</td>
        <td>${(p.waiting||0).toFixed(2)}</td>
      </tr>`;
    });
    document.getElementById("resultsBody").innerHTML = html;
    const avgT = processes.length ? processes.reduce((s,x)=> s + (x.turnaround||0),0)/processes.length : 0;
    const avgW = processes.length ? processes.reduce((s,x)=> s + (x.waiting||0),0)/processes.length : 0;
    document.getElementById("avgTurn").innerText = avgT.toFixed(2);
    document.getElementById("avgWait").innerText = avgW.toFixed(2);
    updateEvaluationSummary();
  }

  function updateEvaluationSummary() {
    const evalDiv = document.getElementById("evalSummary");
    const alg = document.querySelector("input[name='alg']:checked")?.value;
    if (!processes.length || !alg) { evalDiv.innerHTML = ""; return; }
    let summary = "";
    if (alg === "RR") summary = `<strong>Round Robin performed fairly</strong> because:<ul><li>All processes receive equal CPU time slices (quantum)</li><li>Short processes may experience moderate waiting, but responsiveness is balanced</li></ul>`;
    else if (alg === "FCFS") summary = `<strong>FCFS performed adequately</strong> because:<ul><li>Processes are served in order of arrival</li><li>No preemption, can cause the 'convoy effect'</li></ul>`;
    else if (alg === "SJF") summary = `<strong>SJF performed well</strong> because:<ul><li>Shortest job is selected first leading to lower average waiting and turnaround time</li><li>May starve long processes</li></ul>`;
    else if (alg === "SRTF") summary = `<strong>SRTF performed best</strong> because:<ul><li>Preemption allows short tasks to finish sooner</li><li>Minimizes waiting/turnaround in many cases</li></ul>`;
    else if (alg === "PRIORITY") summary = `<strong>Priority Scheduling performed as expected</strong> because:<ul><li>Processes with higher priority run first</li><li>Use aging to prevent starvation</li></ul>`;
    evalDiv.innerHTML = summary;
  }

  
  function renderGantt() {
    if (typeof Chart === "undefined") return;
    const isLight = document.body.classList.contains("light-mode");
    const ctx = document.getElementById("ganttChart").getContext("2d");
    if (ganttChart) ganttChart.destroy();

    const values = processes.map(p => p.turnaround || p.burst || 0);
    const maxVal = values.length ? Math.max(...values) : 0;
    const palette = isLight ? ["#2e7d32","#ffb300","#2b76e5","#8e24aa","#0097a7","#546e7a","#d84315"] : colors.slice();

    const softShadowPlugin = {
      id: "softShadow",
      beforeDatasetsDraw(chart) {
        chart.ctx.save();
        chart.ctx.shadowColor = isLight ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.45)";
        chart.ctx.shadowBlur = isLight ? 8 : 18;
        chart.ctx.shadowOffsetX = 0;
        chart.ctx.shadowOffsetY = 6;
      },
      afterDatasetsDraw(chart) { chart.ctx.restore(); }
    };

    const barEndLabelPlugin = {
      id: "barEndLabel",
      afterDatasetsDraw(chart) {
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data) return;
        ctx.save();
        ctx.font = '700 12px Inter, system-ui, -apple-system';
        meta.data.forEach((bar, i) => {
          const val = chart.data.datasets[0].data[i];
          const text = String(val);
          
          const barRight = bar.x; 
          const barLeft = bar.base;
          const barTop = bar.y - (bar.height/2);
          const barH = Math.max(12, bar.height - 4);
          const barWidthPx = Math.abs(barRight - barLeft);

          
          const padding = 6;
          const textW = ctx.measureText(text).width;
          const boxW = textW + padding*2;
          const boxH = 18;

          
          let boxX, textX, textY = bar.y + 4;
          if (barWidthPx > boxW + 12) {
            
            boxX = Math.min(barLeft, barRight) + barWidthPx - boxW - 6;
         
            boxX = Math.max(boxX, Math.min(barLeft, barRight) + 4);
          
            ctx.fillStyle = isLight ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.6)';
            roundRect(ctx, boxX, bar.y - (boxH/2) + 1, boxW, boxH, 6);
            ctx.fill();
            ctx.fillStyle = isLight ? '#052233' : '#ffffff';
            ctx.fillText(text, boxX + padding, textY);
          } else {
          
            boxX = Math.max(barLeft, barRight) + 8;
            ctx.fillStyle = isLight ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.6)';
            roundRect(ctx, boxX, bar.y - (boxH/2) + 1, boxW, boxH, 6);
            ctx.fill();
            ctx.fillStyle = isLight ? '#052233' : '#ffffff';
            ctx.fillText(text, boxX + padding, textY);
          }
        });
        ctx.restore();
      }
    };

    
    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    ganttChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: processes.map(p => p.pid),
        datasets: [{
          data: values,
          backgroundColor: palette.slice(0, processes.length),
          borderRadius: 12,
          borderSkipped: false,
          barThickness: 16,
          maxBarThickness: 32
        }]
      },
      options: {
        indexAxis: "y",
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: isLight ? "#ffffff" : "#0b1216",
            titleColor: isLight ? "#052233" : "#ffffff",
            bodyColor: isLight ? "#052233" : "#d8e6ff",
            borderColor: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.04)",
            borderWidth: 1,
            callbacks: { label: ctx => `${ctx.raw}` }
          }
       
        },
        scales: {
          x: { beginAtZero: true, grid: { color: isLight ? "rgba(10,20,30,0.06)" : "#2a3340" }, ticks: { color: isLight ? "#163245" : "#bfc9d9" } },
          y: { grid: { display: false }, ticks: { color: isLight ? "#163245" : "#cfe3ff", font: { weight: 700 } } }
        },
        responsive: false,
        maintainAspectRatio: false,
        animation: { duration: 260 }
      },
      plugins: [softShadowPlugin, barEndLabelPlugin]
    });
  }

 
  document.getElementById("addProcess").onclick = () => {
    if (processes.length >= 12) return alert("Max 12 processes allowed for demo");
    const pid = `P${processes.length + 1}`;
    let arrival;
    if (arrivalMode === "manual") {
      arrival = processes.length ? Math.max(...processes.map(p=>p.arrival)) + 1 : 0;
    } else if (arrivalMode === "random") arrival = Math.floor(Math.random()*4);
    else arrival = processes.length;
    processes.push({ pid, arrival, burst: 5 });
    renderProcesses(); renderResults(); renderGantt();
  };

  document.getElementById("runSim").onclick = () => {
    const alg = document.querySelector("input[name='alg']:checked")?.value || "FCFS";
    let q = parseInt(document.getElementById("quantum").value) || 1;
    if (alg === "PRIORITY") {
      for (let p of processes) {
        if (typeof p.priority === "undefined") {
          let input = prompt(`Enter priority for ${p.pid} (lower = higher priority):`, "1");
          p.priority = parseInt(input) || 1;
        }
      }
    }
    let result;
    if (alg === "FCFS") result = fcfs(processes);
    else if (alg === "SJF") result = sjf(processes);
    else if (alg === "SRTF") result = srtf(processes);
    else if (alg === "PRIORITY") result = priorityScheduling(processes);
    else result = roundRobin(processes, q);
    result.forEach((r,i)=> Object.assign(processes[i], r));
    const titles = { FCFS:"FCFS", SJF:"SJF", SRTF:"SRTF", PRIORITY:"Priority Scheduling", RR:`Round Robin (Q=${q})` };
    document.getElementById("resultTitle").innerText = `Results: ${titles[alg] || alg}`;
    renderProcesses(); renderResults(); renderGantt();
  };

  document.getElementById("clearAll").onclick = () => { processes = []; renderProcesses(); renderResults(); renderGantt(); };

  const arrivalSelect = document.getElementById("arrivalTime");
  if (arrivalSelect) {
    arrivalSelect.addEventListener("change", (e) => {
      arrivalMode = e.target.value;
      if (arrivalMode === "manual") processes.forEach((p,i)=> { if (p.arrival === undefined) p.arrival = i; });
      renderProcesses(); renderResults(); renderGantt();
    });
  }

  const toggle = document.getElementById("toggleLightmode");
  if (toggle) {
    toggle.checked = document.body.classList.contains("light-mode");
    toggle.addEventListener("change", function () {
      document.body.classList.toggle("light-mode", this.checked);
      renderGantt();
    });
  }

  document.querySelectorAll("input[name='alg']").forEach(radio => {
    radio.addEventListener("change", () => {
      const isRR = radio.value === "RR";
      document.querySelector(".quantum-label").style.display = isRR ? "" : "none";
      document.getElementById("quantum").style.display = isRR ? "" : "none";
      renderResults(); renderGantt();
    });
  });

  document.querySelector(".quantum-label").style.display = "none";
  document.getElementById("quantum").style.display = "none";

 
  renderProcesses(); renderResults(); renderGantt();
});
