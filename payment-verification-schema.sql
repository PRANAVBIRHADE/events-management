-- Payment Verification System Schema
-- This creates a comprehensive payment tracking system

-- Create payment_verifications table
CREATE TABLE IF NOT EXISTS payment_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    registration_id UUID NOT NULL,
    registration_type VARCHAR(20) NOT NULL CHECK (registration_type IN ('fresher', 'senior')),
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    upi_id VARCHAR(100) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected', 'expired')),
    screenshot_url TEXT,
    payment_reference VARCHAR(100),
    admin_notes TEXT,
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_verifications_registration_id ON payment_verifications(registration_id);
CREATE INDEX IF NOT EXISTS idx_payment_verifications_user_id ON payment_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_verifications_event_id ON payment_verifications(event_id);
CREATE INDEX IF NOT EXISTS idx_payment_verifications_status ON payment_verifications(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_verifications_created_at ON payment_verifications(created_at);

-- Add payment verification columns to existing tables
ALTER TABLE freshers_registrations 
ADD COLUMN IF NOT EXISTS payment_verification_id UUID REFERENCES payment_verifications(id);

ALTER TABLE senior_ticket_registrations 
ADD COLUMN IF NOT EXISTS payment_verification_id UUID REFERENCES payment_verifications(id);

-- Create RLS policies for payment_verifications
ALTER TABLE payment_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment verifications
CREATE POLICY "Users can view own payment verifications" ON payment_verifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own payment verifications
CREATE POLICY "Users can insert own payment verifications" ON payment_verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own payment verifications (for screenshot upload)
CREATE POLICY "Users can update own payment verifications" ON payment_verifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all payment verifications
CREATE POLICY "Admins can view all payment verifications" ON payment_verifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Admins can update payment verifications (for verification)
CREATE POLICY "Admins can update payment verifications" ON payment_verifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_payment_verifications_updated_at
    BEFORE UPDATE ON payment_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_verification_updated_at();

-- Create function to verify payment and update registration status
CREATE OR REPLACE FUNCTION verify_payment_and_update_registration(
    p_payment_id UUID,
    p_admin_notes TEXT DEFAULT NULL,
    p_payment_reference TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_payment payment_verifications%ROWTYPE;
    v_registration_id UUID;
    v_registration_type VARCHAR(20);
    v_result JSON;
BEGIN
    -- Get payment verification details
    SELECT * INTO v_payment 
    FROM payment_verifications 
    WHERE id = p_payment_id AND payment_status = 'pending';
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Payment verification not found or already processed'
        );
    END IF;
    
    -- Update payment verification
    UPDATE payment_verifications 
    SET 
        payment_status = 'verified',
        verified_by = auth.uid(),
        verified_at = NOW(),
        admin_notes = p_admin_notes,
        payment_reference = p_payment_reference
    WHERE id = p_payment_id;
    
    -- Update the corresponding registration
    IF v_payment.registration_type = 'fresher' THEN
        UPDATE freshers_registrations 
        SET payment_verification_id = p_payment_id
        WHERE id = v_payment.registration_id;
    ELSE
        UPDATE senior_ticket_registrations 
        SET 
            payment_status = 'completed',
            payment_verification_id = p_payment_id,
            amount_paid = v_payment.amount
        WHERE id = v_payment.registration_id;
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Payment verified successfully',
        'registration_id', v_payment.registration_id,
        'registration_type', v_payment.registration_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION verify_payment_and_update_registration(UUID, TEXT, TEXT) TO authenticated;

-- Create function to reject payment
CREATE OR REPLACE FUNCTION reject_payment_verification(
    p_payment_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_payment payment_verifications%ROWTYPE;
BEGIN
    -- Get payment verification details
    SELECT * INTO v_payment 
    FROM payment_verifications 
    WHERE id = p_payment_id AND payment_status = 'pending';
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Payment verification not found or already processed'
        );
    END IF;
    
    -- Update payment verification
    UPDATE payment_verifications 
    SET 
        payment_status = 'rejected',
        verified_by = auth.uid(),
        verified_at = NOW(),
        admin_notes = p_admin_notes
    WHERE id = p_payment_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Payment rejected successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reject_payment_verification(UUID, TEXT) TO authenticated;

-- Create function to get payment verification details
CREATE OR REPLACE FUNCTION get_payment_verification_details(p_payment_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'id', pv.id,
        'registration_id', pv.registration_id,
        'registration_type', pv.registration_type,
        'event_id', pv.event_id,
        'user_id', pv.user_id,
        'amount', pv.amount,
        'upi_id', pv.upi_id,
        'payment_status', pv.payment_status,
        'screenshot_url', pv.screenshot_url,
        'payment_reference', pv.payment_reference,
        'admin_notes', pv.admin_notes,
        'verified_by', pv.verified_by,
        'verified_at', pv.verified_at,
        'created_at', pv.created_at,
        'updated_at', pv.updated_at,
        'user_details', json_build_object(
            'full_name', up.full_name,
            'email', up.email,
            'mobile_number', up.mobile_number,
            'studying_year', up.studying_year
        ),
        'event_details', json_build_object(
            'name', e.name,
            'event_date', e.event_date,
            'location', e.location
        )
    ) INTO v_result
    FROM payment_verifications pv
    JOIN user_profiles up ON pv.user_id = up.user_id
    JOIN events e ON pv.event_id = e.id
    WHERE pv.id = p_payment_id;
    
    RETURN COALESCE(v_result, json_build_object('error', 'Payment verification not found'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_payment_verification_details(UUID) TO authenticated;
