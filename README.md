![image alt](https://raw.githubusercontent.com/Dragon-do/CPU-Scheduling-Simulator/7b0a7c472283dcf289dddc9304c5bd9d830d3c15/git.png)

# CPU-Scheduling-Simulator
We as a group of 2nd year B-Tech Students made a CPU Scheduling Simulator for our Operating System Project to showcase our skills in the particular domain.

## Introduction
    
Effective Central Processing Unit (CPU) management is essential for optimum system 
responsiveness, throughput, and performance in contemporary operating systems. CPU 
scheduling has a direct impact on important performance indicators like system fairness, 
waiting time, and response time. The goal of this project, the CPU Scheduling Simulator, 
is to model and assess the behaviour of different CPU scheduling algorithms in an engaging 
and instructive setting. The simulator gives users useful, hands-on insight by letting them 
define processes and see how scheduling strategies like FCFS, Round Robin, and Priority 
Scheduling distribute the CPU. The goal of the tool is to close the knowledge gap between 
abstract theoretical concepts and the practical performance effects of various resource 
management strategies. 


## Project Overview

The CPU Scheduling Simulator is a Python-based educational tool designed to visualize and analyze how different CPU scheduling algorithms manage process execution. The simulator demonstrates how an operating system decides which process gets CPU time and allows users to compare various algorithms based on real scheduling metrics like Waiting Time, Turnaround Time, and Throughput.

This project aims to make learning CPU scheduling concepts easier and more interactive for students and researchers.

## System Design
The simulator is divided into three main modules:

1) Input Module: Accepts process details (Arrival Time, Burst Time, Priority).

2) Algorithm Module: Runs selected CPU scheduling algorithms.

3) Output Module: Displays Gantt charts, tabular results, and comparative metrics.

This modular architecture ensures readability, scalability, and easy maintenance.

## TO RUN THE PROJECT

CLONE THE REPOSITORY

```bash
git clone https://github.com/Dragon-do/CPU-Scheduling-Simulator.git
cd CPU-Scheduling-Simulator
```
## Features

Fully implemented CPU scheduling algorithms:

° FCFS

° SJF (Non-Preemptive)

° SRTF (Preemptive)

° Round Robin

° Priority Scheduling

Generates:

° Gantt charts

° Comparison tables

° Performance metrics

° Modular, extendable architecture

° Beginner-friendly and educational


##  Algorithms Implemented

This simulator includes five widely used CPU scheduling algorithms. Each algorithm simulates process execution, generates a Gantt chart, and calculates key metrics such as Waiting Time, Turnaround Time, Response Time, and Throughput.

| Algorithm | Type | Description |
|----------|------|-------------|
| **FCFS (First Come First Serve)** | Non-Preemptive | Processes are scheduled based on arrival time. Simple and fair but may lead to convoy effect. |
| **SJF (Shortest Job First)** | Non-Preemptive | The process with the shortest burst time is executed first. Provides optimal average waiting time for non-preemptive scheduling. |
| **SRTF (Shortest Remaining Time First)** | Preemptive | Dynamic form of SJF. If a new process arrives with a shorter burst time, it preempts the current process. |
| **Round Robin (RR)** | Preemptive (Time-Quantum Based) | Each process receives a fixed time slice in cyclic order, making it suitable for time-sharing systems. |
| **Priority Scheduling** | Preemptive | Processes are executed based on priority value. Higher priority processes may preempt lower priority ones. |

## User Interface Design

![image alt](https://github.com/Dragon-do/CPU-Scheduling-Simulator/blob/main/os.jpg?raw=true)

## Learning Outcomes

1) Deepened understanding of CPU scheduling mechanisms.

2) Improved knowledge of process management and OS performance metrics.

3) Practical experience in Python programming, data visualization, and modular system design.

4) Enhanced teamwork and documentation skills for collaborative projects.

## Acknowledgment

This project was successfully completed under the mentorship of Prof. Shantanu Agnihotri, whose guidance helped us understand and implement CPU scheduling algorithms both theoretically and practically.
##  Use Cases

- Operating System courses and labs
- Visualization tool for scheduling research
- Academic demonstrations and viva presentations
- Basis for extending to:
  - Multilevel Queue Scheduling
  - Real-Time Scheduling (EDF, RMS)



