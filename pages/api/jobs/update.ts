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

  if (req.method === 'PUT') {
    try {
      const job = req.body as Job;

      if (!job.id) {
        return res.status(400).json({ error: 'Job ID is required' });
      }

      const jobRef = adminDb.doc(`users/${userId}/jobs/${job.id}`);

      if (!jobRef) {
        throw new Error('Job not found');
      }

      const updatedJob: Job = {
        ...job,
        timestamps: {
          ...job.timestamps,
          updatedAt: Timestamp.fromDate(new Date()),
        },
      };

      await jobRef.update(updatedJob);

      return res.status(200).json({
        job: updatedJob,
        message: 'Job updated successfully',
      });
    } catch (error) {
      console.error(`[API] Error updating job:`, error);
      return res.status(500).json({ error: `Failed to update job: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
