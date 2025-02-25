
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { v2 as cloudinary } from "https://esm.sh/cloudinary@1.41.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: Deno.env.get('CLOUDINARY_CLOUD_NAME'),
      api_key: Deno.env.get('CLOUDINARY_API_KEY'),
      api_secret: Deno.env.get('CLOUDINARY_API_SECRET')
    })

    const { file, filename } = await req.json()
    
    if (!file || !filename) {
      throw new Error('Missing file or filename')
    }

    console.log('Uploading file:', filename);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(file, {
        folder: 'listings',
        resource_type: 'auto',
        filename_override: filename,
      }, (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    console.log('Upload successful, returning URL');

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error in upload-image function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400 
      }
    )
  }
})
