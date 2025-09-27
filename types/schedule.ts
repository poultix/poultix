import { User } from "./user";

export enum ScheduleType {
    INSPECTION = 'inspection',
    VACCINATION = 'vaccination',
    TREATMENT = 'treatment',
    CONSULTATION = 'consultation',
    EMERGENCY = 'emergency',
    ROUTINE_CHECKUP = 'routine_checkup'
}

export enum ScheduleStatus {
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    RESCHEDULED = 'rescheduled'
}

export enum SchedulePriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent'
}

export interface ScheduleMedication{
    name: string;
    dosage: string;
    duration: string;
}

export interface ScheduleResults {
    findings: string;
    recommendations: string[];
    followUpRequired: boolean;
    followUpDate?: Date;
    medications?: ScheduleMedication[];
}

export interface Schedule {
    id: string;
    title: string;
    description: string;
    type: ScheduleType;
    farmer: User;
    veterinary: User;
    scheduledDate: Date;
    startTime: string; 
    endTime: string;
    status: ScheduleStatus;
    priority: SchedulePriority;
    notes?: string;
    results?: ScheduleResults;
    createdAt: Date;
    updatedAt: Date;
    createdBy: User;
}