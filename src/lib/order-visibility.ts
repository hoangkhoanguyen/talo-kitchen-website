export const TALO_KITCHEN_USERNAME = "talo_kitchen";

export function isTaloKitchen(username?: string | null) {
  return username === TALO_KITCHEN_USERNAME;
}
