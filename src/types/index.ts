export type ContentType = 'game' | 'app';

export type GameCategory =
  | 'أكشن'
  | 'مغامرات'
  | 'سباقات'
  | 'رياضة'
  | 'استراتيجية'
  | 'ألغاز'
  | 'محاكاة'
  | 'ألعاب أخرى';

export type AppCategory =
  | 'أدوات وإنتاجية'
  | 'تواصل واجتماعي'
  | 'وسائط وفيديو'
  | 'تعليم'
  | 'تطبيقات أخرى';

export type AllCategory = GameCategory | AppCategory | 'الكل';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface StoreItem {
  id: string;
  title: string;
  type: ContentType;
  category: string;
  description: string;
  downloadUrl: string;
  version: string;
  imageUrl: string;
  publisherId: string;
  publisherName: string;
  publisherPhoto?: string;
  downloadsCount: number;
  ratingAverage: number;
  ratingCount: number;
  commentsCount: number;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  id: string;
  itemId: string;
  userId: string;
  userDisplayName: string;
  stars: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  itemId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isReported?: boolean;
  reportCount?: number;
}

export interface Report {
  id: string;
  targetType: 'item' | 'comment';
  targetId: string;
  targetTitle?: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
}

export type PageView =
  | 'home'
  | 'games'
  | 'apps'
  | 'most-downloaded'
  | 'top-rated'
  | 'publish'
  | 'item-detail'
  | 'profile'
  | 'edit-profile'
  | 'edit-item'
  | 'admin'
  | 'settings'
  | 'privacy'
  | 'contact';
