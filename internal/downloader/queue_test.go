package downloader

import (
	"fmt"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"railyard/internal/types"

	"github.com/stretchr/testify/require"
)

func TestEnqueueOperationDeduplicatesByKey(t *testing.T) {
	d := &Downloader{}
	requestKey := d.operationKey(operationActionInstall, types.AssetTypeMap, "map-a", "1.0.0")
	const callers = 6

	var runCount int32
	var dedupedCount int32
	results := make([]operationResult, callers)
	var wg sync.WaitGroup

	for i := 0; i < callers; i++ {
		wg.Add(1)
		go func(index int) {
			defer wg.Done()
			result, deduped := d.enqueueOperation(requestKey, func() operationResult {
				atomic.AddInt32(&runCount, 1)
				time.Sleep(30 * time.Millisecond)
				return operationResult{
					genericResponse: types.GenericResponse{
						Status:  types.ResponseSuccess,
						Message: "ok",
					},
				}
			})
			if deduped {
				atomic.AddInt32(&dedupedCount, 1)
				return
			}
			results[index] = result
		}(i)
	}

	wg.Wait()
	require.Equal(t, int32(1), atomic.LoadInt32(&runCount))
	require.Equal(t, int32(callers-1), atomic.LoadInt32(&dedupedCount))

	successCount := 0
	for _, result := range results {
		if result.genericResponse.Status == types.ResponseSuccess {
			successCount++
			require.Equal(t, "ok", result.genericResponse.Message)
		}
	}
	require.Equal(t, 1, successCount)
}

func TestEnqueueOperationRunsSequentially(t *testing.T) {
	d := &Downloader{}
	const jobs = 5

	var runCount int32
	var activeCount int32
	var maxConcurrent int32

	recordMax := func(current int32) {
		for {
			existing := atomic.LoadInt32(&maxConcurrent)
			if current <= existing {
				return
			}
			if atomic.CompareAndSwapInt32(&maxConcurrent, existing, current) {
				return
			}
		}
	}

	var wg sync.WaitGroup
	for i := 0; i < jobs; i++ {
		key := d.operationKey(operationActionInstall, types.AssetTypeMod, fmt.Sprintf("mod-%d", i), "1.0.0")
		wg.Add(1)
		go func(requestKey string) {
			defer wg.Done()
			_, _ = d.enqueueOperation(requestKey, func() operationResult {
				atomic.AddInt32(&runCount, 1)
				current := atomic.AddInt32(&activeCount, 1)
				recordMax(current)
				time.Sleep(20 * time.Millisecond)
				atomic.AddInt32(&activeCount, -1)
				return operationResult{
					genericResponse: types.GenericResponse{
						Status:  types.ResponseSuccess,
						Message: "done",
					},
				}
			})
		}(key)
	}

	wg.Wait()
	require.Equal(t, int32(jobs), atomic.LoadInt32(&runCount))
	require.Equal(t, int32(1), atomic.LoadInt32(&maxConcurrent))
}

func TestIsValidOperationAction(t *testing.T) {
	require.True(t, isValidOperationAction(operationActionInstall))
	require.True(t, isValidOperationAction(operationActionUninstall))
	require.False(t, isValidOperationAction(operationAction("invalid")))
}

func TestOperationKeyPanicsOnInvalidAction(t *testing.T) {
	d := &Downloader{}
	require.Panics(t, func() {
		_ = d.operationKey(operationAction("invalid"), types.AssetTypeMap, "map-a", "1.0.0")
	})
}
