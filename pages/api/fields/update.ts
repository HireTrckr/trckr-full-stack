import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';
import { CustomField } from '../../../types/customField';
import { serverTimestamp } from 'firebase/firestore';

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
      const field = req.body as CustomField;

      if (!field || field.id) {
        return res.status(400).json({ error: 'Field ID is required' });
      }

      // Update the timestamp
      field.timestamps.updatedAt = firebase.firestore.Timestamp.fromDate(
        new Date()
      );

      const fieldsRef = adminDb.doc(`users/${userId}/metadata/customFields`);

      if (!fieldsRef) {
        throw new Error('Fields document not found');
      }

      await fieldsRef.update({
        [field.id]: field,
      });

      return res.status(200).json({
        field,
        message: 'Field updated successfully',
      });
    } catch (error) {
      console.error('[API] Error updating field:', error);
      return res
        .status(500)
        .json({ error: `Failed to update field: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
