import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';

import { Job } from '../../../types/job';

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
      // get the user's jobs
      const userDoc = await adminDb
        .collection(`users/${userId}/jobs`)
        .where('statusID', '!=', 'deleted')
        .get();

      if (userDoc.empty) {
        return res.status(200).json({ jobs: [] });
      }

      const jobs = userDoc.docs.map((doc) => {
        return {
          id: doc.id,
          ...(doc.data() as {
            position: Job['position'];
            company: Job['company'];
            tagIds: Job['tagIds'];
            statusID: Job['statusID'];
            customFields: Job['customFields'];
          }),
          timestamps: {
            ...doc.data().timestamps,
            deletedAt: null,
          },
        };
      }) as Job[];

      return res.status(200).json({ jobs });
    } catch (error) {
      console.error('[API] Error fetching jobs:', error);
      return res.status(500).json({ error: `Failed to fetch jobs: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
