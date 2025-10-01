// pages/api/cloudinary-signature.ts
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { publicId, timestamp } = req.body;
  
  if (!publicId || !timestamp) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign)
      .digest('hex');

    res.status(200).json({ signature });
  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(500).json({ error: 'Failed to generate signature' });
  }
}