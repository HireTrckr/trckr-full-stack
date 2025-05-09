import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';
import { Tag } from '../../../types/tag';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get user ID from the request
  const userId = req.headers['user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized - User ID is required' });
  }

  if (req.method === 'PUT') {
    try {
      const tag = req.body as Tag;
      
      if (!tag || !tag.id) {
        return res.status(400).json({ error: 'Tag ID is required' });
      }

      // Update the timestamp
      tag.timestamps.updatedAt = new Date();

      await adminDb.doc(`users/${userId}/metadata/tags`).update({
        [`tagMap.${tag.id}`]: tag,
      });

      return res.status(200).json({ 
        tag,
        message: 'Tag updated successfully' 
      });
    } catch (error) {
      console.error('[API] Error updating tag:', error);
      return res.status(500).json({ error: `Failed to update tag: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}