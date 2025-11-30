/**
 * Mock automation rules data to demonstrate XHR request
 * This simulates the response that would come from the automation_rules table
 */

export const mockAutomationRules = [
    {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "User Onboarding Automation",
        description: "Automates the onboarding process for new users",
        rule_type: "triggered",
        is_active: true,
        trigger_conditions: {
            trigger: "user_signup",
            conditions: ["email_verified", "profile_completed"]
        },
        actions: {
            type: "sequence",
            steps: [
                "send_welcome_email",
                "assign_default_role",
                "create_user_profile"
            ]
        },
        schedule_config: null,
        created_by: null,
        created_at: "2025-11-24T14:30:00.000Z",
        updated_at: "2025-11-24T14:30:00.000Z",
        last_run_at: "2025-11-24T13:15:00.000Z",
        run_count: 42,
        organization_id: null
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Content Publishing Reminder",
        description: "Sends reminders to content authors about pending publications",
        rule_type: "scheduled",
        is_active: true,
        trigger_conditions: {
            trigger: "schedule",
            schedule: "0 9 * * MON"  // Every Monday at 9 AM
        },
        actions: {
            type: "notification",
            target: "content_authors",
            template: "content_reminder"
        },
        schedule_config: {
            cron: "0 9 * * MON",
            timezone: "UTC"
        },
        created_by: null,
        created_at: "2025-11-24T10:15:00.000Z",
        updated_at: "2025-11-24T10:15:00.000Z",
        last_run_at: "2025-11-24T09:00:00.000Z",
        run_count: 8,
        organization_id: null
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "Security Alert System",
        description: "Monitors for suspicious activities and sends alerts",
        rule_type: "conditional",
        is_active: true,
        trigger_conditions: {
            trigger: "security_event",
            thresholds: {
                failed_logins: 5,
                unusual_location: true
            }
        },
        actions: {
            type: "alert",
            severity: "high",
            channels: ["email", "slack"]
        },
        schedule_config: null,
        created_by: null,
        created_at: "2025-11-24T08:45:00.000Z",
        updated_at: "2025-11-24T12:20:00.000Z",
        last_run_at: "2025-11-24T11:30:00.000Z",
        run_count: 156,
        organization_id: null
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440003",
        name: "Database Cleanup",
        description: "Automated cleanup of temporary data and logs",
        rule_type: "scheduled",
        is_active: false,
        trigger_conditions: {
            trigger: "schedule",
            schedule: "0 2 * * SUN"  // Every Sunday at 2 AM
        },
        actions: {
            type: "maintenance",
            operations: [
                "cleanup_temp_files",
                "optimize_tables",
                "rotate_logs"
            ]
        },
        schedule_config: {
            cron: "0 2 * * SUN",
            timezone: "UTC"
        },
        created_by: null,
        created_at: "2025-11-24T06:00:00.000Z",
        updated_at: "2025-11-24T06:00:00.000Z",
        last_run_at: "2025-11-24T02:00:00.000Z",
        run_count: 12,
        organization_id: null
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440004",
        name: "Weekly Report Generation",
        description: "Generates and sends weekly activity reports",
        rule_type: "scheduled",
        is_active: true,
        trigger_conditions: {
            trigger: "schedule",
            schedule: "0 18 * * FRI"  // Every Friday at 6 PM
        },
        actions: {
            type: "report",
            format: "pdf",
            recipients: ["admin@benirage.org"],
            template: "weekly_summary"
        },
        schedule_config: {
            cron: "0 18 * * FRI",
            timezone: "UTC"
        },
        created_by: null,
        created_at: "2025-11-24T07:30:00.000Z",
        updated_at: "2025-11-24T07:30:00.000Z",
        last_run_at: "2025-11-23T18:00:00.000Z",
        run_count: 7,
        organization_id: null
    }
];

// Function to simulate the XHR request response
export function simulateXHRResponse() {
    return {
        success: true,
        data: mockAutomationRules,
        timestamp: new Date().toISOString(),
        count: mockAutomationRules.length,
        message: "Automation rules retrieved successfully"
    };
}