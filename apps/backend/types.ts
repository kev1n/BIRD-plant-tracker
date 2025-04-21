import { User } from '@supabase/supabase-js';
import { UUID } from 'crypto';
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: User;
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
}

export interface SignupBody {
  email: string;
  password: string;
  username: string;
  firstname?: string;
  lastname?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface TokenBody {
  access_token: string;
}

export interface PasswordResetBody {
  email: string;
}

export interface UpdatePasswordBody {
  password: string;
}

export interface DatabaseError {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
}

export interface SupabaseUserMetadata {
  given_name?: string;
  family_name?: string;
  name?: string;
  [key: string]: unknown;
}

export interface ObservationBody {
  snapshotID: number;
  plantQuantity: number;
  plantID: number;
  hasBloomed?: boolean | null;
  datePlanted?: string;
}

export interface AuthObservationBody extends AuthRequest {
  body: ObservationBody;
}

export interface UpdateObservationParams {
  obsID: string;
}

export interface UpdateObservationBody {
  snapshotID?: number;
  plantQuantity?: number;
  plantID?: number;
  hasBloomed?: boolean;
  datePlanted?: string;
}

export interface Snapshot {
  userID: number;
  notes?: string;
  dateCreated: Date;
  patchID: number;
}

export interface UpdateSnapshotBody {
  dateCreated?: Date;
  notes?: Text;
  patchID?: string;
  userID?: UUID;
}

export interface Plant {
  plantCommonName: string;
  plantScientificName?: string;
  isNative?: boolean;
  subcategory?: string;
}

export interface UpdatePlantBody {
  plantCommonName?: string;
  plantScientificName?: string;
  isNative?: boolean;
  subcategory?: string;
}

export interface UpdatePatchBody {
  patchID?: string;
  latitude?: number;
  longitude?: number;
  soilType?: string;
}
