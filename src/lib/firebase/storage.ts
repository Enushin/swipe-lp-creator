import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadTaskSnapshot,
} from "firebase/storage";
import { getStorageInstance } from "./config";

export type UploadProgress = {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
};

export type UploadProgressCallback = (progress: UploadProgress) => void;

export async function uploadImage(file: File, path: string): Promise<string> {
  const storage = getStorageInstance();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadImageWithProgress(
  file: File,
  path: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  const storage = getStorageInstance();
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          progress,
        });
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

export async function deleteImage(path: string): Promise<void> {
  const storage = getStorageInstance();
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export async function getImageUrl(path: string): Promise<string> {
  const storage = getStorageInstance();
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

export async function listImages(path: string): Promise<string[]> {
  const storage = getStorageInstance();
  const listRef = ref(storage, path);
  const result = await listAll(listRef);
  return Promise.all(result.items.map((item) => getDownloadURL(item)));
}

export function generateImagePath(
  userId: string,
  lpId: string,
  filename: string
): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `users/${userId}/lps/${lpId}/${timestamp}_${sanitizedFilename}`;
}
