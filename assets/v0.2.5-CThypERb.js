import{a as e}from"./chunk-BEqpzyXh.js";import{t}from"./jsx-runtime-qJqhvtml.js";var n=e(t());function r(e){let t={code:`code`,li:`li`,strong:`strong`,ul:`ul`,...e.components},{ChangelogSection:r,Image:i}=t;return r||a(`ChangelogSection`,!0),i||a(`Image`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(r,{type:`features`,children:[(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Railyard now attempts to auto-resolve the new Windows executable path for game version `,(0,n.jsx)(t.code,{children:`1.4.x`})]}),`
`,(0,n.jsxs)(t.li,{children:[`Added sidebar filters to `,(0,n.jsx)(t.strong,{children:`Browse`}),` for Compatible/Incompatible/Test content`]}),`
`]}),(0,n.jsx)(`p`,{align:`center`,children:(0,n.jsx)(i,{width:`600`,alt:`image`,src:`/images/railyard/updates/v0.2.5/sidebar-filters.png`})}),(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Added support to import multiple assets at once`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Each asset is reviewable independently, with clear conflict/validity messages`}),`
`]}),`
`]}),`
`]}),(0,n.jsx)(`p`,{align:`center`,children:(0,n.jsx)(i,{width:`800`,alt:`image`,src:`/images/railyard/updates/v0.2.5/review-import.png`})}),(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Unified incompatible asset handling across the application`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Whenever an asset is incompatible with the detected game version, a tooltip will display describing the issue`}),`
`]}),`
`]}),`
`]}),(0,n.jsx)(`p`,{align:`center`,children:(0,n.jsx)(i,{width:`400`,alt:`image`,src:`/images/railyard/updates/v0.2.5/incompatibility-tooltip.png`})})]}),`
`,(0,n.jsx)(r,{type:`improvements`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Undetectable game version no longer causes Railyard to aggressively prune subscriptions`}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Discover`}),` now reflects the same incompatible chips as `,(0,n.jsx)(t.strong,{children:`Library`}),`/`,(0,n.jsx)(t.strong,{children:`Browse`})]}),`
`,(0,n.jsx)(t.li,{children:`Invalid imports now list which files are missing instead of saying a generic "missing one or more required files" message`}),`
`,(0,n.jsxs)(t.li,{children:[`Removed tags from `,(0,n.jsx)(t.strong,{children:`Library`})]}),`
`]})}),`
`,(0,n.jsx)(r,{type:`bugfixes`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Fixed an issue where the `,(0,n.jsx)(t.code,{children:`Flatpak`}),` mount for Linux version detection wouldn't launch due to location or would become orphaned due to improper process killing`]}),`
`,(0,n.jsxs)(t.li,{children:[`Fixed a bug with `,(0,n.jsx)(t.strong,{children:`Enable Dev Tools`}),` on Linux by passing the variable into `,(0,n.jsx)(t.code,{children:`flatpak-spawn`})]}),`
`,(0,n.jsx)(t.li,{children:`The install page no longer displays upgrades to asset versions incompatible with game version`}),`
`]})})]})}function i(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};