import { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Tag, TagMap } from '../../../types/tag';
import { timestampToDate } from '../../../utils/timestampUtils';
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

  if (req.method === 'GET') {
    try {
      const tagsRef = doc(db, `users/${userId}/metadata/tags`);
      const tagsDoc = await getDoc(tagsRef);

      if (!tagsDoc.exists()) {
        await setDoc(tagsRef, { tagMap: {} });
        return res.status(200).json({ tagMap: {} });
      }

      const tagData: TagMap = tagsDoc.data().tagMap;
      const tagMap: TagMap = {};

      if (tagData) {
        Object.entries(tagData).forEach(([tagId, tag]: [string, Tag]) => {
          if (!tag || typeof tag !== 'object') return;

          tagMap[tagId] = {
            id: tagId,
            name: tag.name,
            color: tag.color || getRandomTailwindColor().tailwindColorName,
            count: Math.max(tag.count || 0, 0), // sometimes there is negative glitches
            timestamps: {
              createdAt: timestampToDate(tag.timestamps?.createdAt),
              updatedAt: timestampToDate(tag.timestamps?.updatedAt),
              deletedAt: timestampToDate(tag.timestamps?.deletedAt),
            },
          };
        });
      }

      return res.status(200).json({ tagMap });
    } catch (error) {
      console.error('[API] Error fetching tags:', error);
      return res.status(500).json({ error: `Failed to fetch tags: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
