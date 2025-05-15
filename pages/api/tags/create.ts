import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';
import { Tag, TagNotSavedInDB } from '../../../types/tag';
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
      const tag = req.body as Partial<TagNotSavedInDB>;

      if (!tag || !tag.name) {
        return res.status(400).json({ error: 'Tag name is required' });
      }

      const newID = getIDFromName(tag.name);

      const newTag: Tag = {
        id: newID,
        name: tag.name,
        color: tag.color || getRandomTailwindColor().tailwindColorName,
        count: 0,
        timestamps: {
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
          deletedAt: null,
        },
      };

      await adminDb.doc(`users/${userId}/metadata/tags`).update({
        [`tagMap.${newID}`]: newTag,
      });

      return res.status(201).json({
        tag: newTag,
        message: 'Tag created successfully',
      });
    } catch (error) {
      console.error('[API] Error creating tag:', error);
      return res.status(500).json({ error: `Failed to create tag: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
