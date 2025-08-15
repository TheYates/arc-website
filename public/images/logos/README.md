# Partner Logos

This directory contains the logo images for trusted partners displayed in the horizontal scrolling section.

## How to Add Real Logos

1. **Add your logo files to this directory** (`public/images/logos/`)
   - Supported formats: PNG, JPG, SVG, WebP
   - Recommended size: 120x60 pixels (or similar aspect ratio)
   - Use descriptive filenames (e.g., `utb.png`, `nova.png`, etc.)

2. **Update the logo configuration** in `lib/constants/logos.ts`:
   - Change `USE_PLACEHOLDER_LOGOS` to `false`
   - Update the `src` paths in `PARTNER_LOGOS` array to match your actual logo files
   - Adjust `width` and `height` as needed for each logo

3. **Example logo files to add:**
   ```
   public/images/logos/
   ├── utb.png
   ├── nova.png
   ├── pastosa.png
   ├── biobe.png
   ├── rabito.png
   ├── district4.png
   ├── labianca.png
   ├── polytank.png
   ├── woodify.png
   └── decorzone.png
   ```

## Logo Requirements

- **Format**: PNG with transparent background preferred
- **Size**: Approximately 120x60 pixels (2:1 aspect ratio)
- **Quality**: High resolution for crisp display
- **Background**: Transparent or white background works best
- **Colors**: Logos will be displayed in grayscale by default, with color on hover

## Customization Options

You can customize the scrolling behavior by modifying the `ScrollingLogos` component props:

- **Speed**: `"slow"` (60s), `"normal"` (40s), `"fast"` (20s)
- **Direction**: `"left"` or `"right"`
- **Styling**: Modify the `className` prop for different backgrounds

## Current Implementation

The logos are currently using placeholder images from via.placeholder.com. Once you add real logos and update the configuration, they will automatically replace the placeholders.

## Need Help?

If you need assistance with logo optimization or implementation, please refer to the main project documentation or contact the development team.
