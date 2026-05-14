import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name?: string;
  avatar_url?: string;
  github_id?: string;
  github_login?: string;
  github_avatar?: string;
  github_access_token?: string;
  github_connected: boolean;
  github_profile_url?: string;
  github_public_repos?: number;
  github_followers?: number;
  github_following?: number;
  github_connected_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    avatar_url: {
      type: String,
    },
    github_id: {
      type: String,
      unique: true,
      sparse: true,
    },
    github_login: {
      type: String,
    },
    github_avatar: {
      type: String,
    },
    github_access_token: {
      type: String,
    },
    github_connected: {
      type: Boolean,
      default: false,
    },
    github_profile_url: {
      type: String,
    },
    github_public_repos: {
      type: Number,
      default: 0,
    },
    github_followers: {
      type: Number,
      default: 0,
    },
    github_following: {
      type: Number,
      default: 0,
    },
    github_connected_at: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
