import { NextApiRequest, NextApiResponse } from 'next';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get user ID from the request
  const userId = req.headers['user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized - User ID is required' });
  }

  if (req.method === 'DELETE') {
    try {
      const { tagId } = req.body;
      
      if (!tagId) {
        return res.status(400).json({ error: 'Tag ID is required' });
      }

      const tagsRef = doc(db, `users/${userId}/metadata/tags`);

      if (!tagsRef) {
        throw new Error('Tags document not found');
      }

      await updateDoc(tagsRef, {
        [`tagMap.${tagId}`]: deleteField(),
      });

      return res.status(200).json({ 
        tagId,
        message: 'Tag deleted successfully' 
      });
    } catch (error) {
      console.error(`[API] Error deleting tag:`, error);
      return res.status(500).json({ error: `Failed to delete tag: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}