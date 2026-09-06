import{a as e}from"./chunk-BEqpzyXh.js";import{t}from"./jsx-runtime-qJqhvtml.js";var n=e(t());function r(e){let t={a:`a`,code:`code`,li:`li`,strong:`strong`,ul:`ul`,...e.components},{ChangelogSection:r}=t;return r||a(`ChangelogSection`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r,{type:`features`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Driving paths are now served from the app via a sidecar file`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Mapmakers can optionally provide a `,(0,n.jsx)(t.code,{children:`driving_paths.json`}),` which enables Railyard to serve the driving paths rendered when a user clicks on an individual population group in the game`]}),`
`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`Enabled the Railyard app to handle the new `,(0,n.jsx)(t.code,{children:`Deprecated`}),` and `,(0,n.jsx)(t.code,{children:`Deleted`}),` listing states`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Listings that are `,(0,n.jsx)(t.code,{children:`Deprecated`}),` are no longer downloadable, but remain installed locally; deprecation is also reversible by the author`]}),`
`,(0,n.jsxs)(t.li,{children:[`Listings that are `,(0,n.jsx)(t.code,{children:`Deleted`}),` are auto-purged on registry sync; deletion is permanent`]}),`
`]}),`
`]}),`
`]})}),`
`,(0,n.jsx)(r,{type:`improvements`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Added a `,(0,n.jsx)(t.code,{children:`Show Deleted Listings`}),` setting, off by default, for looking up a listing after it has been removed`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.code,{children:`Deprecated`}),` and `,(0,n.jsx)(t.code,{children:`Deleted`}),` listings each now have their own unique icon, sort last when viewable, and cannot be newly installed`]}),`
`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`Added a `,(0,n.jsx)(t.code,{children:`Status`}),` filter covering all listing states: `,(0,n.jsx)(t.code,{children:`Active`}),`, `,(0,n.jsx)(t.code,{children:`Deprecated`}),`, `,(0,n.jsx)(t.code,{children:`Deleted`}),`, and `,(0,n.jsx)(t.code,{children:`Local`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Browse defaults to `,(0,n.jsx)(t.code,{children:`Active`}),` only; Library in addition shows `,(0,n.jsx)(t.code,{children:`Deprecated`}),` and `,(0,n.jsx)(t.code,{children:`Local`})]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.code,{children:`Status`}),` selections are unions and can be combined`]}),`
`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`Authors can now `,(0,n.jsx)(t.code,{children:`retire`}),` or `,(0,n.jsx)(t.code,{children:`remove`}),` individual versions of previously published assets`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Retired and removed versions now appear in a listing's version history as `,(0,n.jsx)(t.strong,{children:`No Longer Available`})]}),`
`,(0,n.jsx)(t.li,{children:`These are no longer downloadable but keep changelog, release date, and download count`}),`
`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`Added a new `,(0,n.jsx)(t.code,{children:`Announcements`}),` section to the App for displaying important messages from the Railyard team`]}),`
`,(0,n.jsx)(t.li,{children:`Added sorting by data quality, with alphabetical added as a generic fallback for all sort options`}),`
`,(0,n.jsx)(t.li,{children:`Improved performance in demand driving path handling via sidecar serving and caching; the sim no longer needs to hold paths in memory`}),`
`]})}),`
`,(0,n.jsx)(r,{type:`bugfixes`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Fixed deleted assets surviving in a profile until the following restart`}),`
`,(0,n.jsx)(t.li,{children:`Fixed map updates failing when the map's city code changed`}),`
`,(0,n.jsxs)(t.li,{children:[`Fixed uninstall orphaning foundations and other files not installed in a map directory`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Bootstrap also now automatically cleans up file orphans on startup`}),`
`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`Fixed a renamed `,(0,n.jsx)(t.code,{children:`.app`}),` bundle breaking game launch on macOS`]}),`
`]})}),`
`,(0,n.jsx)(r,{type:`notes`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`For more information on `,(0,n.jsx)(t.code,{children:`Deprecation`}),` and `,(0,n.jsx)(t.code,{children:`Deletion`}),` see `,(0,n.jsx)(t.a,{href:`/railyard/docs/latest/listing-status-and-filters`,children:`Listing Status & Filters`}),` for what each state means`]}),`
`]})})]})}function i(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};