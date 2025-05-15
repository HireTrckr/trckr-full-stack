import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';
import { StatusMap } from '../../../types/jobStatus';
import { Timestamp } from 'firebase-admin/firestore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get user ID from the request
  const userId = req.headers['user-id'] as string;

  if (!userId) {
    return res
      .status(401)
      .json({ error: 'Unauthorized - User ID is required' });
  }

  if (req.method === 'GET') {
    try {
      // Get default statuses
      const defaultStatusRef = adminDb.doc('config/defaultStatusMap');
      const defaultStatusDoc = await defaultStatusRef.get();

      if (!defaultStatusDoc.exists) {
        return res.status(404).json({ error: 'Default statuses not found' });
      }

      const defaultStatuses = defaultStatusDoc.data() as StatusMap;

      // Get user custom statuses
      const userStatusRef = adminDb.doc(`users/${userId}/metadata/statuses`);
      const userStatusDoc = await userStatusRef.get();

      if (!userStatusDoc.exists) {
        await userStatusRef.set({});
        return res.status(200).json({ statusMap: defaultStatuses });
      }

      let customStatuses = userStatusDoc.data();

      if (!customStatuses) {
        await userStatusRef.set({});
        return res.status(200).json({ statusMap: defaultStatuses });
      }

      if (customStatuses.statusMap) {
        customStatuses = customStatuses.statusMap;
      }

      // Convert timestamps
      Object.values(customStatuses as StatusMap).forEach((status) => {
        if (status.timestamps) {
          status.timestamps.createdAt = Timestamp.fromDate(new Date());
          status.timestamps.updatedAt = Timestamp.fromDate(new Date());
        }
      });

      Object.values(defaultStatuses).forEach((status) => {
        if (status.timestamps) {
          status.timestamps.createdAt = Timestamp.fromDate(new Date());
          status.timestamps.updatedAt = Timestamp.fromDate(new Date());
        }
      });

      // Merge default statuses with custom ones (custom ones override defaults if same ID)
      const statusMap = { ...defaultStatuses, ...customStatuses };

      return res.status(200).json({ statusMap });
    } catch (error) {
      console.error('[API] Error fetching statuses:', error);
      return res
        .status(500)
        .json({ error: `Failed to fetch statuses: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
