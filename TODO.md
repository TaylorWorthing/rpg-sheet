# TODO
- [x] Auto-scale text that is too long to fit in text fields.
    - Not for text areas, they scroll vertically as intended.

- [x] Attempt to use SVG as the file format for sheet images.
    - Should improve file sizes, load-times, and quality when zoomed.
    - May break static field placement.

- [ ] Error handling for importing sheets.
    - Non-existent module or incompatible version.

- [ ] Determine if it is possible to easily generate a PDF client-side.
    - Printing support is basic and requires the user to select the correct
      paper format, margins, background display, etc. This is too easily broken
      for a consistant user experience.
