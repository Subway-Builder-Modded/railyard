package main

import (
	"bufio"
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/config"
	"github.com/go-git/go-git/v5/plumbing"
	githttp "github.com/go-git/go-git/v5/plumbing/transport/http"
)

const registryRepoURL = "https://github.com/Subway-Builder-Modded/The-Railyard"

// UpdateConfig describes how a mod or map receives updates.
type UpdateConfig struct {
	Type string `json:"type"`
	Repo string `json:"repo,omitempty"`
	URL  string `json:"url,omitempty"`
}

// ModManifest is the manifest schema for a mod entry in the registry.
type ModManifest struct {
	SchemaVersion int          `json:"schema_version"`
	ID            string       `json:"id"`
	Name          string       `json:"name"`
	Author        string       `json:"author"`
	GithubID      int          `json:"github_id"`
	Description   string       `json:"description"`
	Tags          []string     `json:"tags"`
	Gallery       []string     `json:"gallery"`
	Source        string       `json:"source"`
	Update        UpdateConfig `json:"update"`
}

// MapManifest is the manifest schema for a map entry in the registry.
type MapManifest struct {
	SchemaVersion int          `json:"schema_version"`
	ID            string       `json:"id"`
	Name          string       `json:"name"`
	Author        string       `json:"author"`
	GithubID      int          `json:"github_id"`
	CityCode      string       `json:"city_code"`
	Country       string       `json:"country"`
	Population    int          `json:"population"`
	Description   string       `json:"description"`
	Tags          []string     `json:"tags"`
	Gallery       []string     `json:"gallery"`
	Source        string       `json:"source"`
	Update        UpdateConfig `json:"update"`
}

// IndexFile represents the top-level index.json in the mods/ or maps/ directory.
type IndexFile struct {
	SchemaVersion int      `json:"schema_version"`
	Mods          []string `json:"mods,omitempty"`
	Maps          []string `json:"maps,omitempty"`
}

// VersionInfo represents a single release version for a mod or map.
type VersionInfo struct {
	Version     string `json:"version"`
	Name        string `json:"name"`
	Changelog   string `json:"changelog"`
	Date        string `json:"date"`
	DownloadURL string `json:"download_url"`
	GameVersion string `json:"game_version"`
	SHA256      string `json:"sha256"`
	Downloads   int    `json:"downloads"`
}

// githubRelease maps fields from the GitHub Releases API response.
type githubRelease struct {
	TagName     string        `json:"tag_name"`
	Name        string        `json:"name"`
	Body        string        `json:"body"`
	PublishedAt string        `json:"published_at"`
	Assets      []githubAsset `json:"assets"`
}

type githubAsset struct {
	Name               string `json:"name"`
	BrowserDownloadURL string `json:"browser_download_url"`
	DownloadCount      int    `json:"download_count"`
}

// customUpdateFile maps the custom update.json schema.
type customUpdateFile struct {
	SchemaVersion int                   `json:"schema_version"`
	Versions      []customUpdateVersion `json:"versions"`
}

type customUpdateVersion struct {
	Version     string `json:"version"`
	GameVersion string `json:"game_version"`
	Date        string `json:"date"`
	Changelog   string `json:"changelog"`
	Download    string `json:"download"`
	SHA256      string `json:"sha256"`
}

// Registry manages the local clone of The Railyard registry repository.
type Registry struct {
	repoPath   string
	httpClient *http.Client
}

