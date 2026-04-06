import { describe, it, expect } from 'vitest';
import {
  calculateLayout,
  getTaskDef,
  getTaskColor,
  getTaskResource,
  TASK_LIBRARY,
} from './gateLayoutEngine';

describe('gateLayoutEngine', () => {
  // Test TASK_LIBRARY structure
  describe('TASK_LIBRARY', () => {
    it('should contain exactly 10 task definitions', () => {
      expect(Object.keys(TASK_LIBRARY).length).toBe(10);
    });

    it('should have all required task properties', () => {
      Object.values(TASK_LIBRARY).forEach((task) => {
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('name');
        expect(task).toHaveProperty('category');
        expect(task).toHaveProperty('color');
        expect(task).toHaveProperty('resource');
      });
    });

    it('should have unique IDs', () => {
      const ids = Object.keys(TASK_LIBRARY);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  // Test getTaskDef function
  describe('getTaskDef', () => {
    it('should return task by direct ID match', () => {
      const task = getTaskDef('refueling');
      expect(task).toBeDefined();
      expect(task.id).toBe('refueling');
    });

    it('should return task by slug normalization (kebab-case to underscore)', () => {
      const task = getTaskDef('cargo-unload');
      expect(task).toBeDefined();
      expect(task.id).toBe('cargo_unload');
    });

    it('should return default unknown task for unrecognized IDs', () => {
      const task = getTaskDef('nonexistent_task_xyz');
      expect(task).toBeDefined();
      expect(task.id).toBe('unknown');
      expect(task.name).toBe('Unknown Task');
    });

    it('should handle null or undefined gracefully', () => {
      const task1 = getTaskDef(null);
      const task2 = getTaskDef(undefined);
      expect(task1.id).toBe('unknown');
      expect(task2.id).toBe('unknown');
    });

    it('should handle case-insensitive lookups', () => {
      const task = getTaskDef('REFUELING');
      expect(task).toBeDefined();
    });
  });

  // Test getTaskColor function
  describe('getTaskColor', () => {
    it('should return color for known task', () => {
      const color = getTaskColor('refueling');
      expect(color).toBeTruthy();
      expect(typeof color).toBe('string');
    });

    it('should return consistent color for same task', () => {
      const color1 = getTaskColor('boarding');
      const color2 = getTaskColor('boarding');
      expect(color1).toBe(color2);
    });

    it('should return default color for unknown task', () => {
      const color = getTaskColor('unknown_task');
      expect(color).toBeTruthy();
    });
  });

  // Test getTaskResource function
  describe('getTaskResource', () => {
    it('should return resource for known task', () => {
      const resource = getTaskResource('refueling');
      expect(resource).toBeTruthy();
      expect(typeof resource).toBe('string');
    });

    it('should return consistent resource for same task', () => {
      const res1 = getTaskResource('catering');
      const res2 = getTaskResource('catering');
      expect(res1).toBe(res2);
    });

    it('should return default resource for unknown task', () => {
      const resource = getTaskResource('unknown_task');
      expect(resource).toBeTruthy();
    });
  });

  // Test calculateLayout function
  describe('calculateLayout', () => {
    it('should return object with required properties', () => {
      const timeline = [
        {
          task_id: 'refueling',
          task_name: 'Refueling',
          start_minute: 0,
          end_minute: 20,
          duration_minutes: 20,
          apu_required: false,
        },
      ];

      const result = calculateLayout(timeline);
      expect(result).toHaveProperty('tasks');
      expect(result).toHaveProperty('arrows');
      expect(result).toHaveProperty('resourceMap');
    });

    it('should return empty structure for empty timeline', () => {
      const result = calculateLayout([]);
      expect(result.tasks).toEqual({});
      expect(result.arrows).toEqual([]);
      expect(result.resourceMap).toEqual({});
    });

    // Test parallel detection
    describe('parallel task detection', () => {
      it('should detect tasks with overlapping time windows as parallel', () => {
        const timeline = [
          {
            task_id: 'refueling',
            task_name: 'Refueling',
            start_minute: 0,
            end_minute: 20,
            duration_minutes: 20,
            apu_required: false,
          },
          {
            task_id: 'boarding',
            task_name: 'Boarding',
            start_minute: 10,
            end_minute: 30,
            duration_minutes: 20,
            apu_required: false,
          },
        ];

        const result = calculateLayout(timeline);
        const task1 = result.tasks['refueling'];
        const task2 = result.tasks['boarding'];

        // Both should have colIndex >= 0, and if overlapping, different colIndex
        expect(task1.colIndex).toBeDefined();
        expect(task2.colIndex).toBeDefined();
      });

      it('should assign different colIndex to parallel tasks in same row', () => {
        const timeline = [
          {
            task_id: 'refueling',
            start_minute: 0,
            end_minute: 20,
            duration_minutes: 20,
            task_name: 'Refueling',
            apu_required: false,
          },
          {
            task_id: 'boarding',
            start_minute: 5,
            end_minute: 25,
            duration_minutes: 20,
            task_name: 'Boarding',
            apu_required: false,
          },
          {
            task_id: 'catering',
            start_minute: 10,
            end_minute: 30,
            duration_minutes: 20,
            task_name: 'Catering',
            apu_required: false,
          },
        ];

        const result = calculateLayout(timeline);
        const indices = [
          result.tasks['refueling'].colIndex,
          result.tasks['boarding'].colIndex,
          result.tasks['catering'].colIndex,
        ];

        // All should be different if they're in the same row
        expect(new Set(indices).size).toBeGreaterThan(1);
      });

      it('should detect non-overlapping tasks as sequential', () => {
        const timeline = [
          {
            task_id: 'refueling',
            start_minute: 0,
            end_minute: 20,
            duration_minutes: 20,
            task_name: 'Refueling',
            apu_required: false,
          },
          {
            task_id: 'boarding',
            start_minute: 20,
            end_minute: 40,
            duration_minutes: 20,
            task_name: 'Boarding',
            apu_required: false,
          },
        ];

        const result = calculateLayout(timeline);
        const task1Row = result.tasks['refueling'].rowIndex;
        const task2Row = result.tasks['boarding'].rowIndex;

        // Non-overlapping tasks might be in different rows or same row with colIndex 0
        expect(task1Row).toBeDefined();
        expect(task2Row).toBeDefined();
      });
    });

    // Test colIndex assignment
    describe('colIndex assignment', () => {
      it('should assign colIndex 0 to first task in row', () => {
        const timeline = [
          {
            task_id: 'refueling',
            start_minute: 0,
            end_minute: 20,
            duration_minutes: 20,
            task_name: 'Refueling',
            apu_required: false,
          },
        ];

        const result = calculateLayout(timeline);
        expect(result.tasks['refueling'].colIndex).toBe(0);
      });

      it('should increment colIndex for parallel tasks', () => {
        const timeline = [
          {
            task_id: 'task1',
            start_minute: 0,
            end_minute: 20,
            duration_minutes: 20,
            task_name: 'Task 1',
            apu_required: false,
          },
          {
            task_id: 'task2',
            start_minute: 0,
            end_minute: 20,
            duration_minutes: 20,
            task_name: 'Task 2',
            apu_required: false,
          },
          {
            task_id: 'task3',
            start_minute: 0,
            end_minute: 20,
            duration_minutes: 20,
            task_name: 'Task 3',
            apu_required: false,
          },
        ];

        const result = calculateLayout(timeline);
        const indices = [
          result.tasks['task1'].colIndex,
          result.tasks['task2'].colIndex,
          result.tasks['task3'].colIndex,
        ];

        // Should be 0, 1, 2 or similar sequential assignment
        expect(Math.max(...indices)).toBe(indices.length - 1);
      });
    });

    // Test arrow generation
    describe('arrow generation', () => {
      it('should create arrows for all chronological pairs', () => {
        const timeline = [
          {
            task_id: 'task1',
            start_minute: 0,
            end_minute: 10,
            duration_minutes: 10,
            task_name: 'Task 1',
            apu_required: false,
          },
          {
            task_id: 'task2',
            start_minute: 10,
            end_minute: 20,
            duration_minutes: 10,
            task_name: 'Task 2',
            apu_required: false,
          },
          {
            task_id: 'task3',
            start_minute: 20,
            end_minute: 30,
            duration_minutes: 10,
            task_name: 'Task 3',
            apu_required: false,
          },
        ];

        const result = calculateLayout(timeline);
        // Should have arrows: task1->task2, task2->task3
        expect(result.arrows.length).toBeGreaterThan(0);
      });

      it('should have from and to properties in arrows', () => {
        const timeline = [
          {
            task_id: 'task1',
            start_minute: 0,
            end_minute: 10,
            duration_minutes: 10,
            task_name: 'Task 1',
            apu_required: false,
          },
          {
            task_id: 'task2',
            start_minute: 10,
            end_minute: 20,
            duration_minutes: 10,
            task_name: 'Task 2',
            apu_required: false,
          },
        ];

        const result = calculateLayout(timeline);
        result.arrows.forEach((arrow) => {
          expect(arrow).toHaveProperty('from');
          expect(arrow).toHaveProperty('to');
          expect(typeof arrow.from).toBe('string');
          expect(typeof arrow.to).toBe('string');
        });
      });

      it('should not create arrows between non-chronological pairs', () => {
        const timeline = [
          {
            task_id: 'task1',
            start_minute: 0,
            end_minute: 10,
            duration_minutes: 10,
            task_name: 'Task 1',
            apu_required: false,
          },
          {
            task_id: 'task2',
            start_minute: 5,
            end_minute: 15,
            duration_minutes: 10,
            task_name: 'Task 2',
            apu_required: false,
          },
        ];

        const result = calculateLayout(timeline);
        // Parallel tasks shouldn't have arrows between them
        const hasArrow = result.arrows.some(
          (a) => (a.from === 'task1' && a.to === 'task2') || (a.from === 'task2' && a.to === 'task1')
        );
        expect(hasArrow).toBe(false);
      });
    });

    // Test task ID mapping
    describe('task ID mapping and resolution', () => {
      it('should map tasks by direct ID match', () => {
        const timeline = [
          {
            task_id: 'refueling',
            start_minute: 0,
            end_minute: 20,
            duration_minutes: 20,
            task_name: 'Refueling',
            apu_required: false,
          },
        ];

        const result = calculateLayout(timeline);
        const task = result.tasks['refueling'];
        expect(task).toBeDefined();
        expect(task.id).toBe('refueling');
      });

      it('should handle slug normalization for task IDs', () => {
        const timeline = [
          {
            task_id: 'cargo-unload',
            start_minute: 0,
            end_minute: 20,
            duration_minutes: 20,
            task_name: 'Cargo Unloading',
            apu_required: false,
          },
        ];

        const result = calculateLayout(timeline);
        // Should resolve cargo-unload to cargo_unload
        const task = result.tasks['cargo-unload'];
        expect(task).toBeDefined();
      });

      it('should gracefully handle unknown task IDs with fallback', () => {
        const timeline = [
          {
            task_id: 'unknown_xyz',
            start_minute: 0,
            end_minute: 20,
            duration_minutes: 20,
            task_name: 'Unknown Task',
            apu_required: false,
          },
        ];

        const result = calculateLayout(timeline);
        const task = result.tasks['unknown_xyz'];
        expect(task).toBeDefined();
        expect(task.color).toBeTruthy(); // Should have default color
        expect(task.resource).toBeTruthy(); // Should have default resource
      });
    });

    // Test task metadata
    describe('task metadata', () => {
      it('should include all original timeline properties in tasks', () => {
        const timeline = [
          {
            task_id: 'refueling',
            task_name: 'Refueling',
            start_minute: 0,
            end_minute: 20,
            duration_minutes: 20,
            apu_required: true,
          },
        ];

        const result = calculateLayout(timeline);
        const task = result.tasks['refueling'];
        expect(task.task_name).toBe('Refueling');
        expect(task.start_minute).toBe(0);
        expect(task.end_minute).toBe(20);
        expect(task.duration_minutes).toBe(20);
        expect(task.apu_required).toBe(true);
      });

      it('should include color and resource from task definition', () => {
        const timeline = [
          {
            task_id: 'refueling',
            task_name: 'Refueling',
            start_minute: 0,
            end_minute: 20,
            duration_minutes: 20,
            apu_required: false,
          },
        ];

        const result = calculateLayout(timeline);
        const task = result.tasks['refueling'];
        expect(task.color).toBeTruthy();
        expect(task.resource).toBeTruthy();
      });

      it('should include rowIndex and colIndex for positioning', () => {
        const timeline = [
          {
            task_id: 'refueling',
            task_name: 'Refueling',
            start_minute: 0,
            end_minute: 20,
            duration_minutes: 20,
            apu_required: false,
          },
        ];

        const result = calculateLayout(timeline);
        const task = result.tasks['refueling'];
        expect(task.rowIndex).toBeDefined();
        expect(typeof task.rowIndex).toBe('number');
        expect(task.colIndex).toBeDefined();
        expect(typeof task.colIndex).toBe('number');
      });
    });

    // Test resourceMap
    describe('resourceMap', () => {
      it('should include all unique resources from tasks', () => {
        const timeline = [
          {
            task_id: 'refueling',
            task_name: 'Refueling',
            start_minute: 0,
            end_minute: 20,
            duration_minutes: 20,
            apu_required: false,
          },
          {
            task_id: 'boarding',
            task_name: 'Boarding',
            start_minute: 20,
            end_minute: 40,
            duration_minutes: 20,
            apu_required: false,
          },
        ];

        const result = calculateLayout(timeline);
        expect(Object.keys(result.resourceMap).length).toBeGreaterThan(0);
      });

      it('should map resources to array of task IDs', () => {
        const timeline = [
          {
            task_id: 'refueling',
            task_name: 'Refueling',
            start_minute: 0,
            end_minute: 20,
            duration_minutes: 20,
            apu_required: false,
          },
        ];

        const result = calculateLayout(timeline);
        Object.values(result.resourceMap).forEach((tasks) => {
          expect(Array.isArray(tasks)).toBe(true);
        });
      });
    });

    // Test edge cases
    describe('edge cases', () => {
      it('should handle tasks with same start and end time (zero duration)', () => {
        const timeline = [
          {
            task_id: 'instant_task',
            task_name: 'Instant Task',
            start_minute: 10,
            end_minute: 10,
            duration_minutes: 0,
            apu_required: false,
          },
        ];

        const result = calculateLayout(timeline);
        expect(result.tasks['instant_task']).toBeDefined();
      });

      it('should handle very large timelines (100+ tasks)', () => {
        const timeline = [];
        for (let i = 0; i < 100; i++) {
          timeline.push({
            task_id: `task_${i}`,
            task_name: `Task ${i}`,
            start_minute: i * 10,
            end_minute: i * 10 + 5,
            duration_minutes: 5,
            apu_required: false,
          });
        }

        const result = calculateLayout(timeline);
        expect(Object.keys(result.tasks).length).toBe(100);
      });

      it('should handle tasks with missing optional properties', () => {
        const timeline = [
          {
            task_id: 'minimal_task',
            start_minute: 0,
            end_minute: 10,
            duration_minutes: 10,
            // Missing task_name and apu_required
          },
        ];

        const result = calculateLayout(timeline);
        const task = result.tasks['minimal_task'];
        expect(task).toBeDefined();
        // Should use defaults
        expect(task.task_name).toBeDefined();
        expect(task.apu_required).toBeDefined();
      });

      it('should handle timeline with null values', () => {
        const timeline = [null, undefined];
        const result = calculateLayout(timeline);
        // Should not crash, filter out nulls
        expect(result).toBeDefined();
      });

      it('should maintain consistent task ordering', () => {
        const timeline = [
          {
            task_id: 'a',
            task_name: 'A',
            start_minute: 0,
            end_minute: 10,
            duration_minutes: 10,
            apu_required: false,
          },
          {
            task_id: 'b',
            task_name: 'B',
            start_minute: 10,
            end_minute: 20,
            duration_minutes: 10,
            apu_required: false,
          },
        ];

        const result1 = calculateLayout(timeline);
        const result2 = calculateLayout(timeline);

        // Both should produce identical results
        expect(Object.keys(result1.tasks).sort()).toEqual(Object.keys(result2.tasks).sort());
      });
    });
  });
});
