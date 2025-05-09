import { NextApiRequest, NextApiResponse } from 'next';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../lib/firebase-admin';
import { Job } from '../../../types/job';

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
      const { tagId } = req.body;

      if (!tagId) {
        return res.status(400).json({ error: 'Tag ID is required' });
      }

      const tagsRef = adminDb.doc(`users/${userId}/metadata/tags`);

      if (!tagsRef) {
        throw new Error('Tags document not found');
      }

      // 1. Delete the tag from the tags document
      await tagsRef.update({
        [`tagMap.${tagId}`]: FieldValue.delete(),
      });

      // 2. Find all jobs with this tag and remove it from their tagIds array
      const jobsRef = adminDb.collection(`users/${userId}/jobs`);
      const jobsSnapshot = await jobsRef.get();
      
      let updatedJobsCount = 0;
      
      if (!jobsSnapshot.empty) {
        const batch = adminDb.batch();
        
        jobsSnapshot.forEach(doc => {
          const jobData = doc.data() as Job;
          
          if (jobData.tagIds && jobData.tagIds.includes(tagId)) {
            // Remove the tag from the job's tagIds array
            const updatedTagIds = jobData.tagIds.filter(id => id !== tagId);
            
            batch.update(doc.ref, { 
              tagIds: updatedTagIds,
              timestamps: {
                ...jobData.timestamps,
                updatedAt: new Date()
              }
            });
            
            updatedJobsCount++;
          }
        });
        
        if (updatedJobsCount > 0) {
          await batch.commit();
        }
      }

      return res.status(200).json({
        tagId,
        message: 'Tag deleted successfully and removed from all jobs',
        jobsUpdated: updatedJobsCount
      });
    } catch (error) {
      console.error(`[API] Error deleting tag:`, error);
      return res.status(500).json({ error: `Failed to delete tag: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