// NewRegistry creates a new Registry instance with the platform-appropriate
// storage path.
func NewRegistry() *Registry {
	configDir, err := os.UserConfigDir()
	if err != nil {
		// Fallback to home directory if UserConfigDir fails
		home, _ := os.UserHomeDir()
		configDir = home
	}
	return &Registry{
		repoPath: filepath.Join(configDir, "railyard", "registry"),
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

// Initialize clones the registry repo if it doesn't exist locally, or
// fetches and hard-resets to origin/main if it does. This should be called
// on app startup.
func (r *Registry) Initialize() error {
	return r.cloneOrUpdate()
}

// Refresh forces a pull of the latest registry changes.
func (r *Registry) Refresh() error {
	return r.cloneOrUpdate()
}

// cloneOrUpdate handles clone-if-missing and fetch+reset-if-exists logic.
func (r *Registry) cloneOrUpdate() error {
	// Try to open the existing repo
	repo, err := git.PlainOpen(r.repoPath)
	if err != nil {
		// Directory doesn't exist or isn't a valid git repo -- (re)clone
		return r.forceClone()
	}

	// Repo exists, try to fetch + hard reset
	err = r.fetchAndReset(repo)
	if err != nil {
		// If fetch/reset fails the repo may be corrupted -- delete and re-clone
		return r.forceClone()
	}
	return nil
}

// getCredentials uses the system's git credential helper to resolve
// credentials for the registry repo URL. Returns nil auth if no
// credentials are found (for public repos).
func (r *Registry) getCredentials() *githttp.BasicAuth {
	parsed, err := url.Parse(registryRepoURL)
	if err != nil {
		return nil
	}

	input := fmt.Sprintf("protocol=%s\nhost=%s\npath=%s\n\n", parsed.Scheme, parsed.Host, strings.TrimPrefix(parsed.Path, "/"))

	cmd := exec.Command("git", "credential", "fill")
	cmd.Stdin = strings.NewReader(input)
	var out bytes.Buffer
	cmd.Stdout = &out
	if err := cmd.Run(); err != nil {
		return nil
	}

	var username, password string
	scanner := bufio.NewScanner(&out)
	for scanner.Scan() {
		line := scanner.Text()
		if k, v, ok := strings.Cut(line, "="); ok {
			switch k {
			case "username":
				username = v
			case "password":
				password = v
			}
		}
	}

	if username != "" && password != "" {
		return &githttp.BasicAuth{
			Username: username,
			Password: password,
		}
	}
	return nil
}

// forceClone removes any existing directory and performs a fresh clone.
func (r *Registry) forceClone() error {
	// Remove existing directory if present
	if err := os.RemoveAll(r.repoPath); err != nil {
		return fmt.Errorf("failed to remove existing registry directory: %w", err)
	}

	// Ensure parent directory exists
	parent := filepath.Dir(r.repoPath)
	if err := os.MkdirAll(parent, 0755); err != nil {
		return fmt.Errorf("failed to create registry parent directory: %w", err)
	}

	cloneOpts := &git.CloneOptions{
		URL:           registryRepoURL,
		ReferenceName: plumbing.NewBranchReferenceName("main"),
		SingleBranch:  true,
		Depth:         1,
	}
	if auth := r.getCredentials(); auth != nil {
		cloneOpts.Auth = auth
	}

	_, err := git.PlainClone(r.repoPath, false, cloneOpts)
	if err != nil {
		return fmt.Errorf("failed to clone registry repo: %w", err)
	}

	return nil
}

// fetchAndReset fetches from origin and hard-resets the working tree to
// origin/main.
func (r *Registry) fetchAndReset(repo *git.Repository) error {
	// Fetch with force
	fetchOpts := &git.FetchOptions{
		RemoteName: "origin",
		RefSpecs: []config.RefSpec{
			"+refs/heads/main:refs/remotes/origin/main",
		},
		Force: true,
	}
	if auth := r.getCredentials(); auth != nil {
		fetchOpts.Auth = auth
	}
	err := repo.Fetch(fetchOpts)
	if err != nil && err != git.NoErrAlreadyUpToDate {
		return fmt.Errorf("failed to fetch registry: %w", err)
	}

	// Resolve origin/main
	ref, err := repo.Reference(plumbing.NewRemoteReferenceName("origin", "main"), true)
	if err != nil {
		return fmt.Errorf("failed to resolve origin/main: %w", err)
	}

	// Get the worktree and hard reset
	wt, err := repo.Worktree()
	if err != nil {
		return fmt.Errorf("failed to get worktree: %w", err)
	}

	err = wt.Reset(&git.ResetOptions{
		Commit: ref.Hash(),
		Mode:   git.HardReset,
	})
	if err != nil {
		return fmt.Errorf("failed to reset to origin/main: %w", err)
	}

	return nil
}

// GetMods reads the mods index and returns all mod manifests.
func (r *Registry) GetMods() ([]ModManifest, error) {
	indexPath := filepath.Join(r.repoPath, "mods", "index.json")
	indexData, err := os.ReadFile(indexPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read mods index: %w", err)
	}

	var index IndexFile
	if err := json.Unmarshal(indexData, &index); err != nil {
		return nil, fmt.Errorf("failed to parse mods index: %w", err)
	}

	mods := make([]ModManifest, 0, len(index.Mods))
	for _, modID := range index.Mods {
		manifestPath := filepath.Join(r.repoPath, "mods", modID, "manifest.json")
		data, err := os.ReadFile(manifestPath)
		if err != nil {
			return nil, fmt.Errorf("failed to read manifest for mod %q: %w", modID, err)
		}

		var manifest ModManifest
		if err := json.Unmarshal(data, &manifest); err != nil {
			return nil, fmt.Errorf("failed to parse manifest for mod %q: %w", modID, err)
		}
		mods = append(mods, manifest)
	}

	return mods, nil
}

// GetMaps reads the maps index and returns all map manifests.
func (r *Registry) GetMaps() ([]MapManifest, error) {
	indexPath := filepath.Join(r.repoPath, "maps", "index.json")
	indexData, err := os.ReadFile(indexPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read maps index: %w", err)
	}

	var index IndexFile
	if err := json.Unmarshal(indexData, &index); err != nil {
		return nil, fmt.Errorf("failed to parse maps index: %w", err)
	}

	maps := make([]MapManifest, 0, len(index.Maps))
	for _, mapID := range index.Maps {
		manifestPath := filepath.Join(r.repoPath, "maps", mapID, "manifest.json")
		data, err := os.ReadFile(manifestPath)
		if err != nil {
			return nil, fmt.Errorf("failed to read manifest for map %q: %w", mapID, err)
		}

		var manifest MapManifest
		if err := json.Unmarshal(data, &manifest); err != nil {
			return nil, fmt.Errorf("failed to parse manifest for map %q: %w", mapID, err)
		}
		maps = append(maps, manifest)
	}

	return maps, nil
}

// GetGalleryImage reads an image file from the cloned registry repo and
// returns it as a base64 data URL suitable for use in an <img> src attribute.
//
// itemType should be "mods" or "maps".
// itemID is the mod/map identifier.
// imagePath is the relative image path as listed in the manifest's gallery field.
func (r *Registry) GetGalleryImage(itemType string, itemID string, imagePath string) (string, error) {
	// Sanitize inputs to prevent path traversal
	if strings.Contains(itemType, "..") || strings.Contains(itemID, "..") || strings.Contains(imagePath, "..") {
		return "", fmt.Errorf("invalid path component: path traversal not allowed")
	}

	fullPath := filepath.Join(r.repoPath, itemType, itemID, imagePath)

	data, err := os.ReadFile(fullPath)
	if err != nil {
		return "", fmt.Errorf("failed to read gallery image %q: %w", fullPath, err)
	}

	// Detect MIME type from file extension
	mimeType := mimeFromExtension(filepath.Ext(fullPath))

	encoded := base64.StdEncoding.EncodeToString(data)
	return fmt.Sprintf("data:%s;base64,%s", mimeType, encoded), nil
}

// mimeFromExtension returns the MIME type for common image file extensions.
func mimeFromExtension(ext string) string {
	switch strings.ToLower(ext) {
	case ".png":
		return "image/png"
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	case ".svg":
		return "image/svg+xml"
	case ".bmp":
		return "image/bmp"
	case ".ico":
		return "image/x-icon"
	default:
		return "application/octet-stream"
	}
}

// GetVersions fetches available versions for a mod or map.
// updateType must be "github" or "custom".
// repoOrURL is "owner/repo" for github, or a URL for custom.
func (r *Registry) GetVersions(updateType string, repoOrURL string) ([]VersionInfo, error) {
	switch updateType {
	case "github":
		return r.getGitHubVersions(repoOrURL)
	case "custom":
		return r.getCustomVersions(repoOrURL)
	default:
		return nil, fmt.Errorf("unsupported update type: %q", updateType)
	}
}

func (r *Registry) getGitHubVersions(repo string) ([]VersionInfo, error) {
	parts := strings.SplitN(repo, "/", 2)
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return nil, fmt.Errorf("invalid GitHub repo format %q: expected \"owner/repo\"", repo)
	}

	apiURL := fmt.Sprintf("https://api.github.com/repos/%s/releases", repo)
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create GitHub API request: %w", err)
	}
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "Railyard-Desktop-App")

	resp, err := r.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch GitHub releases for %q: %w", repo, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API returned status %d for %q", resp.StatusCode, repo)
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, 5*1024*1024))
	if err != nil {
		return nil, fmt.Errorf("failed to read GitHub API response: %w", err)
	}

	var releases []githubRelease
	if err := json.Unmarshal(body, &releases); err != nil {
		return nil, fmt.Errorf("failed to parse GitHub releases JSON: %w", err)
	}

	versions := make([]VersionInfo, 0, len(releases))
	for _, rel := range releases {
		v := VersionInfo{
			Version:   rel.TagName,
			Name:      rel.Name,
			Changelog: rel.Body,
			Date:      rel.PublishedAt,
		}
		for _, asset := range rel.Assets {
			v.Downloads += asset.DownloadCount
		}
		if len(rel.Assets) > 0 {
			v.DownloadURL = rel.Assets[0].BrowserDownloadURL
		}
		versions = append(versions, v)
	}

	return versions, nil
}

