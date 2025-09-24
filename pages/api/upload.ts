import type { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from '../../lib/cloudinary';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // required for file uploads
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const file = files.file as formidable.File;

    try {
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: 'learning_module', // optional: organize uploads
      });

      // Return the Cloudinary URL
      res.status(200).json({ url: result.secure_url, public_id: result.public_id });
    } catch (error) {
      res.status(500).json({ error });
    } finally {
      fs.unlinkSync(file.filepath); // clean temp file
    }
  });
}
