import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryConstraint,
  Timestamp,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  DocumentSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import type {
  User,
  Organization,
  Inspection,
  ChecklistItem,
  ChecklistTemplate,
  Subscription,
  InspectionFilters,
  PaginatedResponse,
} from "@/types";

// ==========================================
// Firebase Configuration
// ==========================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
    : process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Check if Firebase is configured
const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Initialize Firebase only if configured
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { auth, db, storage };

// Helper to get db with null check
function getDb(): Firestore {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized. Check your environment variables.");
  }
  return db;
}

// Helper to get storage with null check
function getStorageInstance(): FirebaseStorage {
  if (!storage) {
    throw new Error("Firebase Storage is not initialized. Check your environment variables.");
  }
  return storage;
}

// ==========================================
// Helper Functions
// ==========================================

function convertTimestamps<T extends DocumentData>(data: T): T {
  const result = { ...data };
  for (const key in result) {
    const value = result[key];
    if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
      result[key] = value.toDate() as unknown as T[typeof key];
    }
  }
  return result;
}

function toFirestoreData<T extends object>(data: T): DocumentData {
  const result: DocumentData = {};
  for (const key in data) {
    const value = data[key];
    if (value instanceof Date) {
      result[key] = Timestamp.fromDate(value);
    } else if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

// ==========================================
// Organization Functions
// ==========================================

export async function getOrganization(orgId: string): Promise<Organization | null> {
  const docRef = doc(getDb(), "orgs", orgId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as Organization;
}

export async function createOrganization(org: Omit<Organization, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const docRef = await addDoc(collection(getDb(), "orgs"), {
    ...toFirestoreData(org),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateOrganization(orgId: string, data: Partial<Organization>): Promise<void> {
  const docRef = doc(getDb(), "orgs", orgId);
  await updateDoc(docRef, {
    ...toFirestoreData(data),
    updatedAt: serverTimestamp(),
  });
}

// ==========================================
// User Functions
// ==========================================

export async function getUser(orgId: string, userId: string): Promise<User | null> {
  const docRef = doc(getDb(), "orgs", orgId, "users", userId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as User;
}

export async function getUserByEmail(email: string): Promise<{ user: User; orgId: string } | null> {
  // Search across all organizations
  const orgsSnap = await getDocs(collection(getDb(), "orgs"));
  for (const orgDoc of orgsSnap.docs) {
    const usersQuery = query(
      collection(getDb(), "orgs", orgDoc.id, "users"),
      where("email", "==", email.toLowerCase()),
      limit(1)
    );
    const usersSnap = await getDocs(usersQuery);
    if (!usersSnap.empty) {
      const userDoc = usersSnap.docs[0];
      return {
        user: { id: userDoc.id, ...convertTimestamps(userDoc.data()) } as User,
        orgId: orgDoc.id,
      };
    }
  }
  return null;
}

export async function createUser(orgId: string, user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const docRef = await addDoc(collection(getDb(), "orgs", orgId, "users"), {
    ...toFirestoreData(user),
    email: user.email.toLowerCase(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateUser(orgId: string, userId: string, data: Partial<User>): Promise<void> {
  const docRef = doc(getDb(), "orgs", orgId, "users", userId);
  await updateDoc(docRef, {
    ...toFirestoreData(data),
    updatedAt: serverTimestamp(),
  });
}

export async function getOrgUsers(orgId: string): Promise<User[]> {
  const querySnap = await getDocs(collection(getDb(), "orgs", orgId, "users"));
  return querySnap.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as User[];
}

// Alias for getOrgUsers
export const getUsers = getOrgUsers;

// ==========================================
// Inspection Functions
// ==========================================

export async function getInspection(orgId: string, inspectionId: string): Promise<Inspection | null> {
  const docRef = doc(getDb(), "orgs", orgId, "inspections", inspectionId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as Inspection;
}

export async function createInspection(
  orgId: string,
  inspection: Omit<Inspection, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(collection(getDb(), "orgs", orgId, "inspections"), {
    ...toFirestoreData(inspection),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateInspection(
  orgId: string,
  inspectionId: string,
  data: Partial<Inspection>
): Promise<void> {
  const docRef = doc(getDb(), "orgs", orgId, "inspections", inspectionId);
  await updateDoc(docRef, {
    ...toFirestoreData(data),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteInspection(orgId: string, inspectionId: string): Promise<void> {
  const docRef = doc(getDb(), "orgs", orgId, "inspections", inspectionId);
  await deleteDoc(docRef);
}

export async function getInspections(
  orgId: string,
  filters?: InspectionFilters,
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot
): Promise<PaginatedResponse<Inspection>> {
  const constraints: QueryConstraint[] = [];

  if (filters?.status?.length) {
    constraints.push(where("status", "in", filters.status));
  }
  if (filters?.riskScore?.length) {
    constraints.push(where("riskScore", "in", filters.riskScore));
  }
  if (filters?.type?.length) {
    constraints.push(where("type", "in", filters.type));
  }
  if (filters?.buyerName) {
    constraints.push(where("buyerName", "==", filters.buyerName));
  }
  if (filters?.inspectorId) {
    constraints.push(where("inspectorId", "==", filters.inspectorId));
  }

  constraints.push(orderBy("createdAt", "desc"));
  constraints.push(limit(pageSize + 1));

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const q = query(collection(getDb(), "orgs", orgId, "inspections"), ...constraints);
  const querySnap = await getDocs(q);

  const hasMore = querySnap.docs.length > pageSize;
  const items = querySnap.docs.slice(0, pageSize).map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Inspection[];

  return {
    items,
    total: items.length, // Would need a separate count query for accurate total
    page: 1,
    pageSize,
    hasMore,
  };
}

export async function getExceptionInspections(orgId: string): Promise<Inspection[]> {
  const q = query(
    collection(getDb(), "orgs", orgId, "inspections"),
    where("status", "==", "submitted"),
    where("riskScore", "in", ["red", "amber"]),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const querySnap = await getDocs(q);
  return querySnap.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Inspection[];
}

export function subscribeToExceptionInspections(
  orgId: string,
  callback: (inspections: Inspection[]) => void
): () => void {
  const q = query(
    collection(getDb(), "orgs", orgId, "inspections"),
    where("status", "==", "submitted"),
    where("riskScore", "in", ["red", "amber"]),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  return onSnapshot(q, (snapshot: QuerySnapshot) => {
    const inspections = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Inspection[];
    callback(inspections);
  });
}

// ==========================================
// Checklist Item Functions
// ==========================================

export async function getChecklistItems(orgId: string, inspectionId: string): Promise<ChecklistItem[]> {
  const q = query(
    collection(getDb(), "orgs", orgId, "inspections", inspectionId, "items"),
    orderBy("order", "asc")
  );
  const querySnap = await getDocs(q);
  return querySnap.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as ChecklistItem[];
}

export async function createChecklistItem(
  orgId: string,
  inspectionId: string,
  item: Omit<ChecklistItem, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(
    collection(getDb(), "orgs", orgId, "inspections", inspectionId, "items"),
    {
      ...toFirestoreData(item),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );
  return docRef.id;
}

export async function updateChecklistItem(
  orgId: string,
  inspectionId: string,
  itemId: string,
  data: Partial<ChecklistItem>
): Promise<void> {
  const docRef = doc(getDb(), "orgs", orgId, "inspections", inspectionId, "items", itemId);
  await updateDoc(docRef, {
    ...toFirestoreData(data),
    updatedAt: serverTimestamp(),
  });
}

export async function batchCreateChecklistItems(
  orgId: string,
  inspectionId: string,
  items: Omit<ChecklistItem, "id" | "createdAt" | "updatedAt">[]
): Promise<string[]> {
  const batch = writeBatch(getDb());
  const ids: string[] = [];

  for (const item of items) {
    const docRef = doc(collection(getDb(), "orgs", orgId, "inspections", inspectionId, "items"));
    ids.push(docRef.id);
    batch.set(docRef, {
      ...toFirestoreData(item),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  return ids;
}

// ==========================================
// Template Functions
// ==========================================

export async function getTemplates(orgId: string): Promise<ChecklistTemplate[]> {
  const querySnap = await getDocs(collection(getDb(), "orgs", orgId, "templates"));
  return querySnap.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as ChecklistTemplate[];
}

export async function getTemplate(orgId: string, templateId: string): Promise<ChecklistTemplate | null> {
  const docRef = doc(getDb(), "orgs", orgId, "templates", templateId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as ChecklistTemplate;
}

export async function createTemplate(
  orgId: string,
  template: Omit<ChecklistTemplate, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(collection(getDb(), "orgs", orgId, "templates"), {
    ...toFirestoreData(template),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// ==========================================
// Subscription Functions
// ==========================================

export async function getSubscription(orgId: string): Promise<Subscription | null> {
  const docRef = doc(getDb(), "subscriptions", orgId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return convertTimestamps(docSnap.data()) as Subscription;
}

export async function createSubscription(orgId: string, subscription: Subscription): Promise<void> {
  const docRef = doc(getDb(), "subscriptions", orgId);
  await updateDoc(docRef, toFirestoreData(subscription));
}

export async function incrementInspectionUsage(orgId: string): Promise<void> {
  const subscription = await getSubscription(orgId);
  if (subscription) {
    const docRef = doc(getDb(), "subscriptions", orgId);
    await updateDoc(docRef, {
      inspectionsUsed: subscription.inspectionsUsed + 1,
    });
  }
}

// ==========================================
// Storage Functions
// ==========================================

export async function uploadImage(
  orgId: string,
  inspectionId: string,
  file: Blob,
  filename: string
): Promise<string> {
  const path = `orgs/${orgId}/inspections/${inspectionId}/${filename}`;
  const storageRef = ref(getStorageInstance(), path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteImage(url: string): Promise<void> {
  try {
    const storageRef = ref(getStorageInstance(), url);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
  }
}

export async function uploadOrgLogo(orgId: string, file: Blob): Promise<string> {
  const path = `orgs/${orgId}/logo`;
  const storageRef = ref(getStorageInstance(), path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

// ==========================================
// Dropdown Options Functions
// ==========================================

export interface DropdownOptions {
  buyers: { name: string; code: string }[];
  articleCodes: string[];
  locations: string[];
}

export interface CustomDefect {
  code: string;
  name: string;
  category: string;
  defaultSeverity: "critical" | "major" | "minor";
}

export async function getCustomDefects(orgId: string): Promise<CustomDefect[]> {
  const docRef = doc(getDb(), "orgs", orgId, "settings", "customDefects");
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return [];
  }

  return (docSnap.data().defects || []) as CustomDefect[];
}

export async function addCustomDefect(orgId: string, defect: CustomDefect): Promise<void> {
  const docRef = doc(getDb(), "orgs", orgId, "settings", "customDefects");
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    const { setDoc } = require("firebase/firestore");
    await setDoc(docRef, { defects: [defect] });
  } else {
    const data = docSnap.data();
    const exists = data.defects?.some((d: CustomDefect) => d.code.toLowerCase() === defect.code.toLowerCase());
    if (!exists) {
      await updateDoc(docRef, { defects: [...(data.defects || []), defect] });
    }
  }
}

export async function getDropdownOptions(orgId: string): Promise<DropdownOptions> {
  const docRef = doc(getDb(), "orgs", orgId, "settings", "dropdownOptions");
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return { buyers: [], articleCodes: [], locations: [] };
  }

  return docSnap.data() as DropdownOptions;
}

export async function addBuyer(orgId: string, buyer: { name: string; code: string }): Promise<void> {
  const docRef = doc(getDb(), "orgs", orgId, "settings", "dropdownOptions");
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    await updateDoc(docRef, { buyers: [buyer], articleCodes: [], locations: [] }).catch(() => {
      // If doc doesn't exist, create it
      const { setDoc } = require("firebase/firestore");
      return setDoc(docRef, { buyers: [buyer], articleCodes: [], locations: [] });
    });
  } else {
    const data = docSnap.data() as DropdownOptions;
    const exists = data.buyers?.some(b => b.name.toLowerCase() === buyer.name.toLowerCase());
    if (!exists) {
      await updateDoc(docRef, { buyers: [...(data.buyers || []), buyer] });
    }
  }
}

export async function addArticleCode(orgId: string, code: string): Promise<void> {
  const docRef = doc(getDb(), "orgs", orgId, "settings", "dropdownOptions");
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    await updateDoc(docRef, { buyers: [], articleCodes: [code], locations: [] }).catch(() => {
      const { setDoc } = require("firebase/firestore");
      return setDoc(docRef, { buyers: [], articleCodes: [code], locations: [] });
    });
  } else {
    const data = docSnap.data() as DropdownOptions;
    const exists = data.articleCodes?.some(c => c.toLowerCase() === code.toLowerCase());
    if (!exists) {
      await updateDoc(docRef, { articleCodes: [...(data.articleCodes || []), code] });
    }
  }
}

export async function addLocation(orgId: string, location: string): Promise<void> {
  const docRef = doc(getDb(), "orgs", orgId, "settings", "dropdownOptions");
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    await updateDoc(docRef, { buyers: [], articleCodes: [], locations: [location] }).catch(() => {
      const { setDoc } = require("firebase/firestore");
      return setDoc(docRef, { buyers: [], articleCodes: [], locations: [location] });
    });
  } else {
    const data = docSnap.data() as DropdownOptions;
    const exists = data.locations?.some(l => l.toLowerCase() === location.toLowerCase());
    if (!exists) {
      await updateDoc(docRef, { locations: [...(data.locations || []), location] });
    }
  }
}

// ==========================================
// Stats Functions
// ==========================================

export async function getDashboardStats(orgId: string): Promise<{
  critical: number;
  review: number;
  clear: number;
  total: number;
}> {
  const [redQuery, amberQuery, greenQuery] = await Promise.all([
    getDocs(
      query(
        collection(getDb(), "orgs", orgId, "inspections"),
        where("status", "==", "submitted"),
        where("riskScore", "==", "red")
      )
    ),
    getDocs(
      query(
        collection(getDb(), "orgs", orgId, "inspections"),
        where("status", "==", "submitted"),
        where("riskScore", "==", "amber")
      )
    ),
    getDocs(
      query(
        collection(getDb(), "orgs", orgId, "inspections"),
        where("status", "==", "submitted"),
        where("riskScore", "==", "green")
      )
    ),
  ]);

  return {
    critical: redQuery.size,
    review: amberQuery.size,
    clear: greenQuery.size,
    total: redQuery.size + amberQuery.size + greenQuery.size,
  };
}

export async function getInspectorStats(
  orgId: string,
  inspectorId: string
): Promise<{
  drafts: number;
  todaySubmissions: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [draftsQuery, todayQuery] = await Promise.all([
    getDocs(
      query(
        collection(getDb(), "orgs", orgId, "inspections"),
        where("inspectorId", "==", inspectorId),
        where("status", "==", "draft")
      )
    ),
    getDocs(
      query(
        collection(getDb(), "orgs", orgId, "inspections"),
        where("inspectorId", "==", inspectorId),
        where("status", "==", "submitted"),
        where("submittedAt", ">=", Timestamp.fromDate(today))
      )
    ),
  ]);

  return {
    drafts: draftsQuery.size,
    todaySubmissions: todayQuery.size,
  };
}
