import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';
import { JobStatus, JobStatusNotSavedInDB } from '../../../types/jobStatus';
import { getRandomTailwindColor } from '../../../utils/generateRandomColor';

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
      const status = req.body as Partial<JobStatusNotSavedInDB>;

      if (!status || !status.statusName) {
        return res.status(400).json({ error: 'Status name is required' });
      }

      const newID = status.statusName.toLowerCase().replace(/\\s/g, '-');

      // throw error if status already exists
      const statusDoc = await adminDb
        .doc(`users/${userId}/metadata/statuses`)
        .get();
      if (statusDoc.exists) {
        const statusMap: { [key: string]: JobStatus } =
          statusDoc.data()?.statusMap ?? statusDoc.data();
        if (statusMap[newID]) {
          return res.status(400).json({ error: 'Status already exists' });
        }
      }

      const newStatus: JobStatus = {
        id: newID,
        statusName: status.statusName,
        color: status.color || getRandomTailwindColor().tailwindColorName,
        deletable: true,
        timestamps: {
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      };

      await adminDb.doc(`users/${userId}/metadata/statuses`).update({
        [`statusMap.${newID}`]: newStatus,
      });

      return res.status(201).json({
        status: newStatus,
        message: 'Status created successfully',
      });
    } catch (error) {
      console.error('[API] Error creating status:', error);
      return res
        .status(500)
        .json({ error: `Failed to create status: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
