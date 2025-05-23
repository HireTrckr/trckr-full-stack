import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';
import { DEFAULT_SETTINGS, Settings } from '../../../types/settings';

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
      const settingsRef = adminDb.doc(`users/${userId}/metadata/settings`);
      const settingsDoc = await settingsRef.get();

      if (!settingsDoc.exists) {
        // Create default settings file called settings at users/uuid/metadata/settings if none exist
        await settingsRef.set(DEFAULT_SETTINGS);
        return res.status(200).json({ settings: DEFAULT_SETTINGS });
      }

      const settingsData = settingsDoc.data();

      if (!settingsData) {
        // Create default settings if data is empty
        await settingsRef.set(DEFAULT_SETTINGS);
        return res.status(200).json({ settings: DEFAULT_SETTINGS });
      }

      const settings = {
        ...DEFAULT_SETTINGS,
        ...settingsData.settings,
      } as Settings;

      return res.status(200).json({ settings });
    } catch (error) {
      console.error('[API] Error fetching settings:', error);
      return res
        .status(500)
        .json({ error: `Failed to fetch settings: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
