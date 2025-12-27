import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useDayGroups, DEFAULT_CONFIGS } from '@/hooks';
import { DayGroup, ScheduleType } from '@/types';

interface DayGroupConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DayGroupConfigModal({ isOpen, onClose }: DayGroupConfigModalProps) {
    const { dayGroups, usePreset, setDayGroups } = useDayGroups();
    const [customGroups, setCustomGroups] = useState<DayGroup[]>(dayGroups);

    // Sync customGroups with dayGroups when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setCustomGroups(dayGroups);
        }
    }, [isOpen, dayGroups]);

    if (!isOpen) return null;

    const allDays: ScheduleType[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels: Record<ScheduleType, string> = {
        monday: 'Mon',
        tuesday: 'Tue',
        wednesday: 'Wed',
        thursday: 'Thu',
        friday: 'Fri',
        saturday: 'Sat',
        sunday: 'Sun'
    };

    const handlePreset = (preset: keyof typeof DEFAULT_CONFIGS) => {
        usePreset(preset);
        setCustomGroups(DEFAULT_CONFIGS[preset].groups);
        toast.success('Preset applied!', { icon: '✅' });
    };

    const handleAddGroup = () => {
        const newGroup: DayGroup = {
            id: `group_${Date.now()}`,
            label: 'New Group',
            days: []
        };
        setCustomGroups([...customGroups, newGroup]);
    };

    const handleRemoveGroup = (groupId: string) => {
        setCustomGroups(customGroups.filter(g => g.id !== groupId));
    };

    const handleGroupLabelChange = (groupId: string, label: string) => {
        setCustomGroups(customGroups.map(g =>
            g.id === groupId ? { ...g, label } : g
        ));
    };

    const handleToggleDay = (groupId: string, day: ScheduleType) => {
        setCustomGroups(customGroups.map(g => {
            if (g.id === groupId) {
                const days = g.days.includes(day)
                    ? g.days.filter(d => d !== day)
                    : [...g.days, day];
                return { ...g, days };
            }
            // Remove day from other groups
            return { ...g, days: g.days.filter(d => d !== day) };
        }));
    };

    const handleSave = () => {
        // Validate that all days are assigned
        const assignedDays = new Set(customGroups.flatMap(g => g.days));
        const missingDays = allDays.filter(d => !assignedDays.has(d));

        if (missingDays.length > 0) {
            toast.error(`Please assign all days. Missing: ${missingDays.map(d => dayLabels[d]).join(', ')}`, {
                duration: 4000
            });
            return;
        }

        // Remove empty groups
        const validGroups = customGroups.filter(g => g.days.length > 0);

        if (validGroups.length === 0) {
            toast.error('At least one group is required!');
            return;
        }

        setDayGroups({ groups: validGroups });
        toast.success('Day groups updated!', { icon: '✅' });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content day-group-config-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Configure Day Groups</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="preset-section">
                        <h3>Quick Presets</h3>
                        <div className="preset-buttons-row">
                            <button
                                className="preset-option"
                                onClick={() => handlePreset('individual')}
                            >
                                <div className="preset-label">7 Individual Days</div>
                                <div className="preset-description">Mon, Tue, Wed, Thu, Fri, Sat, Sun</div>
                            </button>
                            <button
                                className="preset-option"
                                onClick={() => handlePreset('weekdayWeekend')}
                            >
                                <div className="preset-label">Weekday + Weekend</div>
                                <div className="preset-description">Mon-Fri, Sat, Sun</div>
                            </button>
                            <button
                                className="preset-option"
                                onClick={() => handlePreset('simplified')}
                            >
                                <div className="preset-label">Simplified</div>
                                <div className="preset-description">Weekdays, Weekend</div>
                            </button>
                        </div>
                    </div>

                    <div className="custom-groups-container">
                        <div className="custom-groups-header">
                            <h3>Custom Groups</h3>
                            <button className="add-group-button" onClick={handleAddGroup}>
                                + Add Group
                            </button>
                        </div>

                        <div className="custom-groups-list">
                            {customGroups.map((group) => (
                                <div key={group.id} className="custom-group-row">
                                    <input
                                        type="text"
                                        value={group.label}
                                        onChange={(e) => handleGroupLabelChange(group.id, e.target.value)}
                                        className="group-name-input"
                                        placeholder="Group name"
                                    />
                                    <div className="day-selector">
                                        {allDays.map((day) => {
                                            const isSelected = group.days.includes(day);
                                            const isInOtherGroup = !isSelected && customGroups.some(g =>
                                                g.id !== group.id && g.days.includes(day)
                                            );
                                            return (
                                                <label
                                                    key={day}
                                                    className={`day-button ${isSelected ? 'selected' : ''} ${isInOtherGroup ? 'disabled' : ''}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        disabled={isInOtherGroup}
                                                        onChange={() => handleToggleDay(group.id, day)}
                                                    />
                                                    <span>{dayLabels[day]}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <button
                                        className="delete-group-btn"
                                        onClick={() => handleRemoveGroup(group.id)}
                                        title="Remove group"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="save-btn" onClick={handleSave}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
