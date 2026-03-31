export const ANDROID_PREMIUM_PRODUCT_ID = "notted_premium_lifetime";
export const IOS_PREMIUM_PRODUCT_ID = "com.lifetime.nottedpremium.lifetime";

export const PREMIUM_PRODUCT_IDS = [
  ANDROID_PREMIUM_PRODUCT_ID,
  IOS_PREMIUM_PRODUCT_ID,
];

export const isPremiumProductId = (productId: string): boolean =>
  PREMIUM_PRODUCT_IDS.includes(productId);
