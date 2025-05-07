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
      const { statusId } = req.body;
      
      if (!statusId) {
        return res.status(400).json({ error: 'Status ID is required' });
      }

      const statusRef = doc(db, `users/${userId}/metadata/statuses`);

      if (!statusRef) {
        throw new Error('Status document not found');
      }

      await updateDoc(statusRef, {
        [`statuses.${statusId}`]: deleteField(),
      });

      return res.status(200).json({ 
        statusId,
        message: 'Status deleted successfully' 
      });
    } catch (error) {
      console.error(`[API] Error deleting status:`, error);
      return res.status(500).json({ error: `Failed to delete status: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}