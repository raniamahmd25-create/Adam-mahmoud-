import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  increment,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { StoreItem, Rating, Comment, Report, ContentType } from '../types';
import { useAuth } from './AuthContext';
import { initiateBrowserDownload } from '../lib/downloadHelper';

interface PublishItemData {
  title: string;
  type: ContentType;
  category: string;
  description: string;
  downloadUrl: string;
  version: string;
  imageUrl: string;
  publisherName?: string;
}

interface StoreContextType {
  items: StoreItem[];
  loading: boolean;
  error: string | null;
  reports: Report[];
  publishItem: (data: PublishItemData) => Promise<string>;
  updateItem: (id: string, data: Partial<PublishItemData>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  rateItem: (itemId: string, stars: number) => Promise<void>;
  getUserRating: (itemId: string) => Promise<number | null>;
  getItemComments: (itemId: string, callback: (comments: Comment[]) => void) => () => void;
  addComment: (itemId: string, content: string) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string, itemId: string) => Promise<void>;
  reportComment: (commentId: string, reason: string) => Promise<void>;
  reportItem: (itemId: string, reason: string, itemTitle?: string) => Promise<void>;
  recordDownload: (
    itemId: string,
    downloadUrl: string,
    title?: string,
    version?: string
  ) => Promise<{ success: boolean; directUrl: string }>;
  adminUpdateReport: (reportId: string, status: 'reviewed' | 'dismissed') => Promise<void>;
  adminDeleteReport: (reportId: string) => Promise<void>;
  toggleFeaturedItem: (itemId: string, isFeatured: boolean) => Promise<void>;
  isItemOwner: (item: StoreItem) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isAdmin } = useAuth();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to items in real-time
  useEffect(() => {
    const itemsCol = collection(db, 'items');
    const unsubscribe = onSnapshot(
      itemsCol,
      (snapshot) => {
        const fetchedItems: StoreItem[] = [];
        snapshot.forEach((docSnap) => {
          fetchedItems.push({ id: docSnap.id, ...docSnap.data() } as StoreItem);
        });
        // Sort newest first
        fetchedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setItems(fetchedItems);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching items snapshot:', err);
        setError('تعذر تحميل عناصر المتجر حالياً.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to reports if user is admin
  useEffect(() => {
    if (!isAdmin) {
      setReports([]);
      return;
    }
    const reportsCol = collection(db, 'reports');
    const unsubscribe = onSnapshot(
      reportsCol,
      (snapshot) => {
        const fetched: Report[] = [];
        snapshot.forEach((d) => fetched.push({ id: d.id, ...d.data() } as Report));
        fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReports(fetched);
      },
      (err) => {
        console.warn('Reports listen error (likely non-admin or rules):', err);
      }
    );
    return () => unsubscribe();
  }, [isAdmin]);

  // Check if current user is owner (authenticated or guest with local creation token)
  const isItemOwner = (item: StoreItem): boolean => {
    if (user && item.publisherId === user.uid) return true;
    try {
      const guestItemIds: string[] = JSON.parse(localStorage.getItem('gz_guest_item_ids') || '[]');
      if (guestItemIds.includes(item.id)) return true;
      const currentGuestId = localStorage.getItem('gz_guest_id');
      if (currentGuestId && item.publisherId === currentGuestId) return true;
    } catch {}
    return false;
  };

  // Publish a new Game or App (Login NOT required - guests can publish freely!)
  const publishItem = async (data: PublishItemData): Promise<string> => {
    // Validate direct URL
    try {
      const url = new URL(data.downloadUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('رابط التحميل يجب أن يبدأ بـ http:// أو https://');
      }
    } catch {
      throw new Error('يرجى إدخال رابط تحميل مباشر وصحيح.');
    }

    let publisherId: string;
    let publisherName: string;
    let publisherPhoto = '';

    if (user) {
      publisherId = user.uid;
      publisherName = data.publisherName?.trim() || profile?.displayName || user.displayName || 'مطور جيم زون';
      publisherPhoto = profile?.photoURL || user.photoURL || '';
    } else {
      // Guest publisher identification
      let guestId = localStorage.getItem('gz_guest_id');
      if (!guestId) {
        guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        localStorage.setItem('gz_guest_id', guestId);
      }
      publisherId = guestId;
      publisherName = data.publisherName?.trim() || 'مطور زائر';
    }

    const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newItem: StoreItem = {
      id: itemId,
      title: data.title.trim(),
      type: data.type,
      category: data.category,
      description: data.description.trim(),
      downloadUrl: data.downloadUrl.trim(),
      version: data.version.trim() || '1.0.0',
      imageUrl: data.imageUrl,
      publisherId,
      publisherName,
      publisherPhoto,
      downloadsCount: 0,
      ratingAverage: 0,
      ratingCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'items', itemId), newItem);

      // Save item ID to local guest items list for local session management
      if (!user) {
        try {
          const currentList: string[] = JSON.parse(localStorage.getItem('gz_guest_item_ids') || '[]');
          currentList.push(itemId);
          localStorage.setItem('gz_guest_item_ids', JSON.stringify(currentList));
        } catch {}
      }

      return itemId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `items/${itemId}`);
    }
  };

  // Update existing Game or App
  const updateItem = async (id: string, data: Partial<PublishItemData>): Promise<void> => {
    const itemRef = doc(db, 'items', id);
    const updates = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(itemRef, updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `items/${id}`);
    }
  };

  // Delete Game or App
  const deleteItem = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'items', id));
      // Remove from guest items if present
      try {
        const currentList: string[] = JSON.parse(localStorage.getItem('gz_guest_item_ids') || '[]');
        const updated = currentList.filter((savedId) => savedId !== id);
        localStorage.setItem('gz_guest_item_ids', JSON.stringify(updated));
      } catch {}
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `items/${id}`);
    }
  };

  // Rate an item (1 to 5 stars) - 1 rating per user per item
  const rateItem = async (itemId: string, stars: number): Promise<void> => {
    if (!user) throw new Error('يجب تسجيل الدخول لتقييم اللعبة.');
    if (stars < 1 || stars > 5) throw new Error('التقييم يجب أن يكون بين 1 و 5 نجوم.');

    const ratingId = `${itemId}_${user.uid}`;
    const ratingRef = doc(db, 'ratings', ratingId);

    const ratingPayload: Rating = {
      id: ratingId,
      itemId,
      userId: user.uid,
      userDisplayName: profile?.displayName || user.displayName || 'مستخدم',
      stars,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(ratingRef, ratingPayload);

      // Recompute average rating from all ratings for this item
      const q = query(collection(db, 'ratings'), where('itemId', '==', itemId));
      const snap = await getDocs(q);
      let totalStars = 0;
      let count = 0;
      snap.forEach((d) => {
        const r = d.data() as Rating;
        totalStars += r.stars;
        count++;
      });

      const avg = count > 0 ? parseFloat((totalStars / count).toFixed(1)) : stars;
      await updateDoc(doc(db, 'items', itemId), {
        ratingAverage: avg,
        ratingCount: count,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `ratings/${ratingId}`);
    }
  };

  // Get current user's rating for an item
  const getUserRating = async (itemId: string): Promise<number | null> => {
    if (!user) return null;
    try {
      const q = query(
        collection(db, 'ratings'),
        where('itemId', '==', itemId),
        where('userId', '==', user.uid)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const first = snap.docs[0].data() as Rating;
        return first.stars;
      }
      return null;
    } catch (err) {
      console.warn('Could not get user rating:', err);
      return null;
    }
  };

  // Subscribe to comments for a specific item
  const getItemComments = (itemId: string, callback: (comments: Comment[]) => void) => {
    const q = query(collection(db, 'comments'), where('itemId', '==', itemId));
    return onSnapshot(
      q,
      (snapshot) => {
        const comments: Comment[] = [];
        snapshot.forEach((d) => comments.push({ id: d.id, ...d.data() } as Comment));
        comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(comments);
      },
      (err) => {
        console.error('Error listening to comments:', err);
      }
    );
  };

  // Add a comment
  const addComment = async (itemId: string, content: string): Promise<void> => {
    if (!user) throw new Error('يجب تسجيل الدخول لإضافة تعليق.');
    if (!content.trim()) throw new Error('التعليق لا يمكن أن يكون فارغاً.');

    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const commentPayload: Comment = {
      id: commentId,
      itemId,
      userId: user.uid,
      userDisplayName: profile?.displayName || user.displayName || 'مستخدم جيم زون',
      userPhotoURL: profile?.photoURL || user.photoURL || '',
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isReported: false,
      reportCount: 0,
    };

    try {
      await setDoc(doc(db, 'comments', commentId), commentPayload);
      await updateDoc(doc(db, 'items', itemId), {
        commentsCount: increment(1),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `comments/${commentId}`);
    }
  };

  // Update own comment
  const updateComment = async (commentId: string, content: string): Promise<void> => {
    if (!user) throw new Error('يجب تسجيل الدخول.');
    try {
      await updateDoc(doc(db, 'comments', commentId), {
        content: content.trim(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `comments/${commentId}`);
    }
  };

  // Delete comment
  const deleteComment = async (commentId: string, itemId: string): Promise<void> => {
    if (!user) throw new Error('يجب تسجيل الدخول.');
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      await updateDoc(doc(db, 'items', itemId), {
        commentsCount: increment(-1),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `comments/${commentId}`);
    }
  };

  // Report a comment
  const reportComment = async (commentId: string, reason: string): Promise<void> => {
    if (!user) throw new Error('يجب تسجيل الدخول للإبلاغ.');
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const reportPayload: Report = {
      id: reportId,
      targetType: 'comment',
      targetId: commentId,
      reporterId: user.uid,
      reporterName: profile?.displayName || user.displayName || 'مستخدم',
      reason: reason.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'reports', reportId), reportPayload);
      await updateDoc(doc(db, 'comments', commentId), {
        isReported: true,
        reportCount: increment(1),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `reports/${reportId}`);
    }
  };

  // Report an item
  const reportItem = async (itemId: string, reason: string, itemTitle?: string): Promise<void> => {
    if (!user) throw new Error('يجب تسجيل الدخول للإبلاغ.');
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const reportPayload: Report = {
      id: reportId,
      targetType: 'item',
      targetId: itemId,
      targetTitle: itemTitle,
      reporterId: user.uid,
      reporterName: profile?.displayName || user.displayName || 'مستخدم',
      reason: reason.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'reports', reportId), reportPayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `reports/${reportId}`);
    }
  };

  // Record download and trigger native browser download manager
  // Supports repeating downloads multiple times without restrictions!
  const recordDownload = async (
    itemId: string,
    downloadUrl: string,
    title: string = 'game',
    version: string = '1.0.0'
  ): Promise<{ success: boolean; directUrl: string }> => {
    // 1. Immediately trigger native browser download into the user's browser downloads manager
    const result = await initiateBrowserDownload(downloadUrl, title, version);

    // 2. Increment download count in Firestore (with short debounce to protect against millisecond clicks)
    const storageKey = `gz_dl_last_${itemId}`;
    const lastDownloadedAt = sessionStorage.getItem(storageKey);
    const now = Date.now();
    const DEBOUNCE_MS = 2500; // 2.5 seconds debounce for DB write, while download is always triggered

    if (!lastDownloadedAt || now - parseInt(lastDownloadedAt, 10) >= DEBOUNCE_MS) {
      sessionStorage.setItem(storageKey, now.toString());

      try {
        const itemRef = doc(db, 'items', itemId);
        await updateDoc(itemRef, {
          downloadsCount: increment(1),
          updatedAt: new Date().toISOString(),
        });

        const downloadId = `dl_${now}_${Math.random().toString(36).substring(2, 8)}`;
        await setDoc(doc(db, 'downloads', downloadId), {
          id: downloadId,
          itemId,
          sessionId: sessionStorage.getItem('gz_session_id') || `sess_${now}`,
          userId: user?.uid || 'guest',
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Could not record download metric:', err);
      }
    }

    return { success: true, directUrl: result.directUrl };
  };

  // Admin moderation functions
  const adminUpdateReport = async (reportId: string, status: 'reviewed' | 'dismissed'): Promise<void> => {
    if (!isAdmin) throw new Error('صلاحية إدارة مطلوبة.');
    try {
      await updateDoc(doc(db, 'reports', reportId), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reports/${reportId}`);
    }
  };

  const adminDeleteReport = async (reportId: string): Promise<void> => {
    if (!isAdmin) throw new Error('صلاحية إدارة مطلوبة.');
    try {
      await deleteDoc(doc(db, 'reports', reportId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reports/${reportId}`);
    }
  };

  const toggleFeaturedItem = async (itemId: string, isFeatured: boolean): Promise<void> => {
    if (!isAdmin) throw new Error('صلاحية إدارة مطلوبة.');
    try {
      await updateDoc(doc(db, 'items', itemId), { isFeatured });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `items/${itemId}`);
    }
  };

  const value = useMemo(
    () => ({
      items,
      loading,
      error,
      reports,
      publishItem,
      updateItem,
      deleteItem,
      rateItem,
      getUserRating,
      getItemComments,
      addComment,
      updateComment,
      deleteComment,
      reportComment,
      reportItem,
      recordDownload,
      adminUpdateReport,
      adminDeleteReport,
      toggleFeaturedItem,
      isItemOwner,
    }),
    [items, loading, error, reports, user, profile, isAdmin]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
