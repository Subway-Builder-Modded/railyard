import { SubscriptionSyncError } from "@/stores/installed-store"
import { types } from "../../wailsjs/go/models"

export interface SubscriptionSyncErrorState {
  version: string
  message: string
  errors: types.UserProfilesError[]
}

export function toSubscriptionSyncErrorState(
  err: unknown,
  version: string,
): SubscriptionSyncErrorState | null {
  if (!(err instanceof SubscriptionSyncError)) {
    return null
  }

  return {
    version,
    message: err.message,
    errors: err.profileErrors,
  }
}

export const INSTALL_SUBSCRIPTION_SYNC_FAILED_TOAST =
  "Installation failed: subscription sync failed."
