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

// CloneMap returns a shallow copy of the input map.
// When input is nil, it returns an empty (non-nil) map.
func CloneMap[K comparable, V any](value map[K]V) map[K]V {
	cloned := make(map[K]V, len(value))
	for k, v := range value {
		cloned[k] = v
	}
	return cloned
}
