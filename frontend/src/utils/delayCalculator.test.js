import { describe, it, expect } from 'vitest';
import {
  calculateDelayCascade,
  getDelaySeverity,
  getDelayIndicator,
} from './delayCalculator';

describe('delayCalculator', () => {
  // Test calculateDelayCascade function
  describe('calculateDelayCascade', () => {
    it('should return zero delays when no tasks have delays', () => {
      const taskTimeline = [
        { id: 'task1', start_minute: 0, end_minute: 10 },
        { id: 'task2', start_minute: 10, end_minute: 20 },
        { id: 'task3', start_minute: 20, end_minute: 30 },
      ];
      const taskDelays = {};

      const result = calculateDelayCascade(taskTimeline, taskDelays);

      expect(result.taskImpacts).toEqual({});
      expect(result.totalDelayMinutes).toBe(0);
      expect(result.cascadeChain).toEqual([]);
    });

    it('should calculate impact for a single delayed task with no downstream dependencies', () => {
      const taskTimeline = [
        { id: 'task1', start_minute: 0, end_minute: 10 },
        { id: 'task2', start_minute: 20, end_minute: 30 },
      ];
      const taskDelays = { task1: 5 };

      const result = calculateDelayCascade(taskTimeline, taskDelays);

      expect(result.taskImpacts.task1).toBe(5);
      expect(result.taskImpacts.task2).toBeUndefined();
      expect(result.totalDelayMinutes).toBe(5);
      expect(result.cascadeChain).toEqual([]);
    });

    it('should cascade delay to sequential task when end >= next.start', () => {
      const taskTimeline = [
        { id: 'task1', start_minute: 0, end_minute: 10 },
        { id: 'task2', start_minute: 10, end_minute: 20 },
      ];
      const taskDelays = { task1: 5 };

      const result = calculateDelayCascade(taskTimeline, taskDelays);

      expect(result.taskImpacts.task1).toBe(5);
      expect(result.taskImpacts.task2).toBe(5);
      expect(result.totalDelayMinutes).toBe(10);
      expect(result.cascadeChain).toHaveLength(1);
      expect(result.cascadeChain[0]).toEqual({
        source: 'task1',
        target: 'task2',
        delayMinutes: 5,
      });
    });

    it('should not cascade delay when tasks are parallel (end < next.start)', () => {
      const taskTimeline = [
        { id: 'task1', start_minute: 0, end_minute: 5 },
        { id: 'task2', start_minute: 15, end_minute: 25 },
      ];
      const taskDelays = { task1: 3 };

      const result = calculateDelayCascade(taskTimeline, taskDelays);

      expect(result.taskImpacts.task1).toBe(3);
      expect(result.taskImpacts.task2).toBeUndefined();
      expect(result.totalDelayMinutes).toBe(3);
      expect(result.cascadeChain).toEqual([]);
    });

    it('should cascade through multiple sequential tasks', () => {
      const taskTimeline = [
        { id: 'task1', start_minute: 0, end_minute: 10 },
        { id: 'task2', start_minute: 10, end_minute: 20 },
        { id: 'task3', start_minute: 20, end_minute: 30 },
      ];
      const taskDelays = { task1: 5 };

      const result = calculateDelayCascade(taskTimeline, taskDelays);

      expect(result.taskImpacts.task1).toBe(5);
      expect(result.taskImpacts.task2).toBe(5);
      expect(result.taskImpacts.task3).toBe(5);
      expect(result.totalDelayMinutes).toBe(15);
      expect(result.cascadeChain).toHaveLength(2);
      expect(result.cascadeChain[0]).toEqual({
        source: 'task1',
        target: 'task2',
        delayMinutes: 5,
      });
      expect(result.cascadeChain[1]).toEqual({
        source: 'task2',
        target: 'task3',
        delayMinutes: 5,
      });
    });

    it('should use maximum delay when task has multiple delay sources', () => {
      const taskTimeline = [
        { id: 'task1', start_minute: 0, end_minute: 10 },
        { id: 'task2', start_minute: 5, end_minute: 15 },
        { id: 'task3', start_minute: 15, end_minute: 25 },
      ];
      const taskDelays = { task1: 3, task2: 8 };

      const result = calculateDelayCascade(taskTimeline, taskDelays);

      // task3 gets max(5 from task1, 8 from task2) = 8
      expect(result.taskImpacts.task1).toBe(3);
      expect(result.taskImpacts.task2).toBe(8);
      expect(result.taskImpacts.task3).toBe(8);
      expect(result.totalDelayMinutes).toBe(19);
    });

    it('should handle mixed parallel and sequential tasks', () => {
      const taskTimeline = [
        { id: 'task1', start_minute: 0, end_minute: 10 },
        { id: 'task2', start_minute: 20, end_minute: 30 },
        { id: 'task3', start_minute: 30, end_minute: 40 },
      ];
      const taskDelays = { task1: 5, task2: 3 };

      const result = calculateDelayCascade(taskTimeline, taskDelays);

      expect(result.taskImpacts.task1).toBe(5);
      expect(result.taskImpacts.task2).toBe(3);
      expect(result.taskImpacts.task3).toBe(3); // cascaded from task2
      expect(result.totalDelayMinutes).toBe(11);
    });

    it('should handle delays with exact boundary conditions (end == next.start)', () => {
      const taskTimeline = [
        { id: 'task1', start_minute: 0, end_minute: 10 },
        { id: 'task2', start_minute: 10, end_minute: 20 },
      ];
      const taskDelays = { task1: 2 };

      const result = calculateDelayCascade(taskTimeline, taskDelays);

      // end_minute >= next.start_minute (10 >= 10) means cascade
      expect(result.taskImpacts.task2).toBe(2);
    });

    it('should return empty cascadeChain when no cascades occur', () => {
      const taskTimeline = [
        { id: 'task1', start_minute: 0, end_minute: 5 },
        { id: 'task2', start_minute: 15, end_minute: 25 },
      ];
      const taskDelays = { task1: 5 };

      const result = calculateDelayCascade(taskTimeline, taskDelays);

      expect(result.cascadeChain).toEqual([]);
    });

    it('should handle empty task timeline', () => {
      const taskTimeline = [];
      const taskDelays = {};

      const result = calculateDelayCascade(taskTimeline, taskDelays);

      expect(result.taskImpacts).toEqual({});
      expect(result.totalDelayMinutes).toBe(0);
      expect(result.cascadeChain).toEqual([]);
    });

    it('should handle undefined taskDelays parameter', () => {
      const taskTimeline = [
        { id: 'task1', start_minute: 0, end_minute: 10 },
      ];

      const result = calculateDelayCascade(taskTimeline);

      expect(result.taskImpacts).toEqual({});
      expect(result.totalDelayMinutes).toBe(0);
      expect(result.cascadeChain).toEqual([]);
    });

    it('should handle single task timeline with delay', () => {
      const taskTimeline = [
        { id: 'task1', start_minute: 0, end_minute: 10 },
      ];
      const taskDelays = { task1: 7 };

      const result = calculateDelayCascade(taskTimeline, taskDelays);

      expect(result.taskImpacts.task1).toBe(7);
      expect(result.totalDelayMinutes).toBe(7);
      expect(result.cascadeChain).toEqual([]);
    });

    it('should handle zero delay values', () => {
      const taskTimeline = [
        { id: 'task1', start_minute: 0, end_minute: 10 },
        { id: 'task2', start_minute: 10, end_minute: 20 },
      ];
      const taskDelays = { task1: 0 };

      const result = calculateDelayCascade(taskTimeline, taskDelays);

      expect(result.taskImpacts.task1).toBe(0);
      expect(result.taskImpacts.task2).toBeUndefined();
      expect(result.totalDelayMinutes).toBe(0);
    });

    it('should handle large cascade chains', () => {
      const taskTimeline = Array.from({ length: 10 }, (_, i) => ({
        id: `task${i + 1}`,
        start_minute: i * 10,
        end_minute: (i + 1) * 10,
      }));
      const taskDelays = { task1: 5 };

      const result = calculateDelayCascade(taskTimeline, taskDelays);

      // All tasks should be impacted with 5 minute delay
      for (let i = 1; i <= 10; i++) {
        expect(result.taskImpacts[`task${i}`]).toBe(5);
      }
      expect(result.cascadeChain).toHaveLength(9);
      expect(result.totalDelayMinutes).toBe(50);
    });

    it('should handle complex scenario with multiple delays and cascades', () => {
      const taskTimeline = [
        { id: 'task1', start_minute: 0, end_minute: 10 },
        { id: 'task2', start_minute: 10, end_minute: 20 },
        { id: 'task3', start_minute: 25, end_minute: 35 },
        { id: 'task4', start_minute: 35, end_minute: 45 },
      ];
      const taskDelays = { task1: 3, task3: 7 };

      const result = calculateDelayCascade(taskTimeline, taskDelays);

      expect(result.taskImpacts.task1).toBe(3);
      expect(result.taskImpacts.task2).toBe(3);
      expect(result.taskImpacts.task3).toBe(7);
      expect(result.taskImpacts.task4).toBe(7);
      expect(result.totalDelayMinutes).toBe(20);
    });
  });

  // Test getDelaySeverity function
  describe('getDelaySeverity', () => {
    it('should return "on-time" for 0 delay', () => {
      expect(getDelaySeverity(0)).toBe('on-time');
    });

    it('should return "on-time" for negative delay', () => {
      expect(getDelaySeverity(-5)).toBe('on-time');
    });

    it('should return "slight-delay" for 1 minute delay', () => {
      expect(getDelaySeverity(1)).toBe('slight-delay');
    });

    it('should return "slight-delay" for 5 minute delay (upper boundary)', () => {
      expect(getDelaySeverity(5)).toBe('slight-delay');
    });

    it('should return "significant-delay" for 6 minute delay', () => {
      expect(getDelaySeverity(6)).toBe('significant-delay');
    });

    it('should return "significant-delay" for 100 minute delay', () => {
      expect(getDelaySeverity(100)).toBe('significant-delay');
    });

    it('should return "significant-delay" for very large delays', () => {
      expect(getDelaySeverity(999)).toBe('significant-delay');
    });

    it('should handle decimal values correctly', () => {
      expect(getDelaySeverity(2.5)).toBe('slight-delay');
      expect(getDelaySeverity(5.5)).toBe('significant-delay');
    });
  });

  // Test getDelayIndicator function
  describe('getDelayIndicator', () => {
    it('should return on-time indicator for 0 delay', () => {
      const indicator = getDelayIndicator(0);
      expect(indicator).toHaveProperty('emoji');
      expect(indicator).toHaveProperty('color');
      expect(indicator).toHaveProperty('label');
      expect(indicator).toHaveProperty('abbreviation');
      expect(indicator.label).toBe('on-time');
    });

    it('should return slight-delay indicator for 3 minute delay', () => {
      const indicator = getDelayIndicator(3);
      expect(indicator.label).toBe('slight-delay');
      expect(indicator).toHaveProperty('emoji');
      expect(indicator).toHaveProperty('color');
      expect(indicator).toHaveProperty('abbreviation');
    });

    it('should return significant-delay indicator for 10 minute delay', () => {
      const indicator = getDelayIndicator(10);
      expect(indicator.label).toBe('significant-delay');
      expect(indicator).toHaveProperty('emoji');
      expect(indicator).toHaveProperty('color');
      expect(indicator).toHaveProperty('abbreviation');
    });

    it('should have consistent emoji values', () => {
      const onTime = getDelayIndicator(0);
      const slightDelay = getDelayIndicator(2);
      const significantDelay = getDelayIndicator(10);

      expect(onTime.emoji).toBeDefined();
      expect(slightDelay.emoji).toBeDefined();
      expect(significantDelay.emoji).toBeDefined();
      expect(typeof onTime.emoji).toBe('string');
      expect(typeof slightDelay.emoji).toBe('string');
      expect(typeof significantDelay.emoji).toBe('string');
    });

    it('should have consistent color values', () => {
      const onTime = getDelayIndicator(0);
      const slightDelay = getDelayIndicator(2);
      const significantDelay = getDelayIndicator(10);

      expect(onTime.color).toBeDefined();
      expect(slightDelay.color).toBeDefined();
      expect(significantDelay.color).toBeDefined();
      expect(typeof onTime.color).toBe('string');
      expect(typeof slightDelay.color).toBe('string');
      expect(typeof significantDelay.color).toBe('string');
    });

    it('should have consistent abbreviation values', () => {
      const onTime = getDelayIndicator(0);
      const slightDelay = getDelayIndicator(2);
      const significantDelay = getDelayIndicator(10);

      expect(onTime.abbreviation).toBeDefined();
      expect(slightDelay.abbreviation).toBeDefined();
      expect(significantDelay.abbreviation).toBeDefined();
      expect(typeof onTime.abbreviation).toBe('string');
      expect(typeof slightDelay.abbreviation).toBe('string');
      expect(typeof significantDelay.abbreviation).toBe('string');
    });

    it('should have different indicators for different severity levels', () => {
      const onTime = getDelayIndicator(0);
      const slightDelay = getDelayIndicator(2);
      const significantDelay = getDelayIndicator(10);

      expect(onTime.emoji).not.toBe(slightDelay.emoji);
      expect(slightDelay.emoji).not.toBe(significantDelay.emoji);
      expect(onTime.color).not.toBe(slightDelay.color);
      expect(slightDelay.color).not.toBe(significantDelay.color);
    });

    it('should return consistent indicator for same severity', () => {
      const indicator1 = getDelayIndicator(2);
      const indicator2 = getDelayIndicator(3);

      expect(indicator1.label).toBe(indicator2.label);
      expect(indicator1.emoji).toBe(indicator2.emoji);
      expect(indicator1.color).toBe(indicator2.color);
      expect(indicator1.abbreviation).toBe(indicator2.abbreviation);
    });
  });

  // Edge cases and integration
  describe('edge cases and integration', () => {
    it('should handle task IDs that do not exist in taskDelays', () => {
      const taskTimeline = [
        { id: 'task1', start_minute: 0, end_minute: 10 },
        { id: 'task2', start_minute: 10, end_minute: 20 },
      ];
      const taskDelays = { task3: 5 }; // task3 doesn't exist in timeline

      const result = calculateDelayCascade(taskTimeline, taskDelays);

      expect(result.taskImpacts).toEqual({});
      expect(result.totalDelayMinutes).toBe(0);
    });

    it('should ignore zero delays in cascade', () => {
      const taskTimeline = [
        { id: 'task1', start_minute: 0, end_minute: 10 },
        { id: 'task2', start_minute: 10, end_minute: 20 },
      ];
      const taskDelays = { task1: 0 };

      const result = calculateDelayCascade(taskTimeline, taskDelays);

      expect(result.cascadeChain).toEqual([]);
    });

    it('should correctly cascade multiple independent delay sources', () => {
      const taskTimeline = [
        { id: 'task1', start_minute: 0, end_minute: 10 },
        { id: 'task2', start_minute: 0, end_minute: 10 },
        { id: 'task3', start_minute: 10, end_minute: 20 },
      ];
      const taskDelays = { task1: 2, task2: 3 };

      const result = calculateDelayCascade(taskTimeline, taskDelays);

      // task3 gets max(2, 3) = 3
      expect(result.taskImpacts.task3).toBe(3);
      expect(result.cascadeChain).toHaveLength(2);
    });
  });
});
