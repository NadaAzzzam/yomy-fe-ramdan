# App Preview Videos

App Preview videos are **optional but highly recommended** - they can increase downloads by up to 30%.

## Video Specifications

### Format Requirements
- **Format**: MOV or MP4 (H.264 video, AAC audio)
- **Duration**: 15-30 seconds (recommended 20-25 seconds)
- **Frame Rate**: 30 fps
- **Audio**: Optional but recommended
- **Max File Size**: 500 MB per video
- **Resolution**: Must match device screenshot dimensions

### Required Dimensions by Device

#### iPhone Videos
**6.7" Display** (Priority 1)
- Portrait: 1290 × 2796 pixels
- Landscape: 2796 × 1290 pixels
- File: `app-preview-iphone-6.7-portrait.mp4`

**6.5" Display**
- Portrait: 1242 × 2688 pixels
- Landscape: 2688 × 1242 pixels
- File: `app-preview-iphone-6.5-portrait.mp4`

#### iPad Videos
**12.9" Display** (Priority 1)
- Portrait: 2048 × 2732 pixels
- Landscape: 2732 × 2048 pixels
- File: `app-preview-ipad-12.9-landscape.mp4`

**11" Display**
- Portrait: 1668 × 2388 pixels
- Landscape: 2388 × 1668 pixels
- File: `app-preview-ipad-11-landscape.mp4`

## Content Guidelines

### Video Structure (20-25 seconds)

#### Opening (2-3 seconds)
- App icon or logo animation
- App name: "يومي - Yomy"
- Tagline: "رفيقك في رمضان"

#### Feature Showcase (15-20 seconds)
**Show 4-5 key features (3-4 seconds each):**

1. **Prayer Times** (4 sec)
   - Show home screen with prayer times
   - Notification appearing
   - User checking next prayer

2. **Quran Reading** (4 sec)
   - Open Quran reader
   - Smooth page transition
   - Beautiful Arabic text display

3. **Daily Azkar** (4 sec)
   - Browse azkar categories
   - Select azkar
   - Interactive counter in action

4. **Ramadan Timetable** (4 sec)
   - Iftar/Suhoor countdown
   - Calendar view
   - Notification setup

5. **Personalization** (3 sec)
   - Quick settings adjustment
   - Theme options
   - Notification preferences

#### Closing (1-2 seconds)
- App icon
- Call to action: "حمّل الآن - Download Now"
- Optional: App Store badge

### Video Best Practices

#### DO:
- ✅ Show actual app interface (screen recording)
- ✅ Use smooth, realistic interactions
- ✅ Keep it fast-paced and engaging
- ✅ Focus on 4-5 core features only
- ✅ Use device status bar for realism
- ✅ Add background music (royalty-free Islamic nasheed)
- ✅ Include text overlays in Arabic and English
- ✅ Show the app in use with real data
- ✅ Demonstrate key user flows
- ✅ Keep branding consistent

#### DON'T:
- ❌ Use stock footage or generic videos
- ❌ Show bugs or placeholder content
- ❌ Include third-party apps or services
- ❌ Use copyrighted music
- ❌ Show prices or promotional text
- ❌ Include website URLs (except support)
- ❌ Make false claims
- ❌ Show outdated interface
- ❌ Use shaky or low-quality footage
- ❌ Exceed 30 seconds

## Creating App Preview Videos

### Method 1: Screen Recording (Easiest)

#### iOS Simulator (Mac)
```bash
# Start recording in Simulator
xcrun simctl io booted recordVideo --codec=h264 preview.mov

# Stop with Ctrl+C

# Convert to correct size if needed
ffmpeg -i preview.mov -s 1290x2796 -c:v libx264 -crf 18 -preset slow app-preview.mp4
```

#### Xcode Direct
1. Open Simulator (iPhone 14 Pro Max for 6.7" or iPad Pro 12.9")
2. Window → Record Screen
3. Interact with your app
4. Stop recording
5. Save and export

#### Real Device
1. Connect iPhone/iPad to Mac
2. Open QuickTime Player
3. File → New Movie Recording
4. Select your device from camera dropdown
5. Click record
6. Interact with device
7. Stop and export

### Method 2: Professional Editing

#### Tools
- **iMovie** (Free, Mac): Basic editing
- **Final Cut Pro** (Mac): Professional
- **Adobe Premiere Pro**: Industry standard
- **DaVinci Resolve** (Free): Color grading
- **ScreenFlow** (Mac): Screen recording + editing

