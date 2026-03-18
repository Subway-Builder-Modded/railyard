import type { AssetType } from '@/lib/asset-types';

import { types } from '../../wailsjs/go/models';
import {
  GetActiveProfile,
  UpdateSubscriptionsToLatest,
} from '../../wailsjs/go/profiles/UserProfiles';

export interface AssetTarget {
  type: AssetType;
  id: string;
  name: string;
}

export interface PendingUpdateTarget extends AssetTarget {
  currentVersion: string;
  latestVersion: string;
}

export type PendingUpdatesByKey = Record<
  string,
  types.PendingSubscriptionUpdate
>;

export function composeAssetKey(type: AssetType, id: string): string {
  return `${type}-${id}`;
}

export function indexPendingSubscriptionUpdates(
  updates?: types.PendingSubscriptionUpdate[] | null,
): PendingUpdatesByKey {
  const byKey: PendingUpdatesByKey = {};
  for (const update of updates ?? []) {
    byKey[composeAssetKey(update.type as AssetType, update.assetId)] = update;
  }
  return byKey;
}

export function getPendingSubscriptionUpdate(
  pendingUpdatesByKey: PendingUpdatesByKey,
  type: AssetType,
  id: string,
): types.PendingSubscriptionUpdate | undefined {
  return pendingUpdatesByKey[composeAssetKey(type, id)];
}

export function toPendingUpdateTargets(
  targets: AssetTarget[],
  pendingUpdatesByKey: PendingUpdatesByKey,
): PendingUpdateTarget[] {
  return targets.flatMap((target) => {
    const pending = getPendingSubscriptionUpdate(
      pendingUpdatesByKey,
      target.type,
      target.id,
    );
    if (!pending) {
      return [];
    }
    return [
      {
        ...target,
        currentVersion: pending.currentVersion,
        latestVersion: pending.latestVersion,
      },
    ];
  });
}

export function toLatestUpdateRequestTargets(
  targets: Pick<AssetTarget, 'id' | 'type'>[],
): types.SubscriptionUpdateTarget[] {
  return targets.map(
    (target) =>
      new types.SubscriptionUpdateTarget({
        assetId: target.id,
        type: target.type,
      }),
  );
}

export async function resolveActiveProfileID(): Promise<string> {
  const activeProfileResult = await GetActiveProfile();
  if (activeProfileResult.status !== 'success') {
    throw new Error(
      activeProfileResult.message || 'Failed to resolve active profile',
    );
  }
  return activeProfileResult.profile.id;
}

export async function requestLatestSubscriptionUpdatesForActiveProfile(args: {
  apply: boolean;
  targets?: Pick<AssetTarget, 'id' | 'type'>[];
}): Promise<types.UpdateSubscriptionsResult> {
  const profileID = await resolveActiveProfileID();

  return UpdateSubscriptionsToLatest(
    new types.UpdateSubscriptionsToLatestRequest({
      profileId: profileID,
      apply: args.apply,
      targets: args.targets ? toLatestUpdateRequestTargets(args.targets) : [],
    }),
  );
}
