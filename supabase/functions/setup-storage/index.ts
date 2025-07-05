const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the service role key from the request
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Service role key not available' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the Supabase URL from the environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    if (!supabaseUrl) {
      return new Response(
        JSON.stringify({ error: 'SUPABASE_URL environment variable is not set' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the imagemanager bucket if it doesn't exist
    const createBucketResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
      body: JSON.stringify({
        id: 'imagemanager',
        name: 'imagemanager',
        public: true,
      }),
    });

    // If the bucket already exists, this will return a 400 error, which is fine
    const bucketResult = await createBucketResponse.json();
    
    // SQL statements to create storage policies
    const policyStatements = [
      // Allow authenticated users to insert (upload) images to questions folder
      `
        CREATE POLICY IF NOT EXISTS "Authenticated users can upload question images"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'imagemanager' AND (storage.foldername(name))[1] = 'questions');
      `,
      // Allow authenticated users to insert (upload) images to options folder
      `
        CREATE POLICY IF NOT EXISTS "Authenticated users can upload option images"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'imagemanager' AND (storage.foldername(name))[1] = 'options');
      `,
      // Allow authenticated users to select (view) images
      `
        CREATE POLICY IF NOT EXISTS "Authenticated users can view images"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (bucket_id = 'imagemanager');
      `,
      // Allow public (anon) users to select (view) images
      `
        CREATE POLICY IF NOT EXISTS "Public can view images"
        ON storage.objects FOR SELECT
        TO anon
        USING (bucket_id = 'imagemanager');
      `,
      // Allow authenticated users to delete images
      `
        CREATE POLICY IF NOT EXISTS "Authenticated users can delete images"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'imagemanager');
      `,
      // Allow authenticated users to update images
      `
        CREATE POLICY IF NOT EXISTS "Authenticated users can update images"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'imagemanager')
        WITH CHECK (bucket_id = 'imagemanager');
      `
    ];

    // Execute each policy statement using the REST API
    const policyResults = [];
    for (const [index, statement] of policyStatements.entries()) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
          },
          body: JSON.stringify({
            sql: statement
          }),
        });

        const result = await response.json();
        policyResults.push({
          policy: `Policy ${index + 1}`,
          success: response.ok,
          result: result,
        });
      } catch (error) {
        // Try alternative approach using direct SQL execution
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              query: statement
            }),
          });

          policyResults.push({
            policy: `Policy ${index + 1}`,
            success: response.ok,
            fallback: true,
            status: response.status
          });
        } catch (fallbackError) {
          policyResults.push({
            policy: `Policy ${index + 1}`,
            success: false,
            error: error.message,
            fallbackError: fallbackError.message
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: "Storage setup completed",
        bucket: bucketResult,
        policies: policyResults,
        note: "If policies failed to create via function, please create them manually in the Supabase Dashboard under Storage > Policies"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});