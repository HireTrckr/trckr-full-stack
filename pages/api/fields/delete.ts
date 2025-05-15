import { NextApiRequest, NextApiResponse } from 'next';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../lib/firebase-admin';
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

  if (req.method === 'DELETE') {
    try {
      const { fieldId } = req.body;

      if (!fieldId) {
        return res.status(400).json({ error: 'Field ID is required' });
      }

      const fieldsRef = adminDb.doc(`users/${userId}/metadata/customFields`);

      if (!fieldsRef) {
        throw new Error('Fields document not found');
      }

      await fieldsRef.update({
        [fieldId]: FieldValue.delete(),
      });

      // Also clean up field values from jobs
      const jobsRef = adminDb.collection(`users/${userId}/jobs`);
      const jobsSnapshot = await jobsRef.get();

      const batch = adminDb.batch();
      jobsSnapshot.forEach((jobDoc) => {
        const jobData = jobDoc.data();
        if (jobData.customFields && jobData.customFields[fieldId]) {
          delete jobData.customFields[fieldId];
          batch.update(jobDoc.ref, {
            customFields: jobData.customFields,
            timestamps: {
              updatedAt: Timestamp.fromDate(new Date()),
            },
          });
        }
      });

      await batch.commit();

      return res.status(200).json({
        fieldId,
        message: 'Field deleted successfully',
      });
    } catch (error) {
      console.error(`[API] Error deleting field:`, error);
      return res
        .status(500)
        .json({ error: `Failed to delete field: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
