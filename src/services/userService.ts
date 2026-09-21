import { 
  db, 
  doc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  serverTimestamp,
  handleFirestoreError,
  OperationType
} from './firebase';
import { UploadHistoryItem } from '../types';

export interface CloudFavorite {
  userId: string;
  recipeId: string;
  title: string;
  cuisine?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface CloudScan {
  userId: string;
  scanId: string;
  dishName: string;
  confidence: number;
  createdAt: string;
}

/**
 * Save or remove favorite in Firestore and persistent storage
 */
export async function syncFavoriteToCloud(userId: string, recipeId: string, isFav: boolean, recipeTitle?: string): Promise<void> {
  // Sync to server persistent storage
  try {
    await fetch(`/api/user/${encodeURIComponent(userId)}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeId, isFav, title: recipeTitle })
    });
  } catch (serverErr) {
    console.warn('Sync favorite to server storage notice:', serverErr);
  }

  // Attempt Firestore sync if authenticated
  try {
    const favRef = doc(db, 'users', userId, 'favorites', recipeId);
    if (isFav) {
      const favData: CloudFavorite = {
        userId,
        recipeId,
        title: recipeTitle || recipeId,
        createdAt: new Date().toISOString()
      };
      await setDoc(favRef, favData);
    } else {
      await deleteDoc(favRef);
    }
  } catch (err) {
    console.warn('Sync favorite to firestore notice:', err);
  }
}

/**
 * Fetch all favorites for a user from persistent storage and Firestore
 */
export async function fetchUserFavoritesFromCloud(userId: string): Promise<string[]> {
  const idsSet = new Set<string>();

  // Fetch from server persistent storage
  try {
    const res = await fetch(`/api/user/${encodeURIComponent(userId)}/favorites`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.favorites)) {
        data.favorites.forEach((id: string) => idsSet.add(id));
      }
    }
  } catch (serverErr) {
    console.warn('Fetch favorites from server storage notice:', serverErr);
  }

  // Fetch from Firestore
  try {
    const favsCollectionRef = collection(db, 'users', userId, 'favorites');
    const snapshot = await getDocs(favsCollectionRef);
    snapshot.forEach((d) => {
      idsSet.add(d.id);
    });
  } catch (err) {
    console.warn('Fetch user favorites notice:', err);
  }

  return Array.from(idsSet);
}

/**
 * Save food scan to persistent storage and Firestore
 */
export async function saveScanToCloud(userId: string, scan: UploadHistoryItem): Promise<void> {
  // Save to server storage
  try {
    await fetch(`/api/user/${encodeURIComponent(userId)}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scan })
    });
  } catch (serverErr) {
    console.warn('Save scan to server storage notice:', serverErr);
  }

  // Save to Firestore
  try {
    const scanRef = doc(db, 'users', userId, 'scans', scan.id);
    const scanData: CloudScan = {
      userId,
      scanId: scan.id,
      dishName: scan.topMatchName,
      confidence: scan.confidence,
      createdAt: new Date().toISOString()
    };
    await setDoc(scanRef, scanData);
  } catch (err) {
    console.warn('Save scan to cloud notice:', err);
  }
}

/**
 * Fetch scan history for a user
 */
export async function fetchUserScansFromCloud(userId: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/user/${encodeURIComponent(userId)}/scans`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.scans)) {
        return data.scans;
      }
    }
  } catch (err) {
    console.warn('Fetch user scans notice:', err);
  }
  return [];
}
