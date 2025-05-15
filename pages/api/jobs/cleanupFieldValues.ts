import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';
import { Job } from '../../../types/job';
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

  if (req.method === 'POST') {
    try {
      const { fieldId } = req.body;

      if (!fieldId) {
        return res.status(400).json({ error: 'Field ID is required' });
      }

      const jobsRef = adminDb.collection(`users/${userId}/jobs`);
      const jobsSnapshot = await jobsRef.get();

      const batch = adminDb.batch();
      jobsSnapshot.forEach((jobDoc) => {
        const jobData = jobDoc.data() as Job;
        if (jobData.customFields && jobData.customFields[fieldId]) {
          delete jobData.customFields[fieldId];
          batch.update(jobDoc.ref, {
            customFields: jobData.customFields,
            timestamps: {
              ...jobData.timestamps,
              updated: Timestamp.fromDate(new Date()),
            },
          });
        }
      });

      await batch.commit();

      return res.status(200).json({
        message: `Field ${fieldId} removed from all jobs successfully`,
      });
    } catch (error) {
      console.error(`[API] Error cleaning up field values:`, error);
      return res
        .status(500)
        .json({ error: `Failed to clean up field values: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
