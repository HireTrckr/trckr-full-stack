import { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { timestampToDate } from '../../../utils/timestampUtils';
import { Job } from '../../../types/job';

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
      const q = query(
        collection(db, `users/${userId}/jobs`),
        where('statusID', '!=', 'deleted')
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return res.status(200).json({ jobs: [] });
      }

      const jobs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamps: {
          createdAt: timestampToDate(doc.data().timestamps.createdAt),
          updatedAt: timestampToDate(doc.data().timestamps.updatedAt),
          deletedAt: doc.data().timestamps.deletedAt
            ? timestampToDate(doc.data().timestamps.deletedAt)
            : null,
        },
      })) as Job[];

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