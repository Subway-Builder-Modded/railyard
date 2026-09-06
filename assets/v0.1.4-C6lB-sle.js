import{a as e}from"./chunk-BEqpzyXh.js";import{t}from"./jsx-runtime-qJqhvtml.js";var n=e(t());function r(e){let t={code:`code`,li:`li`,p:`p`,strong:`strong`,ul:`ul`,...e.components},{ChangelogSection:r,Note:i}=t;return r||a(`ChangelogSection`,!0),i||a(`Note`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r,{type:`features`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Added a library page to easily view and manage installed content`}),`
`,(0,n.jsx)(t.li,{children:`Installs can now be cancelled during the download phase`}),`
`,(0,n.jsx)(t.li,{children:`Added support for optional GitHub token as a workaround for GitHub API limits`}),`
`]})}),`
`,(0,n.jsxs)(r,{type:`improvements`,children:[(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Added sorting by country/downloads/last updated (default is now last updated)`}),`
`,(0,n.jsxs)(t.li,{children:[`All assets now show download counts on `,(0,n.jsx)(t.strong,{children:`Browse`}),`, with maps also showing flag icons corresponding to the country of the map`]}),`
`,(0,n.jsx)(t.li,{children:`Search now only shows tags when an asset with that tag exists`}),`
`,(0,n.jsx)(t.li,{children:`Separated toasts for download progress and download success and added an indicator for how many downloads are in queue`}),`
`,(0,n.jsx)(t.li,{children:`Added an updated multistep loading screen on startup`}),`
`,(0,n.jsx)(t.li,{children:`The app now launches in fullscreen`}),`
`,(0,n.jsx)(t.li,{children:`Linux builds are now through Flatpak. This means you will need to have Flatpak installed in order for the app to function. In addition, this means the autoupdater will be broken for one update on Linux (you will need to manually install the flatpak included in the v0.1.4 release yourself)`}),`
`]}),(0,n.jsx)(i,{children:(0,n.jsxs)(t.p,{children:[`You may not be able to find normal file paths when using the flatpak on linux. This is normal. Your host file system will be mounted on /run/host. You `,(0,n.jsx)(t.strong,{children:`will`}),` have to update your paths when switching to the flatpak build.`]})})]}),`
`,(0,n.jsx)(r,{type:`bugfixes`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Fixed the error log copy button overlapping with text`}),`
`,(0,n.jsx)(t.li,{children:`Removed scrolling left and right/zooming in and out`}),`
`,(0,n.jsx)(t.li,{children:`Profiles will now automatically purge entries related to uninstallable content`}),`
`,(0,n.jsx)(t.li,{children:`Resolved issue where multiple Railyard application instances could be started simultaneously`}),`
`,(0,n.jsxs)(t.li,{children:[`Assets with no installable versions are hidden in `,(0,n.jsx)(t.strong,{children:`Browse`}),` and individual versions that are not installable are hidden on the asset's page`]}),`
`,(0,n.jsxs)(t.li,{children:[`Fixed the in-game mod loader version (appeared as `,(0,n.jsx)(t.code,{children:`vv0.1.3`}),`)`]}),`
`]})}),`
`,(0,n.jsx)(r,{type:`notes`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Changed app instance title from `,(0,n.jsx)(t.code,{children:`railyard`}),` to `,(0,n.jsx)(t.code,{children:`Railyard`})]}),`
`]})})]})}function i(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};