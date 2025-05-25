export interface User {
  _id: string;
  name: string;
  email?: string;
  role?: string;
  photoUrl: string;
  faceDescriptor: number[];
  createdAt: number;
}
