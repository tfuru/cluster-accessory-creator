import { db, storage } from '../../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  serverTimestamp, 
  deleteDoc, 
  updateDoc, 
  setDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import CreatorKitItemApi from './CreatorKitItemApi';

export interface AccessoryMetadata {
  id?: string;
  name: string;
  glbUrl: string;
  thumbnailUrl: string;
  createdAt: any;
  updatedAt: any;
  accessoryTemplateID?: string;
}

class AccessoryService {
  private static getCollectionPath(uid: string) {
    return `users/${uid}/accessories`;
  }

  public static async saveAccessory(uid: string, name: string, glb: File | Blob, thumbnail: File | Blob, accessoryId?: string) {
    const id = accessoryId || doc(collection(db, "temp")).id;
    const glbRef = ref(storage, `users/${uid}/accessories/${id}/item.glb`);
    const thumbRef = ref(storage, `users/${uid}/accessories/${id}/thumbnail.png`);

    await uploadBytes(glbRef, glb);
    await uploadBytes(thumbRef, thumbnail);

    const glbUrl = await getDownloadURL(glbRef);
    const thumbnailUrl = await getDownloadURL(thumbRef);

    const metadata: any = {
      name: name || "名称未設定",
      glbUrl,
      thumbnailUrl,
      updatedAt: serverTimestamp()
    };

    const accessoryDocRef = doc(db, this.getCollectionPath(uid), id);
    if (accessoryId) {
      await updateDoc(accessoryDocRef, metadata);
    } else {
      metadata.createdAt = serverTimestamp();
      await setDoc(accessoryDocRef, metadata);
    }

    return id;
  }

  public static async getAccessories(uid: string): Promise<AccessoryMetadata[]> {
    const q = query(collection(db, this.getCollectionPath(uid)), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AccessoryMetadata));
  }

  public static async getAccessory(uid: string, id: string): Promise<AccessoryMetadata | null> {
    const docRef = doc(db, this.getCollectionPath(uid), id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as AccessoryMetadata;
    }
    return null;
  }

  public static async deleteAccessory(uid: string, id: string) {
    // Delete files from Storage
    const glbRef = ref(storage, `users/${uid}/accessories/${id}/item.glb`);
    const thumbRef = ref(storage, `users/${uid}/accessories/${id}/thumbnail.png`);
    
    try {
      await deleteObject(glbRef);
    } catch (e) {
      console.warn("Glb file not found or already deleted", e);
    }
    
    try {
      await deleteObject(thumbRef);
    } catch (e) {
      console.warn("Thumbnail file not found or already deleted", e);
    }

    // Delete document from Firestore
    await deleteDoc(doc(db, this.getCollectionPath(uid), id));
  }

  public static async uploadToCluster(uid: string, accessory: AccessoryMetadata, onStatus?: (status: string) => void) {
    // 1. Get accessToken from user doc
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);
    const accessToken = userDocSnap.exists() ? userDocSnap.data().accessToken : null;
    
    if (!accessToken) {
      throw new Error("Creator Kit トークンが設定されていません。設定画面で登録してください。");
    }

    // 2. Fetch files from Storage URLs
    const glbResponse = await fetch(accessory.glbUrl);
    const glbBlob = await glbResponse.blob();
    const glbFile = new File([glbBlob], "item.glb", { type: "model/gltf-binary" });

    const thumbResponse = await fetch(accessory.thumbnailUrl);
    const thumbBlob = await thumbResponse.blob();
    const iconFile = new File([thumbBlob], "icon.png", { type: "image/png" });

    // 3. Upload to cluster
    return new Promise((resolve, reject) => {
      CreatorKitItemApi.uploadAccessory(accessToken, accessory.name, glbFile, iconFile, (status) => {
        if (onStatus) onStatus(status);
        if (status === "COMPLETED") resolve(status);
        if (status === "ERROR" || status === "TIMEOUT") reject(new Error(`Upload failed with status: ${status}`));
      });
    });
  }
}

export default AccessoryService;
