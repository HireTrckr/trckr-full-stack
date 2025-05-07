import { NextApiRequest, NextApiResponse } from 'next';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Tag, TagNotSavedInDB } from '../../../types/tag';
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
      const tag = req.body as Partial<TagNotSavedInDB>;

      if (!tag || !tag.name) {
        return res.status(400).json({ error: 'Tag name is required' });
      }

      const newID = tag.name.toLowerCase().replace(/\s/g, '-');

      const newTag: Tag = {
        id: newID,
        name: tag.name,
        color: tag.color || getRandomTailwindColor().tailwindColorName,
        count: 0,
        timestamps: {
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      };

      await updateDoc(doc(db, `users/${userId}/metadata/tags`), {
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
