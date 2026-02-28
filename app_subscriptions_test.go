package main

import (
	"errors"
	"railyard/internal/types"
	"testing"

	"github.com/stretchr/testify/require"
)

func newLoadedTestApp(t *testing.T) *App {
	t.Helper()
	setEnv(t)

	app := NewApp()
	require.NoError(t, writeUserProfilesState(types.InitialProfilesState()))
	_, err := app.Profiles.loadProfiles()
	require.NoError(t, err)
	return app
}

func TestAppUpdateSubscriptionsInvokesSyncWhenForceSyncAndOperationsExist(t *testing.T) {
	app := newLoadedTestApp(t)
	callCount := 0
	app.syncSubscriptionsFn = func(profileID string, operations []types.SubscriptionOperation) error {
		callCount++
		require.Equal(t, types.DefaultProfileID, profileID)
		require.Len(t, operations, 1)
		return nil
	}

	result, err := app.UpdateSubscriptions(types.UpdateSubscriptionsRequest{
		ProfileID: types.DefaultProfileID,
		Action:    types.SubscriptionActionSubscribe,
		Assets: map[string]types.SubscriptionUpdateItem{
			"map-a": {Type: types.AssetTypeMap, Version: types.Version("1.0.0")},
		},
		ForceSync: true,
	})
	require.NoError(t, err)
	require.Len(t, result.Operations, 1)
	require.Equal(t, 1, callCount)
}

func TestAppUpdateSubscriptionsDoesNotInvokeSyncWhenForceSyncIsFalse(t *testing.T) {
	app := newLoadedTestApp(t)
	callCount := 0
	app.syncSubscriptionsFn = func(profileID string, operations []types.SubscriptionOperation) error {
		callCount++
		return nil
	}

	result, err := app.UpdateSubscriptions(types.UpdateSubscriptionsRequest{
		ProfileID: types.DefaultProfileID,
		Action:    types.SubscriptionActionSubscribe,
		Assets: map[string]types.SubscriptionUpdateItem{
			"mod-a": {Type: types.AssetTypeMod, Version: types.Version("1.0.0")},
		},
		ForceSync: false,
	})
	require.NoError(t, err)
	require.Len(t, result.Operations, 1)
	require.Equal(t, 0, callCount)
}

func TestAppUpdateSubscriptionsBubblesSyncError(t *testing.T) {
	app := newLoadedTestApp(t)
	syncErr := errors.New("sync failed")
	app.syncSubscriptionsFn = func(profileID string, operations []types.SubscriptionOperation) error {
		return syncErr
	}

	result, err := app.UpdateSubscriptions(types.UpdateSubscriptionsRequest{
		ProfileID: types.DefaultProfileID,
		Action:    types.SubscriptionActionSubscribe,
		Assets: map[string]types.SubscriptionUpdateItem{
			"map-a": {Type: types.AssetTypeMap, Version: types.Version("2.0.0")},
		},
		ForceSync: true,
	})
	require.ErrorIs(t, err, syncErr)
	require.Len(t, result.Operations, 1)
	require.Equal(t, types.DefaultProfileID, result.Profile.ID)
}
