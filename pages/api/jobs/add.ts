import { NextApiRequest, NextApiResponse } from 'next';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Job, JobNotSavedInDB } from '../../../types/job';

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
      const job = req.body as JobNotSavedInDB;
      
      if (!job.statusID || !job.company || !job.position) {
        return res.status(400).json({ error: 'Missing required job fields' });
      }

      const completeJob: Job = {
        ...job,
        timestamps: {
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      } as Job;

      const docRef = await addDoc(
        collection(db, `users/${userId}/jobs`),
        completeJob
      );

      if (!docRef) {
        throw Error('Failed to add job');
      }

      return res.status(201).json({ 
        job: { ...completeJob, id: docRef.id },
        message: 'Job added successfully' 
      });
    } catch (error) {
      console.error('[API] Error adding job:', error);
      return res.status(500).json({ error: `Failed to add job: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}