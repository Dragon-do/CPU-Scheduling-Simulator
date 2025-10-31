from dataclasses import dataclass, field
from typing import Optional
@dataclass
class Process:
    pid: str
    arrival: int
    burst: int
    priority: int = 0
    remaining: int = field(init=False)
    start_time: Optional[int] = None
    completion_time: Optional[int] = None
    def __post_init__(self):
        self.remaining = self.burst
