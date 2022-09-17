import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { Platform } from "react-native";
import uuid from "react-native-uuid";

const firebaseConfig = {
  apiKey: "AIzaSyDJx6mEac3aWqb1w4i5NoTwsVN9AbM8xLs",
  authDomain: "quickie-washie.firebaseapp.com",
  projectId: "quickie-washie",
  storageBucket: "quickie-washie.appspot.com",
  messagingSenderId: "888863628081",
  appId: "1:888863628081:web:8ad4c80afab400044eae10",
  measurementId: "G-ZT58RD29DF",
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export const uploadImage = async (
  uri: string,
  cb?: (progress: number) => void
) => {
  const newUri = Platform.OS === "ios" ? uri.replace("file://", "") : uri;
  const response = await fetch(newUri);
  const blob = await response.blob();
  const storageRef = ref(storage, `images/${uuid.v4()}.jpg`);
  const uploadTask = uploadBytesResumable(storageRef, blob);

  return await new Promise<string>((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        cb?.(progress);

        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (err) => {
        console.log("uploadImageError:", err);
        reject(err.message);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
};