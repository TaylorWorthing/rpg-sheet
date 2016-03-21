# TODO
- [x] Auto-scale text that is too long to fit in text fields.
    - Not for text areas, they scroll vertically as intended.

- [x] Attempt to use SVG as the file format for sheet images.
    - Should improve file sizes, load-times, and quality when zoomed.
    - May break static field placement.

- [x] Error handling for importing sheets.
    - Non-existent module or incompatible version.

- [ ] PDF export.
    - jsPDF is probably the best library to help with this, but will require
      making our own canvas elements for content beacuse html2canvas and
      rasterizeHTML have limited SVG and custom CSS support.
