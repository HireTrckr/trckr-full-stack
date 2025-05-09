import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';
import { StatusMap } from '../../../types/jobStatus';

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

  if (req.method === 'POST') {
    try {
      // First fetch default statuses
      const defaultStatusRef = adminDb.doc('config/defaultStatusMap');
      const defaultStatusDoc = await defaultStatusRef.get();

      if (!defaultStatusDoc.exists) {
        return res.status(404).json({ error: 'Default statuses not found' });
      }

      const defaultStatuses = defaultStatusDoc.data() as StatusMap;

      // Reset user's statuses document to empty
      const userStatusRef = adminDb.doc(`users/${userId}/metadata/statuses`);
      await userStatusRef.set({});

      return res.status(200).json({
        statusMap: defaultStatuses,
        message: 'Statuses reset successfully',
      });
    } catch (error) {
      console.error('[API] Error resetting statuses:', error);
      return res
        .status(500)
        .json({ error: `Failed to reset statuses: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
