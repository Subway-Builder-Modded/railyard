package types

import (
	"archive/zip"
	"time"
)

type FileFoundStruct struct {
	Found      bool
	FileObject *zip.File
	Required   bool
}

type ConfigData struct {
	Name             string      `json:"name"`
	Code             string      `json:"code"`
	Description      string      `json:"description"`
	Population       int         `json:"population"`
	Country          *string     `json:"country"`
	ThumbnailBbox    *[4]float64 `json:"thumbnail_bbox"`
	Creator          string      `json:"creator"`
	Version          string      `json:"version"`
	InitialViewState struct {
		Latitude  float64  `json:"latitude"`
		Longitude float64  `json:"longitude"`
		Zoom      float64  `json:"zoom"`
		Pitch     *float64 `json:"pitch"`
		Bearing   float64  `json:"bearing"`
	} `json:"initial_view_state"`
}

type CityInfo struct {
	Code         string    `yaml:"code" json:"code"`
	Name         string    `yaml:"name" json:"name"`
	Version      string    `yaml:"version" json:"version"`
	Hash         string    `yaml:"hash" json:"hash"`
	Size         int64     `yaml:"size" json:"size"`
	LastModified time.Time `yaml:"lastModified" json:"lastModified"`
	FileName     string    `yaml:"fileName" json:"fileName"`
}

// CitiesData represents the root structure of the cities YAML file
type CitiesData struct {
	Version     string              `yaml:"version" json:"version"`
	LastUpdated time.Time           `yaml:"lastUpdated" json:"lastUpdated"`
	Cities      map[string]CityInfo `yaml:"cities" json:"cities"`
}
