import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';
import { JobStatus, StatusMap } from '../../../types/jobStatus';
import { serverTimestamp } from 'firebase/firestore';

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

  if (req.method === 'PUT') {
    try {
      const status = req.body as JobStatus;

      if (!status || !status.id) {
        return res.status(400).json({ error: 'Status ID is required' });
      }

      // check if status exists in default status directory
      const defaultStatusRef = adminDb.doc('config/defaultStatusMap');

      if (!defaultStatusRef) {
        console.error('[api/statuses/update]: Default Status Map Missing');
        return res.status(500).json({ error: 'Default Status Map Missing' });
      }

      const defaultStatusDoc = await defaultStatusRef.get();
      const defaultStatusMap: StatusMap = defaultStatusDoc.data() as StatusMap;

      if (defaultStatusMap[status.id]) {
        return res.status(403).json({ error: 'Cannot modify default status' });
      }

      // Get the current status to check if it's deletable
      const statusesRef = adminDb.doc(`users/${userId}/metadata/statuses`);

      if (!statusesRef) {
        throw new Error('Statuses document not found');
      }

      const statusesDoc = await statusesRef.get();

      if (!statusesDoc.exists) {
        return res.status(404).json({ error: 'Statuses document not found' });
      }

      const statusData = statusesDoc.data() as StatusMap;
      const existingStatus = statusData[status.id] as JobStatus;

      if (!existingStatus) {
        return res.status(404).json({ error: 'Status not found' });
      }

      // Check if the status is deletable (can be modified)
      if (!existingStatus.deletable) {
        return res.status(403).json({ error: 'Cannot modify default status' });
      }

      // Update the timestamp
      status.timestamps.updatedAt = firebase.firestore.Timestamp.fromDate(
        new Date()
      );

      await statusesRef.update({
        [`statusMap.${status.id}`]: status,
      });

      return res.status(200).json({
        status,
        message: 'Status updated successfully',
      });
    } catch (error) {
      console.error('[API] Error updating status:', error);
      return res
        .status(500)
        .json({ error: `Failed to update status: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
