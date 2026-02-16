# Apple App Store - Quick Reference Guide

## 📱 Screenshot Dimensions Required

### iPhone (Portrait)
| Device | Resolution | Priority | Files Needed |
|--------|-----------|----------|--------------|
| **6.7" Display** | **1290 × 2796 px** | ⭐ **REQUIRED** | 3-10 screenshots |
| **6.5" Display** | **1242 × 2688 px** | ⭐ Recommended | 3-10 screenshots |
| 6.1" Display | 1179 × 2556 px | Optional | 3-10 screenshots |
| 5.5" Display | 1242 × 2208 px | Legacy | 3-10 screenshots |

### iPhone (Landscape) - Optional
| Device | Resolution |
|--------|-----------|
| 6.7" Display | 2796 × 1290 px |
| 6.5" Display | 2688 × 1242 px |

### iPad (Portrait)
| Device | Resolution | Priority | Files Needed |
|--------|-----------|----------|--------------|
| **12.9" Display** | **2048 × 2732 px** | ⭐ **REQUIRED** | 3-10 screenshots |
| **11" Display** | **1668 × 2388 px** | ⭐ Recommended | 3-10 screenshots |
| 10.5" Display | 1668 × 2224 px | Optional | 3-10 screenshots |
| 9.7" Display | 1536 × 2048 px | Legacy | 3-10 screenshots |

### iPad (Landscape)
| Device | Resolution |
|--------|-----------|
| **12.9" Display** | **2732 × 2048 px** |
| **11" Display** | **2388 × 1668 px** |

---

## 🎨 App Icon Requirements

| Specification | Value |
|--------------|-------|
| **Size** | 1024 × 1024 px |
| **Format** | PNG (no transparency) |
| **Color Space** | sRGB or Display P3 |
| **Corners** | Square (Apple adds rounded corners) |
| **Required** | ✅ Yes - 1 file |

---

## 🎥 App Preview Video Specifications

| Specification | iPhone 6.7" | iPad 12.9" |
|--------------|-------------|------------|
| **Resolution (Portrait)** | 1290 × 2796 px | 2048 × 2732 px |
| **Resolution (Landscape)** | 2796 × 1290 px | 2732 × 2048 px |
| **Duration** | 15-30 seconds | 15-30 seconds |
| **Format** | MP4 or MOV | MP4 or MOV |
| **Codec** | H.264, AAC audio | H.264, AAC audio |
| **Max File Size** | 500 MB | 500 MB |
| **Frame Rate** | 30 fps | 30 fps |
| **Required** | ❌ Optional | ❌ Optional |

---

## 📋 Required Metadata

### Text Content Limits
| Field | Character Limit |
|-------|----------------|
| **App Name** | 30 characters |
| **Subtitle** | 30 characters |
| **Promotional Text** | 170 characters |
| **Description** | 4,000 characters |
| **Keywords** | 100 characters (comma-separated) |
| **What's New** | 4,000 characters |
| **Support URL** | Required |
| **Marketing URL** | Optional |
| **Privacy Policy URL** | Required if collecting data |

---

## ✅ Minimum Requirements for Submission

### For iPhone-Only App
- [x] **1** App Icon (1024×1024)
- [x] **5** iPhone 6.7" screenshots (1290×2796)
- [ ] App description (Arabic & English)
- [ ] Keywords
- [ ] Privacy policy (if needed)
- [ ] App build uploaded
- [ ] All metadata complete

### For iPhone + iPad App
- [x] **1** App Icon (1024×1024)
- [x] **5** iPhone 6.7" screenshots (1290×2796)
- [ ] **5** iPad 12.9" screenshots (2048×2732) ⚠️
- [ ] App description (Arabic & English)
- [ ] Keywords
- [ ] Privacy policy (if needed)
- [ ] App build uploaded
- [ ] All metadata complete

---

## 🎯 Your App: Yomy - يومي

### Created Assets ✅
1. ✅ App Icon: `app-icon/app-icon-1024.png` (5.5 MB)
2. ✅ iPhone Screenshot 1: `iphone-screenshots/iphone-01-home.png` (5.2 MB)
3. ✅ iPhone Screenshot 2: `iphone-screenshots/iphone-02-quran.png` (5.4 MB)
4. ✅ iPhone Screenshot 3: `iphone-screenshots/iphone-03-azkar.png` (4.8 MB)
5. ✅ iPhone Screenshot 4: `iphone-screenshots/iphone-04-prayer-times.png` (5.1 MB)
6. ✅ iPhone Screenshot 5: `iphone-screenshots/iphone-05-ramadan.png` (5.9 MB)

