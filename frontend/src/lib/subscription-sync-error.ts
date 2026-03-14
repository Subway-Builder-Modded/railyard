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

export function isCancellationMessage(message: string | undefined | null): boolean {
  if (!message) {
    return false;
  }
  const normalized = message.toLowerCase();
  return (
    normalized.includes("cancel") ||
    normalized.includes("superseded by newer queued request") ||
    normalized.includes("not currently installed")
  );
}

export function isCancellationSyncError(
  err: SubscriptionSyncErrorState | null | undefined,
): boolean {
  if (!err) {
    return false;
  }
  if (isCancellationMessage(err.message)) {
    return true;
  }
  return (err.errors ?? []).some((profileError) =>
    isCancellationMessage(profileError.message),
  );
}
