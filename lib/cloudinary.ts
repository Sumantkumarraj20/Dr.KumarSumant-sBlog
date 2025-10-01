// lib/cloudinary.ts (client-safe)
import axios from "axios";

export async function uploadToCloudinary(file: File, folder = "lessons") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
  formData.append("folder", folder);

  try {
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
      formData,
      { headers: { "X-Requested-With": "XMLHttpRequest" } }
    );
    return res.data.secure_url as string;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw err;
  }
}

// Enhanced delete function
export async function deleteFromCloudinary(publicId: string) {
  try {
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const signature = await generateSignature(publicId, timestamp);
    
    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("signature", signature);
    formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
    formData.append("timestamp", timestamp.toString());

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
      formData,
      { headers: { "X-Requested-With": "XMLHttpRequest" } }
    );
    
    return res.data.result === "ok";
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    throw err;
  }
}

// Helper function to extract public_id from URL
export function getPublicIdFromUrl(url: string): string {
  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex !== -1) {
      // Get the part after upload/v1234567/ folder/filename
      const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
      // Remove file extension
      return pathAfterUpload.replace(/\.[^/.]+$/, "");
    }
    return '';
  } catch {
    return '';
  }
}

// You'll need a server API to generate signatures for security
async function generateSignature(publicId: string, timestamp: number): Promise<string> {
  try {
    const response = await fetch('/api/cloudinary-signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId, timestamp }),
    });
    
    const data = await response.json();
    return data.signature;
  } catch (error) {
    console.error('Error generating signature:', error);
    throw error;
  }
}