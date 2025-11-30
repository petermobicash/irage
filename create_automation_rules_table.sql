-- Create automation_rules table
CREATE TABLE IF NOT EXISTS public.automation_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL, -- e.g., 'scheduled', 'triggered', 'conditional'
    is_active BOOLEAN DEFAULT true,
    trigger_conditions JSONB, -- Stores conditions that trigger the automation
    actions JSONB, -- Stores actions to be performed
    schedule_config JSONB, -- For scheduled rules
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_run_at TIMESTAMP WITH TIME ZONE,
    run_count INTEGER DEFAULT 0,
    organization_id UUID REFERENCES organizations(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_automation_rules_created_at ON public.automation_rules(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_rules_is_active ON public.automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_automation_rules_rule_type ON public.automation_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_automation_rules_organization_id ON public.automation_rules(organization_id);

-- Enable RLS
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view automation rules for their organization" ON public.automation_rules
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE user_id = auth.uid()
        ) OR
        organization_id IS NULL
    );

CREATE POLICY "Users can insert automation rules for their organization" ON public.automation_rules
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE user_id = auth.uid()
        ) OR
        organization_id IS NULL
    );

CREATE POLICY "Users can update automation rules for their organization" ON public.automation_rules
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE user_id = auth.uid()
        ) OR
        organization_id IS NULL
    );

CREATE POLICY "Users can delete automation rules for their organization" ON public.automation_rules
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE user_id = auth.uid()
        ) OR
        organization_id IS NULL
    );

-- Add table comment
COMMENT ON TABLE public.automation_rules IS 'Table for storing automation rules and workflows';