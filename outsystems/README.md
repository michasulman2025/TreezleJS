# OutSystems sort and child-menu update

The self-contained Treezle producer needs the `SortOrder` Text attribute on
`Options`, with JSON name `sortOrder` and default `"alphabetical"`, plus the
current `dist/treezle.iife.js` as its `treezle` script. Values are
`alphabetical` and `input`.

`demo-sort-menu-update.cs` is the targeted Model API update used for the
native TreezleDemo. It expects the existing native demo with `DemoOptions`,
`ApplyDemoOptions`, `HandleOnMenuCommand`, the node editor, and its existing
Add node form. It adds order controls and makes the menu prepare the parent;
the user then enters a unique ID and label and selects Add node. It does not
create the native demo from scratch. Apply only after reading the current
module, publishing the updated producer, and refreshing the demo dependency.
Validate and merge before publishing, then test with an authenticated browser.
