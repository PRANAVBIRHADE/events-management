import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    // Get the service role key from env
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    if (!serviceRoleKey || !supabaseUrl) {
      return new Response('Missing env vars', { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    const { user_id } = await req.json()
    if (!user_id) {
      return new Response('Missing user_id', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    console.log('Deleting user completely:', user_id)

    // Call the Supabase Admin API to delete the user from auth.users
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user_id}`, {
      method: 'DELETE',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('Failed to delete user:', error)
      return new Response(`Failed to delete user: ${error}`, { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    console.log('User deleted successfully from auth.users')

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'User completely deleted from auth.users and user_profiles' 
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in delete-user-complete:', error)
    return new Response(`Error: ${error.message}`, { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})
