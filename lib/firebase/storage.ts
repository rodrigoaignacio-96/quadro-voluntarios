import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./config";

/* Upload de foto de voluntário com progresso */
export async function uploadVolunteerPhoto(
  volunteerId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const storageRef = ref(storage, `volunteers/${volunteerId}/photo`);
  const task = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(percent));
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

/* Remove foto de um voluntário */
export async function deleteVolunteerPhoto(volunteerId: string): Promise<void> {
  const storageRef = ref(storage, `volunteers/${volunteerId}/photo`);
  await deleteObject(storageRef);
}
