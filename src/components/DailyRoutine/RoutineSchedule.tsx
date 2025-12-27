import { useEffect, useRef } from 'react';
import { RoutineItem, ScheduleType } from '@/types';
import { ScheduleItem } from './ScheduleItem';

interface RoutineScheduleProps {
    scheduleType: ScheduleType;
    items: RoutineItem[];
    isActive: boolean;
    currentTask: RoutineItem | null;
}

export function RoutineSchedule({ scheduleType, items, isActive, currentTask }: RoutineScheduleProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Scroll to current task when active
    useEffect(() => {
        if (isActive && currentTask && containerRef.current) {
            const currentElement = containerRef.current.querySelector('.current-task');
            if (currentElement) {
                currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [isActive, currentTask]);

    return (
        <div
            ref={containerRef}
            id={`${scheduleType}-schedule`}
            className={`routine-schedule ${isActive ? 'active' : ''}`}
        >
            {items.map((item, index) => (
                <ScheduleItem
                    key={`${scheduleType}-${index}`}
                    item={item}
                    isCurrent={currentTask?.time === item.time}
                />
            ))}
        </div>
    );
}
