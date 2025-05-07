import { NextApiRequest, NextApiResponse } from 'next';
import { doc, updateDoc, deleteField, collection, getDocs, runTransaction } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get user ID from the request
  const userId = req.headers['user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized - User ID is required' });
  }

  if (req.method === 'DELETE') {
    try {
      const { fieldId } = req.body;
      
      if (!fieldId) {
        return res.status(400).json({ error: 'Field ID is required' });
      }

      const fieldsRef = doc(db, `users/${userId}/metadata/customFields`);

      if (!fieldsRef) {
        throw new Error('Fields document not found');
      }

      await updateDoc(fieldsRef, {
        [fieldId]: deleteField(),
      });

      // Also clean up field values from jobs
      const jobsRef = collection(db, `users/${userId}/jobs`);
      const jobsSnapshot = await getDocs(jobsRef);
      
      await runTransaction(db, async (transaction) => {
        jobsSnapshot.forEach((jobDoc) => {
          const jobData = jobDoc.data();
          if (jobData.customFields && jobData.customFields[fieldId]) {
            delete jobData.customFields[fieldId];
            transaction.update(jobDoc.ref, {
              customFields: jobData.customFields,
            });
          }
        });
      });

      return res.status(200).json({ 
        fieldId,
        message: 'Field deleted successfully' 
      });
    } catch (error) {
      console.error(`[API] Error deleting field:`, error);
      return res.status(500).json({ error: `Failed to delete field: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}