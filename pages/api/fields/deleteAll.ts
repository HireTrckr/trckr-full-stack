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
      const fieldsRef = adminDb.doc(`users/${userId}/metadata/customFields`);

      if (!fieldsRef) {
        throw new Error('Fields document not found');
      }

      // Reset the document to an empty object
      await fieldsRef.set({});

      return res.status(200).json({
        message: 'All fields deleted successfully',
      });
    } catch (error) {
      console.error(`[API] Error deleting all fields:`, error);
      return res
        .status(500)
        .json({ error: `Failed to delete all fields: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
