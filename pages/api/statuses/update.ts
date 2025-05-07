import { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { JobStatus } from '../../../types/jobStatus';

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
      const status = req.body as JobStatus;
      
      if (!status || !status.id) {
        return res.status(400).json({ error: 'Status ID is required' });
      }

      // Get the current status to check if it's deletable
      const statusesRef = doc(db, `users/${userId}/metadata/statuses`);
      const statusesDoc = await getDoc(statusesRef);
      
      if (!statusesDoc.exists()) {
        return res.status(404).json({ error: 'Statuses document not found' });
      }
      
      const statusData = statusesDoc.data();
      const existingStatus = statusData.statusMap?.[status.id] as JobStatus;
      
      if (!existingStatus) {
        return res.status(404).json({ error: 'Status not found' });
      }
      
      // Check if the status is deletable (can be modified)
      if (!existingStatus.deletable) {
        return res.status(403).json({ error: 'Cannot modify default status' });
      }

      // Update the timestamp
      status.timestamps.updatedAt = new Date();

      await updateDoc(statusesRef, {
        [`statusMap.${status.id}`]: status,
      });

      return res.status(200).json({ 
        status,
        message: 'Status updated successfully' 
      });
    } catch (error) {
      console.error('[API] Error updating status:', error);
      return res.status(500).json({ error: `Failed to update status: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}