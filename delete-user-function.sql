-- Create a function to delete a user from auth.users
-- This requires the service role key to be used
CREATE OR REPLACE FUNCTION delete_user_account(user_id_to_delete UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Delete from user_profiles first (due to foreign key constraint)
  DELETE FROM user_profiles WHERE user_id = user_id_to_delete;
  
  -- Note: We cannot directly delete from auth.users via SQL
  -- This requires the Supabase Admin API or Edge Function
  -- For now, we'll just delete from user_profiles and return success
  
  result := json_build_object(
    'success', true,
    'message', 'User profile deleted. Note: auth.users deletion requires admin API call.'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;
