import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export type timestamps = {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
};
