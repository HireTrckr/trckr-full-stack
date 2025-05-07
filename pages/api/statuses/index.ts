import { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { StatusMap } from '../../../types/jobStatus';
import { timestampToDate } from '../../../utils/timestampUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get user ID from the request
  const userId = req.headers['user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized - User ID is required' });
  }

  if (req.method === 'GET') {
    try {
      // Get default statuses
      const defaultStatusRef = doc(db, 'config/defaultStatusMap');
      const defaultStatusDoc = await getDoc(defaultStatusRef);
      
      if (!defaultStatusDoc.exists()) {
        return res.status(404).json({ error: 'Default statuses not found' });
      }
      
      const defaultStatuses = defaultStatusDoc.data() as StatusMap;
      
      // Get user custom statuses
      const userStatusRef = doc(db, `users/${userId}/metadata/statuses`);
      const userStatusDoc = await getDoc(userStatusRef);
      
      let customStatuses: StatusMap = {};
      if (userStatusDoc.exists()) {
        customStatuses = userStatusDoc.data().statusMap ?? userStatusDoc.data();
      }
      
      // Convert timestamps
      Object.values(customStatuses).forEach(status => {
        if (status.timestamps) {
          status.timestamps.createdAt = timestampToDate(status.timestamps.createdAt);
          status.timestamps.updatedAt = timestampToDate(status.timestamps.updatedAt);
        }
      });
      
      Object.values(defaultStatuses).forEach(status => {
        if (status.timestamps) {
          status.timestamps.createdAt = timestampToDate(status.timestamps.createdAt);
          status.timestamps.updatedAt = timestampToDate(status.timestamps.updatedAt);
        }
      });
      
      // Merge default statuses with custom ones (custom ones override defaults if same ID)
      const statusMap = { ...defaultStatuses, ...customStatuses };
      
      return res.status(200).json({ statusMap });
    } catch (error) {
      console.error('[API] Error fetching statuses:', error);
      return res.status(500).json({ error: `Failed to fetch statuses: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}