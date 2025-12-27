import { RoutineItem } from '@/types';

interface CurrentTaskHighlightProps {
    currentTask: RoutineItem | null;
}

export function CurrentTaskHighlight({ currentTask }: CurrentTaskHighlightProps) {
    if (!currentTask) {
        return <div className="current-task-highlight" />;
    }

    return (
        <div className="current-task-highlight active">
            <div className="current-task-label">⏰ Current Focus</div>
            <div className="current-task-name">
                {currentTask.icon} {currentTask.task}
            </div>
            <div className="current-task-time">{currentTask.time}</div>
        </div>
    );
}
