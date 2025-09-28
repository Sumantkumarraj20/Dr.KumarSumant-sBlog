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
