import { Timestamp } from 'firebase/firestore';
import { timestamps } from '../types/timestamps';

type TimestampJSON = {
  _seconds: number;
  _nanoseconds: number;
};

function TimestampFromJSON(object: TimestampJSON): Timestamp {
  return new Timestamp(object._seconds, object._nanoseconds);
}

export function TimestampsFromJSON(object: {
  createdAt: any;
  updatedAt: any;
  deletedAt: any | null;
}): timestamps {
  return {
    createdAt: TimestampFromJSON(object.createdAt),
    updatedAt: TimestampFromJSON(object.updatedAt),
    deletedAt: object.deletedAt ? TimestampFromJSON(object.deletedAt) : null,
  };
}
