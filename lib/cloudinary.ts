// lib/cloudinary.ts (client-safe)
import axios from "axios";

// Common upload function for all file types - returns string URL
export async function uploadToCloudinary(
  file: File, 
  folder = "lessons", 
  resourceType: "image" | "video" | "auto" = "auto"
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
  formData.append("folder", folder);

  try {
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      formData,
      { 
        headers: { 
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "multipart/form-data"
        },
        timeout: 30000
      }
    );
    
    if (res.data.error) {
      throw new Error(res.data.error.message);
    }
    
    // Return only the secure_url as string
    return res.data.secure_url as string;
  } catch (err: any) {
    console.error("Cloudinary upload error:", err);
    throw new Error(err.response?.data?.error?.message || "Upload failed");
  }
}

// Specialized function for profile images - also returns string URL
export async function uploadProfileImage(file: File, userId: string): Promise<string> {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file");
  }

  // Validate file size (5MB limit for profile images)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Profile image must be smaller than 5MB");
  }

  // Use user-specific folder for better organization
  const folder = `profiles/${userId}`;
  
  return await uploadToCloudinary(file, folder, "image");
}

// If you need the full response object elsewhere, create a separate function
export async function uploadToCloudinaryWithDetails(
  file: File, 
  folder = "lessons", 
  resourceType: "image" | "video" | "auto" = "auto"
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
  formData.append("folder", folder);

  try {
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      formData,
      { 
        headers: { 
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "multipart/form-data"
        },
        timeout: 30000
      }
    );
    
    if (res.data.error) {
      throw new Error(res.data.error.message);
    }
    
    return {
      secure_url: res.data.secure_url as string,
      public_id: res.data.public_id as string,
      format: res.data.format as string,
      bytes: res.data.bytes as number
    };
  } catch (err: any) {
    console.error("Cloudinary upload error:", err);
    throw new Error(err.response?.data?.error?.message || "Upload failed");
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
      { 
        headers: { "X-Requested-With": "XMLHttpRequest" },
        timeout: 10000
      }
    );
    
    return res.data.result === "ok";
  } catch (err: any) {
    console.error("Cloudinary delete error:", err);
    throw new Error(err.response?.data?.error?.message || "Delete failed");
  }
}

// Delete old profile image when uploading new one
export async function deleteOldProfileImage(oldImageUrl: string) {
  try {
    const publicId = getPublicIdFromUrl(oldImageUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }
  } catch (error) {
    console.warn("Failed to delete old profile image:", error);
    // Don't throw error here - we don't want to block the upload if delete fails
  }
}

// Helper function to extract public_id from URL
export function getPublicIdFromUrl(url: string): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Find the index after 'upload'
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex !== -1 && uploadIndex < pathParts.length - 1) {
      // Get everything after the version number (v1234567)
      const pathAfterVersion = pathParts.slice(uploadIndex + 2).join('/');
      // Remove file extension
      return pathAfterVersion.replace(/\.[^/.]+$/, "");
    }
    
    return '';
  } catch {
    return '';
  }
}

// Generate signature via API route
async function generateSignature(publicId: string, timestamp: number): Promise<string> {
  try {
    const response = await fetch('/api/cloudinary-signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId, timestamp }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate signature');
    }
    
    const data = await response.json();
    return data.signature;
  } catch (error) {
    console.error('Error generating signature:', error);
    throw error;
  }
}

// Utility to validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select an image file' };
  }

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'Image must be smaller than 5MB' };
  }

  // Check file extensions
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension || '')) {
    return { valid: false, error: 'Please select a valid image format (JPG, PNG, GIF, WebP)' };
  }

  return { valid: true };
}