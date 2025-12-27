interface SmartReminderProps {
    status: 'on-track' | 'needs-focus' | 'hidden';
}

export function SmartReminder({ status }: SmartReminderProps) {
    if (status === 'hidden') {
        return <div className="smart-reminder" style={{ display: 'none' }} />;
    }

    const className = `smart-reminder ${status === 'on-track' ? 'on-track' : 'needs-focus'}`;
    const text = status === 'on-track' ? '✓ On Track' : '⚠ Needs Focus';

    return (
        <div className={className}>
            {text}
        </div>
    );
}