#### Editing Workflow
1. **Record raw footage**: Capture all app interactions
2. **Import clips**: Organize in timeline
3. **Cut and arrange**: 20-25 second sequence
4. **Add transitions**: Subtle fades or slides
5. **Add text overlays**: Feature names/descriptions
6. **Add background music**: Royalty-free Islamic track
7. **Color correct**: Ensure consistent look
8. **Add sound effects**: Tap sounds, notifications
9. **Export**: Correct dimensions and codec

### Method 3: App Preview Studio Tools

**Paid Services:**
- **Storemaven**: Professional app preview creation
- **PreviewMyApp**: Automated video generation
- **AppLaunchpad**: Full service ASO agency

**Free Tools:**
- **Fastlane Frameit**: Add device frames
- **FFmpeg**: Video conversion and editing
- **OBS Studio**: Screen recording

## Audio Guidelines

### Background Music
- Use royalty-free music only
- Consider Islamic nasheed (vocals only, no instruments)
- Keep volume at 30-40% (don't overpower)
- Fade in/out smoothly

**Royalty-Free Music Sources:**
- YouTube Audio Library (Free)
- Epidemic Sound (Paid)
- Artlist (Paid)
- Incompetech (Free)
- Free Music Archive (Free)

### Sound Effects
- Tap sounds for interactions
- Notification sounds from your app
- Subtle whoosh for transitions
- Keep effects minimal

### Voiceover (Optional)
- Professional Arabic voiceover
- Clear pronunciation
- Warm, friendly tone
- Match video pace

## Text Overlays

### Style
- **Font**: San Francisco (iOS native) or similar
- **Language**: Arabic primary, English secondary
- **Placement**: Top or bottom third
- **Animation**: Fade in/out or slide
- **Duration**: 2-3 seconds per text

### Example Text Overlays
```
مواقيت الصلاة الدقيقة
Accurate Prayer Times

اقرأ القرآن بسهولة
Read Quran Easily

أذكار يومية
Daily Remembrance

إمساكية رمضان
Ramadan Timetable
```

## Export Settings

### For iPhone Preview (6.7")
```
- Resolution: 1290 × 2796 (portrait) or 2796 × 1290 (landscape)
- Frame rate: 30 fps
- Codec: H.264
- Bitrate: 10-15 Mbps
- Audio codec: AAC
- Audio bitrate: 128 kbps
- Format: .mp4 or .mov
```

### For iPad Preview (12.9")
```
- Resolution: 2048 × 2732 (portrait) or 2732 × 2048 (landscape)
- Frame rate: 30 fps
- Codec: H.264
- Bitrate: 15-20 Mbps (higher res needs more)
- Audio codec: AAC
- Audio bitrate: 128 kbps
- Format: .mp4 or .mov
```

### FFmpeg Export Command
```bash
ffmpeg -i input.mov \
  -vf "scale=1290:2796:flags=lanczos" \
  -c:v libx264 \
  -preset slow \
  -crf 18 \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  app-preview-iphone-6.7-portrait.mp4
```

## Uploading to App Store Connect

1. Go to App Store Connect
2. Select your app
3. Navigate to App Information
4. Under "App Previews and Screenshots"
5. Select device size
6. Drag and drop video files
7. Video will be processed (can take 30 minutes)
8. Arrange order (first video plays automatically)
9. Add up to 3 videos per device size

## Video Thumbnail

- First frame is auto-selected as thumbnail
- Make sure first frame is attractive
- Should represent the app well
- Consider adding app icon to first frame

## Testing Your Video

Before uploading:
- [ ] Watch on actual device (AirDrop to iPhone/iPad)
- [ ] Check audio levels (not too loud/quiet)
- [ ] Verify text is readable at small sizes
- [ ] Ensure smooth playback (no stuttering)
- [ ] Test on different screen brightnesses
- [ ] Get feedback from others
- [ ] Check file size (under 500 MB)
- [ ] Verify correct dimensions

## App Preview Examples to Study

Search App Store for these apps to see good examples:
- **Quran Majeed**: Excellent Islamic app preview
- **Muslim Pro**: Great feature showcase
- **Duolingo**: Fun, engaging preview style
- **Things 3**: Smooth interaction demos
- **Bear**: Beautiful, minimal design

## Optional: Localized Videos

Consider creating different videos for:
- Arabic-speaking markets (Arabic text only)
- English-speaking markets (English text only)
- Other languages if you support them

---

**Priority**: App preview videos are optional but highly recommended  
**Recommended**: Create at least one video (portrait, iPhone 6.7")  
**Ideal**: Create 2 videos (iPhone portrait + iPad landscape)

**Place your videos in this folder with the naming convention:**
- `app-preview-iphone-6.7-portrait.mp4`
- `app-preview-ipad-12.9-landscape.mp4`
