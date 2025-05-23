import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';
import { Settings } from '../../../types/settings';
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

  if (req.method === 'PATCH') {
    try {
      const { key, value } = req.body;

      if (!key || value === undefined) {
        return res.status(400).json({ error: 'Key and value are required' });
      }

      // Get current settings
      const settingsRef = adminDb.doc(`users/${userId}/metadata/settings`);
      const settingsDoc = await settingsRef.get();

      if (!settingsDoc.exists) {
        return res.status(404).json({ error: 'Settings not found' });
      }

      const settingsData = settingsDoc.data();
      const currentSettings = settingsData?.settings as Settings;

      if (!currentSettings) {
        return res.status(404).json({ error: 'Settings data not found' });
      }

      // Update the specific setting
      const newSettings: Settings = {
        ...currentSettings,
        [key]: value,
        timestamps: {
          ...currentSettings.timestamps,
          updatedAt: Timestamp.fromDate(new Date()),
        },
      };

      await settingsRef.update({
        settings: newSettings,
      });

      return res.status(200).json({
        settings: newSettings,
        message: 'Setting updated successfully',
      });
    } catch (error) {
      console.error('[API] Error updating setting:', error);
      return res
        .status(500)
        .json({ error: `Failed to update setting: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
