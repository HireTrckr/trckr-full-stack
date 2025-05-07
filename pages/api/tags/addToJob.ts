import { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Job } from '../../../types/job';
import { Tag } from '../../../types/tag';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get user ID from the request
  const userId = req.headers['user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized - User ID is required' });
  }

  if (req.method === 'POST') {
    try {
      const { jobId, tagId } = req.body;
      
      if (!jobId || !tagId) {
        return res.status(400).json({ error: 'Job ID and Tag ID are required' });
      }

      // Get the job
      const jobRef = doc(db, `users/${userId}/jobs`, jobId);
      const jobDoc = await getDoc(jobRef);
      
      if (!jobDoc.exists()) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      const job = jobDoc.data() as Job;
      
      // Check if job already has this tag
      if (job.tagIds && job.tagIds.includes(tagId)) {
        return res.status(400).json({ error: 'Job already has this tag' });
      }
      
      // Get the tag
      const tagsRef = doc(db, `users/${userId}/metadata/tags`);
      const tagsDoc = await getDoc(tagsRef);
      
      if (!tagsDoc.exists()) {
        return res.status(404).json({ error: 'Tags document not found' });
      }
      
      const tagData = tagsDoc.data();
      const tag = tagData.tagMap?.[tagId] as Tag;
      
      if (!tag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      
      // Update the job with the new tag
      const updatedTagIds = job.tagIds ? [...job.tagIds, tagId] : [tagId];
      
      await updateDoc(jobRef, {
        tagIds: updatedTagIds,
      });
      
      // Update the tag count
      const newCount = (tag.count || 0) + 1;
      
      await updateDoc(tagsRef, {
        [`tagMap.${tagId}`]: {
          ...tag,
          count: newCount,
          timestamps: {
            ...tag.timestamps,
            updatedAt: new Date(),
          },
        },
      });

      return res.status(200).json({ 
        jobId,
        tagId,
        tag: {
          ...tag,
          count: newCount,
        },
        message: 'Tag added to job successfully' 
      });
    } catch (error) {
      console.error('[API] Error adding tag to job:', error);
      return res.status(500).json({ error: `Failed to add tag to job: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}