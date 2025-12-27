import { RoutineItem } from '@/types';

interface ScheduleItemProps {
    item: RoutineItem;
    isCurrent: boolean;
}

export function ScheduleItem({ item, isCurrent }: ScheduleItemProps) {
    const className = `schedule-item ${item.type} ${isCurrent ? 'current-task' : ''}`;

    return (
        <div className={className} data-time={item.time}>
            <span className="time">{item.time}</span>
            <span className="task">
                <span className="task-icon">{item.icon}</span>
                {item.task}
            </span>
        </div>
    );
}
