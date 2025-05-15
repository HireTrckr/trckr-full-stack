import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';
import {
  CustomField,
  CustomFieldNotSavedInDB,
  CustomFieldType,
} from '../../../types/customField';
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
      const field = req.body as Partial<CustomFieldNotSavedInDB>;

      if (!field.name || !field.type) {
        return res
          .status(400)
          .json({ error: 'Field name and type are required' });
      }

      const newID = getIDFromName(field.name);

      // check there is a default value if required
      if (field.required && field.defaultValue === null) {
        return res
          .status(400)
          .json({ error: 'Default value is required for required fields' });
      }

      const newField: CustomField = {
        id: newID,
        name: field.name,
        type: field.type,
        options: field.type === CustomFieldType.SELECT ? field.options : null,
        required: field.required ?? false,
        defaultValue: field.defaultValue ?? null,
        timestamps: {
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
          deletedAt: null,
        },
      };

      const fieldsRef = adminDb.doc(`users/${userId}/metadata/customFields`);

      if (!fieldsRef) {
        throw new Error('Fields document not found');
      }

      await fieldsRef.update({
        [newField.id]: newField,
      });

      return res.status(201).json({
        field: newField,
        message: 'Field created successfully',
      });
    } catch (error) {
      console.error('[API] Error creating field:', error);
      return res
        .status(500)
        .json({ error: `Failed to create field: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
