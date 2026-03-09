package updater

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"railyard/internal/constants"
	"railyard/internal/files"
	"railyard/internal/types"
	"runtime"
	"strings"

	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

func DownloadAndRunInstaller(downloadURL string, ctx context.Context) error {
	resp, err := http.Get(downloadURL)
	if err != nil {
		return fmt.Errorf("failed to download installer from %q: %w", downloadURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to download installer from %q: status code %d", downloadURL, resp.StatusCode)
	}

	tempFile, err := os.CreateTemp(os.TempDir(), "railyard-installer-*"+path.Ext(downloadURL))
	if err != nil {
		return fmt.Errorf("failed to create temp file for installer: %w", err)
	}

	_, err = io.Copy(tempFile, resp.Body)
	if err != nil {
		tempFile.Close()
		os.Remove(tempFile.Name())
		return fmt.Errorf("failed to save installer to temp file: %w", err)
	}

	err = tempFile.Close()
	if err != nil {
		os.Remove(tempFile.Name())
		return fmt.Errorf("failed to close temp file: %w", err)
	}

	if runtime.GOOS == "windows" || runtime.GOOS == "linux" {
		err = os.Chmod(tempFile.Name(), 0755)
		if err != nil {
			os.Remove(tempFile.Name())
			return fmt.Errorf("failed to make installer executable: %w", err)
		}
		proc, err := os.StartProcess(tempFile.Name(), []string{tempFile.Name()}, &os.ProcAttr{
			Files: []*os.File{os.Stdin, os.Stdout, os.Stderr},
		})
		if err != nil {
			os.Remove(tempFile.Name())
			return fmt.Errorf("failed to start installer: %w", err)
		}
		proc.Release()

	}
	if runtime.GOOS == "darwin" {
		// For DMG files, we can use the "open" command to launch it, which will handle mounting and running the installer inside.
		proc, err := os.StartProcess("/usr/bin/open", []string{"/usr/bin/open", tempFile.Name()}, &os.ProcAttr{
			Files: []*os.File{os.Stdin, os.Stdout, os.Stderr},
		})
		if err != nil {
			os.Remove(tempFile.Name())
			return fmt.Errorf("failed to start installer: %w", err)
		}
		proc.Release()
	}
	wailsruntime.Quit(ctx)
	return nil
}

func VersionIsNewerThanInstalled(version string) bool {
	installed := constants.RAILYARD_VERSION
	// Strip leading "v" if present for comparison
	installed = strings.TrimPrefix(installed, "v")
	version = strings.TrimPrefix(version, "v")

	installedParts := strings.Split(installed, ".")
	versionParts := strings.Split(version, ".")

	for i := 0; i < len(installedParts) && i < len(versionParts); i++ {
		if versionParts[i] > installedParts[i] {
			return true
		}
	}
	return false
}

func CheckForUpdates() ([]types.RailyardVersionInfo, error) {
	apiURL := fmt.Sprintf("https://api.github.com/repos/%s/releases", constants.RAILYARD_REPO)
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create GitHub API request: %w", err)
	}

	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "Railyard-Desktop-App")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch GitHub releases for %q: %w", constants.RAILYARD_REPO, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API returned status %d for %q", resp.StatusCode, constants.RAILYARD_REPO)
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, 5*1024*1024))
	if err != nil {
		return nil, fmt.Errorf("failed to read GitHub API response: %w", err)
	}

	releases, err := files.ParseJSON[[]types.GithubRelease](body, "releases")
	if err != nil {
		return nil, fmt.Errorf("failed to parse GitHub releases JSON: %w", err)
	}

	versions := make([]types.RailyardVersionInfo, 0, len(releases))
	for _, rel := range releases {
		v := types.RailyardVersionInfo{
			Version:    rel.TagName,
			Name:       rel.Name,
			Changelog:  rel.Body,
			Date:       rel.PublishedAt,
			Prerelease: rel.Prerelease,
		}
		for _, asset := range rel.Assets {
			if strings.Contains(asset.Name, "amd64.AppImage") {
				v.LinuxDownloadURL = asset.BrowserDownloadURL
			}
			if strings.Contains(asset.Name, "macos-universal.dmg") {
				v.MacOSDownloadURL = asset.BrowserDownloadURL
			}
			if strings.Contains(asset.Name, "amd64-installer.exe") {
				v.WindowsX64DownloadURL = asset.BrowserDownloadURL
			}
			if strings.Contains(asset.Name, "arm64-installer.exe") {
				v.WindowsARMDownloadURL = asset.BrowserDownloadURL
			}
		}
		versions = append(versions, v)
	}
	return versions, nil
}
