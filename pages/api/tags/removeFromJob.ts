import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';
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
      const jobRef = adminDb.doc(`users/${userId}/jobs/${jobId}`);
      const jobDoc = await jobRef.get();
      
      if (!jobDoc.exists) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      const job = jobDoc.data() as Job;
      
      // Check if job has this tag
      if (!job.tagIds || !job.tagIds.includes(tagId)) {
        return res.status(400).json({ error: 'Job does not have this tag' });
      }
      
      // Get the tag
      const tagsRef = adminDb.doc(`users/${userId}/metadata/tags`);
      const tagsDoc = await tagsRef.get();
      
      if (!tagsDoc.exists) {
        return res.status(404).json({ error: 'Tags document not found' });
      }
      
      const tagData = tagsDoc.data();
      const tag = tagData.tagMap?.[tagId] as Tag;
      
      if (!tag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      
      // Update the job by removing the tag
      const updatedTagIds = job.tagIds.filter(id => id !== tagId);
      
      await jobRef.update({
        tagIds: updatedTagIds,
      });
      
      // Update the tag count
      const newCount = Math.max((tag.count || 0) - 1, 0);
      
      // If tag count is 0, we could delete it, but we'll just update the count
      // The deleteTag endpoint should be used for actual deletion
      await tagsRef.update({
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
        message: 'Tag removed from job successfully' 
      });
    } catch (error) {
      console.error('[API] Error removing tag from job:', error);
      return res.status(500).json({ error: `Failed to remove tag from job: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}