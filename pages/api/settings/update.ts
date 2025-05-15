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

  if (req.method === 'PUT') {
    try {
      const settings = req.body as Settings;

      if (!settings) {
        return res.status(400).json({ error: 'Settings object is required' });
      }

      // Update the timestamp
      const updatedSettings: Settings = {
        ...settings,
        timestamps: {
          ...settings.timestamps,
          updatedAt: Timestamp.fromDate(new Date()),
        },
      };

      await adminDb.doc(`users/${userId}/metadata/settings`).update({
        settings: updatedSettings,
      });

      return res.status(200).json({
        settings: updatedSettings,
        message: 'Settings updated successfully',
      });
    } catch (error) {
      console.error('[API] Error updating settings:', error);
      return res
        .status(500)
        .json({ error: `Failed to update settings: ${error}` });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
