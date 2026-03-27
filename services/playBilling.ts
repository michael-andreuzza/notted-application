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
import { ANDROID_PREMIUM_PRODUCT_ID, PREMIUM_PRODUCT_IDS } from "@/constants/billing";
import { useNoteStore } from "@/stores/noteStore";

let initialized = false;
let connecting: Promise<boolean> | null = null;
let purchaseUpdatedSub: { remove: () => void } | null = null;
let purchaseErrorSub: { remove: () => void } | null = null;

const isPremiumPurchase = (purchase: Purchase): boolean => {
  if (purchase.productId === ANDROID_PREMIUM_PRODUCT_ID) {
    return true;
  }

  return Array.isArray(purchase.productIds)
    ? purchase.productIds.includes(ANDROID_PREMIUM_PRODUCT_ID)
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
  if (Platform.OS !== "android") {
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
  if (Platform.OS !== "android") {
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

  if (Platform.OS === "android") {
    try {
      await endConnection();
    } catch (error) {
      console.warn("Failed ending Play Billing connection", error);
    }
  }
};

export const getPremiumProduct = async (): Promise<Product | null> => {
  if (Platform.OS !== "android") {
    return null;
  }

  const connected = await ensureConnection();
  if (!connected) {
    return null;
  }

  const products = await fetchProducts({ skus: PREMIUM_PRODUCT_IDS, type: "in-app" });
  return products[0] ?? null;
};

export const startPremiumPurchase = async (): Promise<boolean> => {
  if (Platform.OS !== "android") {
    return false;
  }

  const connected = await ensureConnection();
  if (!connected) {
    return false;
  }

  const result = await requestPurchase({
    request: {
      google: { skus: [ANDROID_PREMIUM_PRODUCT_ID] },
    },
    type: "in-app",
  });

  if (result) {
    const purchases = Array.isArray(result) ? result : [result];
    await Promise.all(purchases.map((purchase) => completePremiumPurchase(purchase)));
  }

  return true;
};

export const restorePremiumFromPlay = async (): Promise<boolean> => {
  if (Platform.OS !== "android") {
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
