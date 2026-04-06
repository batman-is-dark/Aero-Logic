from typing import List, Dict, Any, Set, Tuple
from task_library import Task, get_task, TASK_LIBRARY
import itertools

class TaskSequenceValidator:
    """Validates task sequences respect dependencies and constraints"""
    
    @staticmethod
    def is_valid_sequence(task_ids: List[str]) -> Tuple[bool, str]:
        """
        Check if a sequence respects all dependencies.
        Returns (is_valid, error_message)
        """
        completed: Set[str] = set()
        
        for task_id in task_ids:
            task = get_task(task_id)
            
            # Check if all blocked_by tasks are completed
            unmet_deps = task.blocked_by - completed
            if unmet_deps:
                return False, f"Task {task_id} requires {unmet_deps} to complete first"
            
            completed.add(task_id)
        
        return True, ""
    
    @staticmethod
    def get_critical_path_length(task_ids: List[str]) -> int:
        """
        Find the longest dependency chain (critical path).
        This determines minimum possible turnaround time.
        """
        memo = {}
        
        def longest_path_from(task_id: str) -> int:
            if task_id in memo:
                return memo[task_id]
            
            task = get_task(task_id)
            # Find tasks that depend on this one
            dependent_tasks = [t for t in task_ids if task_id in get_task(t).blocked_by]
            
            if not dependent_tasks:
                length = task.estimated_duration_max
            else:
                length = task.estimated_duration_max + max(longest_path_from(dt) for dt in dependent_tasks)
            
            memo[task_id] = length
            return length
        
        # Find the task that starts the critical path
        if not task_ids:
            return 0
        
        critical_length = max(longest_path_from(t) for t in task_ids)
        return critical_length


class TaskSequencer:
    """Generates task sequences based on strategy"""
    
    def __init__(self, task_ids: List[str]):
        self.task_ids = task_ids
        self.tasks = {tid: get_task(tid) for tid in task_ids}
        self.validator = TaskSequenceValidator()
    
    def generate_delay_minimizing_sequence(self) -> List[str]:
        """
        Aggressive parallel execution.
        Strategy: Start as many tasks as possible simultaneously.
        Prioritize non-parallelizable tasks first to free resources.
        """
        sequence = []
        completed: Set[str] = set()
        remaining: Set[str] = set(self.task_ids)
        
        while remaining:
            # Find all tasks ready to run (dependencies met)
            ready = []
            for task_id in remaining:
                task = self.tasks[task_id]
                if task.blocked_by.issubset(completed):
                    ready.append(task_id)
            
            if not ready:
                raise ValueError(f"Circular dependency detected in {remaining}")
            
            # For delay-minimizing: prioritize tasks that are NOT parallelizable
            # (finish them first to free up resources)
            ready.sort(key=lambda t: (self.tasks[t].can_parallelize, self.tasks[t].estimated_duration_max))
            
            sequence.extend(ready)
            completed.update(ready)
            remaining -= set(ready)
        
        return sequence
    
    def generate_fuel_minimizing_sequence(self) -> List[str]:
        """
        Strictly sequential execution.
        Strategy: Minimize APU usage by doing tasks one at a time.
        Prioritize non-APU tasks early.
        """
        sequence = []
        completed: Set[str] = set()
        remaining: Set[str] = set(self.task_ids)
        
        # Prioritize APU-dependent tasks late in sequence
        task_priority = {}
        for task_id in self.task_ids:
            task = self.tasks[task_id]
            # Lower score = higher priority (done first)
            task_priority[task_id] = (task.apu_dependent, task.estimated_duration_max)
        
        while remaining:
            ready = []
            for task_id in remaining:
                task = self.tasks[task_id]
                if task.blocked_by.issubset(completed):
                    ready.append(task_id)
            
            if not ready:
                raise ValueError(f"Circular dependency in {remaining}")
            
            # Sequential: pick ONE task at a time
            # Prefer non-APU tasks first
            ready.sort(key=lambda t: task_priority[t])
            chosen = ready[0]
            
            sequence.append(chosen)
            completed.add(chosen)
            remaining.remove(chosen)
        
        return sequence
    
    def generate_balanced_sequence(self) -> List[str]:
        """
        Selective parallel execution.
        Strategy: Balance APU usage with completion time.
        Group non-APU tasks together.
        """
        sequence = []
        completed: Set[str] = set()
        remaining: Set[str] = set(self.task_ids)
        
        while remaining:
            ready = []
            for task_id in remaining:
                task = self.tasks[task_id]
                if task.blocked_by.issubset(completed):
                    ready.append(task_id)
            
            if not ready:
                raise ValueError(f"Circular dependency in {remaining}")
            
            # Balanced: pick non-APU-dependent tasks first
            non_apu = [t for t in ready if not self.tasks[t].apu_dependent]
            apu_tasks = [t for t in ready if self.tasks[t].apu_dependent]
            
            if non_apu:
                # Add all non-APU-dependent tasks
                sequence.extend(sorted(non_apu, key=lambda t: self.tasks[t].estimated_duration_max))
                completed.update(non_apu)
                remaining -= set(non_apu)
            elif apu_tasks:
                # Add ONE APU task
                apu_tasks.sort(key=lambda t: self.tasks[t].estimated_duration_max, reverse=True)
                chosen = apu_tasks[0]
                sequence.append(chosen)
                completed.add(chosen)
                remaining.remove(chosen)
        
        return sequence
    
    def calculate_sequence_timeline(self, sequence: List[str]) -> List[Dict[str, Any]]:
        """
        Generate timeline with start/end times for a sequence.
        Respects parallelization rules.
        """
        timeline = []
        task_end_times = {}  # track when each task completes
        
        for task_id in sequence:
            task = self.tasks[task_id]
            
            # Calculate earliest start time based on dependencies
            earliest_start = 0
            for blocked_by_id in task.blocked_by:
                if blocked_by_id in task_end_times:
                    earliest_start = max(earliest_start, task_end_times[blocked_by_id])
            
            # Duration varies; use middle estimate
            duration = (task.estimated_duration_min + task.estimated_duration_max) // 2
            end_time = earliest_start + duration
            
            timeline.append({
                "task_id": task_id,
                "task_name": task.name,
                "start_minute": earliest_start,
                "end_minute": end_time,
                "duration_minutes": duration,
                "apu_required": task.apu_dependent,
            })
            
            task_end_times[task_id] = end_time
        
        return timeline
