import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';
import { JobNotSavedInDB } from '../../../types/job';
import { Timestamp } from 'firebase-admin/firestore';
import { TagMap } from '../../../types/tag';

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
      const job = req.body as JobNotSavedInDB;

      if (!job.statusID || !job.company || !job.position) {
        return res.status(400).json({ error: 'Missing required job fields' });
      }

      const completeJob = {
        ...job,
        timestamps: {
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
          deletedAt: null,
        },
      };

      const docRef = await adminDb
        .collection(`users/${userId}/jobs`)
        .add(completeJob);

      if (!docRef) {
        throw Error('Failed to add job');
      }

      const tagMap = (
        await adminDb.doc(`users/${userId}/metadata/tags`).get()
      ).data()?.tagMap as TagMap;

      for (const tagId of job.tagIds) {
        // increment count by one
        const tag = tagMap[tagId];
        if (tag) {
          tagMap[tagId] = {
            ...tagMap[tagId],
            count: tagMap[tagId].count + 1,
          };
        }
      }
      await adminDb
        .doc(`users/${userId}/metadata/tags`)
        .set({ tagMap: tagMap });

      return res.status(201).json({
        job: { ...completeJob, id: docRef.id },
        message: 'Job added successfully',
      });
    } catch (error) {
      console.error('[API] Error adding job:', error);
      return res.status(500).json({ error: `Failed to add job: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
