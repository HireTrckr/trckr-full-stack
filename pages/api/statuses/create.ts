import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';
import { JobStatus, JobStatusNotSavedInDB } from '../../../types/jobStatus';
import { getRandomTailwindColor } from '../../../utils/generateRandomColor';
import { getIDFromName } from '../../../utils/idUtils';
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
      const status = req.body as Partial<JobStatusNotSavedInDB>;

      if (!status || !status.statusName) {
        return res.status(400).json({ error: 'Status name is required' });
      }

      const newID = getIDFromName(status.statusName);

      const newStatus: JobStatus = {
        id: newID,
        statusName: status.statusName,
        color: status.color || getRandomTailwindColor().tailwindColorName,
        deletable: true,
        timestamps: {
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
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
