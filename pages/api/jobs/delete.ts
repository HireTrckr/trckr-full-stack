import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';

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
      const { jobId, timestamps } = req.body;

      if (!jobId) {
        return res.status(400).json({ error: 'Job ID is required' });
      }

      const jobRef = adminDb.doc(`users/${userId}/jobs/${jobId}`);

      if (!jobRef) {
        throw new Error('Job not found');
      }

      await jobRef.update({
        statusID: 'deleted',
        timestamps: {
          ...timestamps,
          updatedAt: new Date(),
          deletedAt: new Date(),
        },
      });

      return res.status(200).json({
        jobId,
        message: 'Job deleted successfully',
      });
    } catch (error) {
      console.error(`[API] Error deleting job:`, error);
      return res.status(500).json({ error: `Failed to delete job: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
