import { NextApiRequest, NextApiResponse } from 'next';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
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

  if (req.method === 'DELETE') {
    try {
      const { statusId } = req.body;

      if (!statusId) {
        return res.status(400).json({ error: 'Status ID is required' });
      }

      const statusRef = adminDb.doc(`users/${userId}/metadata/statuses`);

      if (!statusRef) {
        throw new Error('Status document not found');
      }

      // 1. Delete the status from the statuses document
      await statusRef.update({
        [`statusMap.${statusId}`]: FieldValue.delete(),
      });

      // 2. Find all jobs with this status and update them to use a default status
      const jobsRef = adminDb.collection(`users/${userId}/jobs`);
      const jobsWithStatus = await jobsRef
        .where('statusID', '==', statusId)
        .get();

      if (!jobsWithStatus.empty) {
        const batch = adminDb.batch();
        const defaultStatusID = 'applied'; // Using 'applied' as a fallback status

        jobsWithStatus.forEach((doc) => {
          batch.update(doc.ref, {
            statusID: defaultStatusID,
            timestamps: {
              ...doc.data().timestamps,
              updatedAt: Timestamp.fromDate(new Date()),
            },
          });
        });

        await batch.commit();
      }

      return res.status(200).json({
        statusId,
        message: 'Status deleted successfully and removed from all jobs',
        jobsUpdated: jobsWithStatus.size,
      });
    } catch (error) {
      console.error(`[API] Error deleting status:`, error);
      return res
        .status(500)
        .json({ error: `Failed to delete status: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
