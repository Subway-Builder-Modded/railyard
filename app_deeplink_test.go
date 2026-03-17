package main

import (
	"testing"

	"railyard/internal/deeplink"

	"github.com/stretchr/testify/require"
	"github.com/wailsapp/wails/v2/pkg/options"
)

func TestHandleDeepLinkTargetQueuesPendingLink(t *testing.T) {
	app := &App{}

	app.HandleDeepLinkTarget(deeplink.Target{Type: "maps", ID: "amsterdam"})

	target := app.ConsumePendingDeepLink()
	require.Equal(t, map[string]string{
		"type": "maps",
		"id":   "amsterdam",
	}, target)
	require.Nil(t, app.ConsumePendingDeepLink())
}

func TestHandleDeepLinkTargetIgnoresInvalidTargets(t *testing.T) {
	app := &App{}

	app.HandleDeepLinkTarget(deeplink.Target{Type: "invalid", ID: "nope"})

	require.Nil(t, app.ConsumePendingDeepLink())
}

func TestOnSecondInstanceLaunchQueuesDeepLinkFromArgs(t *testing.T) {
	app := &App{}

	app.onSecondInstanceLaunch(options.SecondInstanceData{
		Args: []string{"railyard://open?type=mods&id=signal-pack"},
	})

	require.Equal(t, map[string]string{
		"type": "mods",
		"id":   "signal-pack",
	}, app.ConsumePendingDeepLink())
}
