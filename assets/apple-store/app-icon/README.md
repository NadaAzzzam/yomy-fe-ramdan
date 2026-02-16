# App Icon

## Required Size
- **1024 × 1024 pixels**
- **Format**: PNG (no transparency, no alpha channel)
- **Color Space**: sRGB or Display P3
- **File name**: `app-icon-1024.png`

## Design Guidelines

### Technical Requirements
- ✅ Exactly 1024 × 1024 pixels
- ✅ PNG format only
- ✅ No transparency (must have opaque background)
- ✅ No rounded corners (Apple adds them automatically)
- ✅ 72 DPI or higher
- ✅ sRGB or P3 color space
- ❌ No alpha channel
- ❌ No shadows extending beyond icon bounds

### Design Best Practices

#### 1. Islamic Theme
- Use crescent moon symbolism
- Consider incorporating Arabic calligraphy
- Use Islamic geometric patterns
- Colors: Navy blue, gold, teal, white

#### 2. Simplicity
- Keep design simple and recognizable
- Avoid too much detail (won't be visible at small sizes)
- Use clear, bold shapes
- Ensure icon works at all sizes (from 16x16 to 1024x1024)

#### 3. Brand Consistency
- Match app's color scheme
- Use consistent visual style with splash screen
- Should be recognizable in App Store and home screen

#### 4. Text in Icons
- Avoid text if possible (doesn't scale well)
- If using Arabic text, make it large and bold
- Maximum 1-2 characters

### Color Palette Suggestions
Based on your app theme:
- **Primary**: #080E1F (Dark navy - from your build config)
- **Accent**: #14FFEC (Cyan/teal)
- **Gold**: #FFD700 (For Islamic elements)
- **White**: #FFFFFF (For contrast)

### Icon Concept Ideas

#### Option 1: Crescent & Book
- Golden crescent moon
- Stylized Quran book
- Navy background
- Clean, minimal design

#### Option 2: Calendar with Crescent
- Islamic calendar page
- Crescent moon at top
- Teal gradient background
- Modern, functional look

#### Option 3: Arabic Calligraphy
- "يومي" in beautiful calligraphy
- Circular Islamic pattern border
- Gradient background (navy to teal)
- Elegant, traditional feel

#### Option 4: Mosque Silhouette
- Minimalist mosque dome and minaret
- Crescent moon above
- Sunset gradient (orange to purple)
- Recognizable Islamic imagery

### Testing Your Icon
1. **Size Test**: View at different sizes (16px, 32px, 60px, 120px, 1024px)
2. **Background Test**: View on light and dark backgrounds
3. **Competition Test**: Compare with similar apps in App Store
4. **Device Test**: See how it looks on actual iOS home screen

### Design Tools
- **Figma**: Free, web-based
- **Sketch**: Mac-only, industry standard
- **Adobe Illustrator**: Vector design
- **Photoshop**: Raster editing
- **Canva**: Easy templates
- **Icon generators**: Various online tools

### Export Settings
When exporting from design tools:

**Figma/Sketch:**
```
- Size: 1024 × 1024
- Format: PNG
- Scale: 1x
- No transparency
- Color profile: sRGB
```

**Photoshop:**
```
- Size: 1024 × 1024 pixels
- Resolution: 72 DPI
- Mode: RGB Color (8-bit)
- Format: PNG-24
- Transparency: Off
- Color profile: sRGB IEC61966-2.1
```

## iOS Icon Sizes (Reference)
Apple automatically generates these from your 1024px master:

| Device/Usage | Size (points) | Size (@2x) | Size (@3x) |
|--------------|---------------|------------|------------|
| iPhone App | 60pt | 120×120px | 180×180px |
| iPad App | 76pt | 152×152px | - |
| iPad Pro App | 83.5pt | 167×167px | - |
| App Store | 1024pt | 1024×1024px | - |
| Spotlight (iPhone) | 40pt | 80×80px | 120×120px |
| Spotlight (iPad) | 40pt | 80×80px | - |
| Settings | 29pt | 58×58px | 87×87px |
| Notification | 20pt | 40×40px | 60×60px |

## Xcode Asset Catalog
If you're generating icons for Xcode, you'll need multiple sizes.
But for App Store submission, you only need the 1024×1024 master icon.

## Common Mistakes to Avoid
1. ❌ Adding rounded corners (Apple adds them)
2. ❌ Using transparency
3. ❌ Making icon too complex/detailed
4. ❌ Using small text that won't be readable
5. ❌ Not testing at small sizes
6. ❌ Wrong dimensions or aspect ratio
7. ❌ Low resolution or pixelated images
8. ❌ Too similar to existing apps
9. ❌ Violating Apple's design guidelines
10. ❌ Using copyrighted imagery

## Apple's Official Guidelines
[App Icon Design Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)

---

**Place your final app icon as:** `app-icon-1024.png`
