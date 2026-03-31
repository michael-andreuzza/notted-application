import {
  endConnection,
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  type Product,
  type Purchase,
} from "react-native-iap";
import { Platform } from "react-native";
import {
  ANDROID_PREMIUM_PRODUCT_ID,
  IOS_PREMIUM_PRODUCT_ID,
  isPremiumProductId,
} from "@/constants/billing";
import { useNoteStore } from "@/stores/noteStore";

let initialized = false;
let connecting: Promise<boolean> | null = null;
let purchaseUpdatedSub: { remove: () => void } | null = null;
let purchaseErrorSub: { remove: () => void } | null = null;

const isPremiumPurchase = (purchase: Purchase): boolean => {
  if (isPremiumProductId(purchase.productId)) {
    return true;
  }

  return Array.isArray(purchase.productIds)
    ? purchase.productIds.some((productId) => isPremiumProductId(productId))
    : false;
};

const completePremiumPurchase = async (purchase: Purchase): Promise<void> => {
  if (!isPremiumPurchase(purchase)) {
    return;
  }

  useNoteStore.getState().setPremium(true);

  try {
    await finishTransaction({ purchase, isConsumable: false });
  } catch (error) {
    // Keep unlock state; finish can fail if already acknowledged.
    console.warn("Failed finishing transaction", error);
  }
};

const ensureConnection = async (): Promise<boolean> => {
  if (Platform.OS !== "android" && Platform.OS !== "ios") {
    return false;
  }

  if (initialized) {
    return true;
  }

  if (!connecting) {
    connecting = initConnection();
  }

  try {
    const connected = await connecting;
    initialized = connected;
    return connected;
  } finally {
    connecting = null;
  }
};

export const initPlayBilling = async (): Promise<void> => {
  if (Platform.OS !== "android" && Platform.OS !== "ios") {
    return;
  }

  const connected = await ensureConnection();
  if (!connected) {
    return;
  }

  if (!purchaseUpdatedSub) {
    purchaseUpdatedSub = purchaseUpdatedListener(async (purchase) => {
      await completePremiumPurchase(purchase);
    });
  }

  if (!purchaseErrorSub) {
    purchaseErrorSub = purchaseErrorListener((error) => {
      console.warn("Play Billing error", error);
    });
  }
};

export const teardownPlayBilling = async (): Promise<void> => {
  purchaseUpdatedSub?.remove();
  purchaseUpdatedSub = null;
  purchaseErrorSub?.remove();
  purchaseErrorSub = null;
  initialized = false;
  connecting = null;

  if (Platform.OS === "android" || Platform.OS === "ios") {
    try {
      await endConnection();
    } catch (error) {
      console.warn("Failed ending Play Billing connection", error);
    }
  }
};

export const getPremiumProduct = async (): Promise<Product | null> => {
  const productId =
    Platform.OS === "android"
      ? ANDROID_PREMIUM_PRODUCT_ID
      : Platform.OS === "ios"
        ? IOS_PREMIUM_PRODUCT_ID
        : null;

  if (!productId) {
    return null;
  }

  const connected = await ensureConnection();
  if (!connected) {
    return null;
  }

  const products = await fetchProducts({ skus: [productId], type: "in-app" });
  return products[0] ?? null;
};

export const startPremiumPurchase = async (): Promise<boolean> => {
  if (Platform.OS !== "android" && Platform.OS !== "ios") {
    return false;
  }

  const connected = await ensureConnection();
  if (!connected) {
    return false;
  }

  const request =
    Platform.OS === "android"
      ? { google: { skus: [ANDROID_PREMIUM_PRODUCT_ID] } }
      : { apple: { sku: IOS_PREMIUM_PRODUCT_ID } };

  const result = await requestPurchase({
    request,
    type: "in-app",
  });

  if (result) {
    const purchases = Array.isArray(result) ? result : [result];
    await Promise.all(purchases.map((purchase) => completePremiumPurchase(purchase)));
  }

  return true;
};

export const restorePremiumFromStore = async (): Promise<boolean> => {
  if (Platform.OS !== "android" && Platform.OS !== "ios") {
    return false;
  }

  const connected = await ensureConnection();
  if (!connected) {
    return false;
  }

  const purchases = await getAvailablePurchases();
  const premiumPurchases = purchases.filter(isPremiumPurchase);

  if (premiumPurchases.length === 0) {
    return false;
  }

  await Promise.all(premiumPurchases.map((purchase) => completePremiumPurchase(purchase)));
  return true;
};

// Backwards compatibility for existing imports while migrating call sites.
export const restorePremiumFromPlay = restorePremiumFromStore;
