#!/usr/bin/env python
from task_sequencer import TaskSequencer

sample_tasks = ['refueling', 'boarding', 'cleaning', 'catering', 'cargo_unload']
seq = TaskSequencer(sample_tasks)

delay_seq = seq.generate_delay_minimizing_sequence()
fuel_seq = seq.generate_fuel_minimizing_sequence()
balanced_seq = seq.generate_balanced_sequence()

print('Delay-minimizing:', delay_seq)
print('Fuel-minimizing:', fuel_seq)
print('Balanced:', balanced_seq)

print('\nTimeline for balanced:')
timeline = seq.calculate_sequence_timeline(balanced_seq)
for item in timeline:
    apu_str = 'YES' if item['apu_required'] else 'NO'
    print(f"  {item['task_name']}: {item['start_minute']}-{item['end_minute']} min (APU: {apu_str})")
