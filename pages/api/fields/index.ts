import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';
import { CustomField } from '../../../types/customField';

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
      const fieldsRef = adminDb.doc(`users/${userId}/metadata/customFields`);
      const fieldsDoc = await fieldsRef.get();

      if (!fieldsDoc.exists) {
        await fieldsRef.set({});
        return res.status(200).json({ fieldMap: {} });
      }

      const fieldData = fieldsDoc.data();
      if (!fieldData) {
        return res.status(200).json({ fieldMap: {} });
      }

      const fieldMap: Record<string, CustomField> = {};

      for (const fieldId in fieldData) {
        const field = fieldData[fieldId] as CustomField;
        fieldMap[fieldId] = field;
      }

      return res.status(200).json({ fieldMap });
    } catch (error) {
      console.error('[API] Error fetching custom fields:', error);
      return res.status(500).json({ error: `Failed to fetch custom fields: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}