### Pending Assets ⚠️
1. ⚠️ iPad Screenshot 1: `ipad-screenshots/ipad-01-home.png` (2048×2732)
2. ⚠️ iPad Screenshot 2: `ipad-screenshots/ipad-02-quran.png` (2048×2732)
3. ⚠️ iPad Screenshot 3: `ipad-screenshots/ipad-03-azkar.png` (2048×2732)
4. ⚠️ iPad Screenshot 4: `ipad-screenshots/ipad-04-prayer-times.png` (2048×2732)
5. ⚠️ iPad Screenshot 5: `ipad-screenshots/ipad-05-ramadan.png` (2048×2732)

---

## 📝 App Description Templates (Ready to Use)

### Arabic Subtitle (30 chars)
```
رفيقك الروحاني في رمضان
```

### English Subtitle (30 chars)
```
Your Ramadan Companion
```

### Arabic Keywords (100 chars)
```
رمضان,قرآن,أذكار,صلاة,إسلامي,مسلم,إمساكية,أدعية,تسبيح,مواقيت
```

### English Keywords (100 chars)
```
ramadan,quran,azkar,prayer,islamic,muslim,fasting,dua,dhikr,times
```

Full descriptions available in `README.md`

---

## 🔐 Required Permissions (Info.plist)

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>نحتاج إلى موقعك لحساب أوقات الصلاة الدقيقة حسب منطقتك</string>

<key>NSUserNotificationsUsageDescription</key>
<string>نحتاج إلى إذن الإشعارات لتذكيرك بأوقات الصلاة والأذكار</string>
```

---

## 🚀 Quick Upload Guide

### 1. Upload to App Store Connect
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Click "App Information"
4. Scroll to "App Previews and Screenshots"
5. Select device size (iPhone 6.7" or iPad 12.9")
6. Drag and drop your screenshots
7. Arrange in order (1=Home, 2=Quran, 3=Azkar, 4=Prayer, 5=Ramadan)
8. Upload app icon in "App Store" section

### 2. Screenshot Upload Order
1. `iphone-01-home.png` - Main dashboard (first impression)
2. `iphone-02-quran.png` - Quran reader
3. `iphone-03-azkar.png` - Daily azkar
4. `iphone-04-prayer-times.png` - Prayer schedule
5. `iphone-05-ramadan.png` - Ramadan timetable

---

## 📊 File Sizes & Format

### Your Created Files
| File | Size | Format | Status |
|------|------|--------|--------|
| app-icon-1024.png | 5.5 MB | PNG | ✅ Ready |
| iphone-01-home.png | 5.2 MB | PNG | ✅ Ready |
| iphone-02-quran.png | 5.4 MB | PNG | ✅ Ready |
| iphone-03-azkar.png | 4.8 MB | PNG | ✅ Ready |
| iphone-04-prayer-times.png | 5.1 MB | PNG | ✅ Ready |
| iphone-05-ramadan.png | 5.9 MB | PNG | ✅ Ready |

All files meet Apple's requirements (under 8 MB, PNG format, correct dimensions)

---

## ⏱️ Typical Review Timeline

| Stage | Duration |
|-------|----------|
| **Waiting for Review** | 1-3 days |
| **In Review** | 1-24 hours |
| **Processing** | 1-24 hours |
| **Ready for Sale** | Immediate |
| **Total** | 2-5 days typically |

Submit 2-4 weeks before Ramadan to ensure approval in time!

---

## 📞 Quick Links

- **App Store Connect**: https://appstoreconnect.apple.com
- **Developer Portal**: https://developer.apple.com
- **Screenshot Specs**: https://help.apple.com/app-store-connect/#/devd274dd925
- **Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/

---

## 🆘 Common Issues Quick Fix

| Issue | Solution |
|-------|----------|
| Screenshot wrong size | Check exact pixels: 1290×2796 for iPhone 6.7" |
| Icon rejected | Remove transparency, no rounded corners |
| Build not appearing | Wait 30-60 min, check email |
| Missing compliance | Click "Manage" next to build |
| Privacy rejection | Add clear description of data usage |

---

**Status**: iPhone assets complete ✅ | iPad assets needed ⚠️  
**Next Step**: Create iPad screenshots or proceed with iPhone-only submission

See `ASSETS-STATUS.md` for detailed progress and `README.md` for complete guide.
