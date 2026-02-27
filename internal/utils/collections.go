package utils

// OrEmptyMap returns an empty map when the input map is nil.
func OrEmptyMap[K comparable, V any](value map[K]V) map[K]V {
	if value == nil {
		return map[K]V{}
	}
	return value
}

// OrEmptySlice returns an empty slice when the input slice is nil.
func OrEmptySlice[T any](value []T) []T {
	if value == nil {
		return []T{}
	}
	return value
}
