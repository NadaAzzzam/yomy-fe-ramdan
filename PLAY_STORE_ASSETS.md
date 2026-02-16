# Google Play Store Feature Graphic Requirements

## 📐 Official Requirements

### Feature Graphic Specifications
- **Size**: 1024 x 500 pixels
- **Format**: JPG or PNG
- **Aspect ratio**: 2:1
- **Transparency**: Not allowed (no alpha channel)
- **Max file size**: 15MB
- **Color space**: RGB

## 🎯 Purpose

The feature graphic is used when your app is:
- **Featured by Google** at the top of your Play Store listing
- Displayed in **promotional sections**
- Shown in **curated collections**
- Featured in **Google Play's editorial picks**

## 📁 Asset Location

Store your feature graphic in:
```
assets/play-store/feature-graphic.png
```

## ✅ Design Guidelines

### Do's
- ✅ Use high-quality, eye-catching visuals
- ✅ Include your app name/logo prominently
- ✅ Use brand colors consistently
- ✅ Keep text minimal and readable
- ✅ Test on different screen sizes
- ✅ Use safe zones (avoid important content at edges)
- ✅ Export at exact dimensions (1024 x 500)
- ✅ Use RGB color mode
- ✅ Flatten all layers before export

### Don'ts
- ❌ Don't use transparency
- ❌ Don't include device frames
- ❌ Don't use excessive text
- ❌ Don't use low-resolution images
- ❌ Don't violate Google's content policies
- ❌ Don't use misleading imagery
- ❌ Don't include pricing information
- ❌ Don't use "Google Play" branding incorrectly

## 🎨 Design Tips

### Safe Zones
- Keep important content **50px from edges**
- Text should be at least **80px from edges**

### Typography
- Minimum font size: **40px** for readability
- Use bold, sans-serif fonts
- High contrast between text and background

### Visual Hierarchy
1. **App icon/logo** (if included)
2. **App name** (clear and prominent)
3. **Key visual** (screenshot, character, or concept)
4. **Tagline** (optional, brief)

## 🛠️ Creation Workflow

### Option 1: Using Design Tools

#### Figma/Sketch
```
1. Create new artboard: 1024 x 500px
2. Design your feature graphic
3. Export as PNG (no transparency)
4. Verify dimensions and file size
```

#### Photoshop
```
1. File > New
   - Width: 1024px
   - Height: 500px
   - Resolution: 72 DPI
   - Color Mode: RGB
   - Background: White (or your color)
2. Design your graphic
3. Layer > Flatten Image
4. File > Export > Export As
   - Format: PNG or JPG
   - Quality: Maximum
```

#### Canva
```
1. Custom dimensions: 1024 x 500px
2. Design using templates or from scratch
3. Download as PNG
4. Ensure no transparency
```

### Option 2: Using Your App Logo

If you want to create a simple feature graphic from your existing logo:

```bash
# Using ImageMagick (if available)
convert assets/logo.svg -resize 1024x500 -background white -flatten assets/play-store/feature-graphic.png
```

## 📋 Pre-Upload Checklist

Before uploading to Google Play Console:

- [ ] Dimensions are exactly 1024 x 500 pixels
- [ ] File format is PNG or JPG
- [ ] No transparency (alpha channel removed)
- [ ] File size is under 15MB
- [ ] Image is clear and high-quality
- [ ] Text is readable at small sizes
- [ ] Brand colors are consistent
- [ ] No prohibited content
- [ ] Tested preview on mobile device

## 🔍 Validation

### Check Dimensions
```bash
# Windows PowerShell
Get-Item assets/play-store/feature-graphic.png | Select-Object Name, Length

# Or use online tools:
# - https://www.imgonline.com.ua/eng/get-image-size.php
# - https://imageresizer.com/image-size-checker
```

### Check Transparency
- Open in image editor
- Verify background is solid color
- Check for alpha channel (should be none)

## 📱 Where It Appears

### Google Play Store
1. **Featured Section**: Top of your app listing when featured
2. **Home Page**: In curated collections
3. **Category Pages**: When highlighted
4. **Search Results**: For promoted apps
5. **Promotional Campaigns**: Google Play marketing

### Preview Contexts
- **Mobile**: Appears full-width on phone screens
- **Tablet**: Larger display, more detail visible
- **Web**: play.google.com desktop view

## 🔄 Updating Your Feature Graphic

1. Log in to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Go to **Store presence** > **Main store listing**
4. Scroll to **Graphics** section
5. Click **Feature graphic**
6. Upload new image (1024 x 500)
7. Save and submit for review

## 📊 Additional Play Store Assets

While you're at it, prepare these assets too:

### Required Assets
- **App icon**: 512 x 512px (PNG, 32-bit, with transparency)
- **Screenshots**: At least 2 (phone), recommended 8
  - Min: 320px
  - Max: 3840px
  - Aspect ratio: 16:9 or 9:16

### Optional Assets
- **Promo video**: YouTube URL
- **TV banner**: 1280 x 720px (for Android TV)
- **Wear OS screenshots**: If applicable

## 🎯 Yomy Ramadan App Suggestions

For your Ramadan app, consider featuring:
- **Islamic patterns** or geometric designs
- **Crescent moon** and stars imagery
- **Prayer/Adhkar** visual elements
- **App name** in Arabic and/or English
- **Warm colors**: Greens, golds, purples (traditional Islamic colors)
- **Key features**: Prayer times, Adhkar counter, Quran

### Example Layout
```
+----------------------------------------------------------+
|                                                          |
|  [Crescent Icon]    YOMY RAMADAN    [Islamic Pattern]   |
|                                                          |
|     Your Complete Ramadan Companion                      |
|                                                          |
+----------------------------------------------------------+
```

## 📚 Resources

- [Google Play Asset Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Feature Graphic Best Practices](https://developer.android.com/distribute/marketing-tools/device-art-generator)
- [Play Store Listing Tips](https://developer.android.com/distribute/best-practices/launch/store-listing)

## 🆘 Need Help?

If you need assistance creating the feature graphic:
1. Share your app logo and brand colors
2. Describe your app's key features
3. Specify any text you want included
4. I can help generate or guide you through creation

---

**Next Steps**: Create your feature graphic and save it to `assets/play-store/feature-graphic.png`