func (r *Registry) getCustomVersions(updateURL string) ([]VersionInfo, error) {
	parsed, err := url.Parse(updateURL)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		return nil, fmt.Errorf("invalid custom update URL %q: must be http or https", updateURL)
	}

	req, err := http.NewRequest("GET", updateURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request for custom update URL: %w", err)
	}
	req.Header.Set("User-Agent", "Railyard-Desktop-App")

	resp, err := r.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch custom update from %q: %w", updateURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("custom update URL returned status %d for %q", resp.StatusCode, updateURL)
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, 2*1024*1024))
	if err != nil {
		return nil, fmt.Errorf("failed to read custom update response: %w", err)
	}

	var updateFile customUpdateFile
	if err := json.Unmarshal(body, &updateFile); err != nil {
		return nil, fmt.Errorf("failed to parse custom update JSON: %w", err)
	}

	versions := make([]VersionInfo, 0, len(updateFile.Versions))
	for _, v := range updateFile.Versions {
		versions = append(versions, VersionInfo{
			Version:     v.Version,
			Name:        v.Version,
			Changelog:   v.Changelog,
			Date:        v.Date,
			DownloadURL: v.Download,
			GameVersion: v.GameVersion,
			SHA256:      v.SHA256,
		})
	}

	return versions, nil
}

// GetInstalledMods returns the IDs of locally installed mods.
// Currently stubbed to return an empty slice.
func (r *Registry) GetInstalledMods() []string {
	return []string{}
}

// GetInstalledMaps returns the IDs of locally installed maps.
// Currently stubbed to return an empty slice.
func (r *Registry) GetInstalledMaps() []string {
	return []string{}
}
