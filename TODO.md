# TODO
- [x] Fix Card.jsx crash when Quill insert is not a string
- [x] Add Upload icon/button next to “Create New” on DocumentHome
- [x] Add backend upload endpoint (multipart/form-data) under /api/v1/documents/upload
- [x] Implement MVP conversion:
  - [x] JSON: parse/store directly
  - [x] Other files (doc/pdf/code/text): treat as plain text Quill content
- [x] Add frontend helper uploadDoc(...) and wire it to DocumentHome
- [ ] Verify: uploaded doc opens in editor and collaboration works

