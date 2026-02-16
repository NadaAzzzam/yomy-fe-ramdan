# Apple App Store Submission Checklist

Use this checklist to track your progress preparing for App Store submission.

## 📱 Assets Preparation

### App Icon
- [ ] Design 1024×1024px app icon
- [ ] No transparency, no rounded corners
- [ ] PNG format, sRGB color space
- [ ] Tested at multiple sizes (looks good small and large)
- [ ] File saved as: `app-icon/app-icon-1024.png`

### iPhone Screenshots (Required)
- [ ] **6.7" Display** (1290 × 2796px) - PRIORITY 1
  - [ ] 01-home.png
  - [ ] 02-quran.png
  - [ ] 03-azkar.png
  - [ ] 04-prayer-times.png
  - [ ] 05-ramadan.png
- [ ] **6.5" Display** (1242 × 2688px) - Optional but recommended
  - [ ] Same 5 screenshots at this size

### iPad Screenshots (Required if supporting iPad)
- [ ] **12.9" Display** (2048 × 2732px) - PRIORITY 1
  - [ ] 01-home.png
  - [ ] 02-quran.png
  - [ ] 03-azkar.png
  - [ ] 04-prayer-times.png
  - [ ] 05-ramadan.png
- [ ] **11" Display** (1668 × 2388px) - Optional but recommended
  - [ ] Same 5 screenshots at this size

### App Preview Videos (Optional but Recommended)
- [ ] iPhone 6.7" portrait video (1290 × 2796px, 15-30 sec)
- [ ] iPad 12.9" landscape video (2732 × 2048px, 15-30 sec)
- [ ] Background music (royalty-free)
- [ ] Text overlays in Arabic and English
- [ ] Under 500 MB per video

## 📝 App Store Connect Setup

### Account & App Setup
- [ ] Apple Developer account active ($99/year)
- [ ] App ID created in Developer Portal
- [ ] Bundle ID matches your Xcode project
- [ ] App created in App Store Connect
- [ ] App name available and reserved

### App Information
- [ ] **App Name**: يومي - رمضان (or chosen name)
- [ ] **Subtitle**: رفيقك الروحاني في رمضان (30 chars max)
- [ ] **Primary Language**: Arabic
- [ ] **Primary Category**: Lifestyle
- [ ] **Secondary Category**: Reference (optional)
- [ ] **Content Rights**: Copyright statement added
- [ ] **Age Rating**: Completed questionnaire (should be 4+)

### Description & Keywords
- [ ] **Arabic Description**: Written (see README.md)
- [ ] **English Description**: Written (see README.md)
- [ ] **Arabic Keywords**: Added (100 chars max)
- [ ] **English Keywords**: Added (100 chars max)
- [ ] Keywords researched and optimized

### URLs & Contact
- [ ] **Support URL**: Created and working
- [ ] **Marketing URL**: Added (optional)
- [ ] **Privacy Policy URL**: Created and hosted
- [ ] **Contact Email**: Added
- [ ] **Contact Phone**: Added
- [ ] **Review Notes**: Written for Apple reviewers

### Privacy
- [ ] **Privacy Questionnaire**: Completed
  - [ ] Data collection practices disclosed
  - [ ] Location usage explained
  - [ ] Notification usage explained
  - [ ] No third-party tracking confirmed
- [ ] **Privacy Policy**: Written and published online

## 🔧 Technical Setup

### Xcode & Build
- [ ] Xcode version up to date
- [ ] iOS deployment target set (iOS 13.0+)
- [ ] Bundle ID matches App Store Connect
- [ ] Version number set (1.0.0)
- [ ] Build number set (1)
- [ ] Signing & Capabilities configured
- [ ] Distribution certificate created
- [ ] Provisioning profile created

### App Capabilities
- [ ] **Location Services**: Configured
  - [ ] NSLocationWhenInUseUsageDescription added
  - [ ] Usage description in Arabic
- [ ] **Push Notifications**: Configured
  - [ ] NSUserNotificationsUsageDescription added
  - [ ] Usage description in Arabic
- [ ] **Background Modes**: If needed
  - [ ] Background fetch enabled
  - [ ] Remote notifications enabled

### Info.plist
- [ ] All permission descriptions added
- [ ] All descriptions in Arabic (primary) and English
- [ ] App Transport Security configured if needed
- [ ] Supported orientations set
- [ ] Status bar style configured

## 🧪 Testing

### Functional Testing
- [ ] App tested on real iPhone devices
- [ ] App tested on real iPad devices (if supported)
- [ ] All features working correctly
- [ ] Location permission request works
- [ ] Notification permission request works
- [ ] Prayer times calculate correctly
- [ ] Quran reader displays properly
- [ ] Azkar counter functions correctly
- [ ] Ramadan timetable accurate

### Edge Cases
- [ ] Tested with location services denied
- [ ] Tested with notifications denied
- [ ] Tested in airplane mode (offline features)
- [ ] Tested with different locations
- [ ] Tested during different times of day
- [ ] Tested with different iOS versions
- [ ] Tested with different device sizes

### UI/UX Testing
- [ ] All Arabic text displays correctly (RTL)
- [ ] No text truncation or overflow
- [ ] All buttons and interactions work
- [ ] Navigation is intuitive
- [ ] Loading states display properly
- [ ] Error states handled gracefully
- [ ] Dark mode works (if supported)

### Performance
- [ ] App launches quickly (< 3 seconds)
- [ ] No crashes during testing
- [ ] Memory usage is reasonable
- [ ] Battery usage is acceptable
- [ ] Smooth scrolling and animations

## 📦 Build Upload

### Archive & Upload
- [ ] Project builds successfully
- [ ] Archive created in Xcode
- [ ] No warnings or errors
- [ ] Build uploaded via Xcode
- [ ] Build processing completed (check App Store Connect)
- [ ] Build shows up in "Activity" tab

### Build Selection
- [ ] Build selected for this version
- [ ] Export compliance information completed
- [ ] Encryption usage declared (usually "No")

## 📄 Metadata Final Check

### All Languages
- [ ] Arabic metadata complete
- [ ] English metadata complete
- [ ] Additional languages if needed

### All Assets Uploaded
- [ ] App icon uploaded (1024×1024)
- [ ] iPhone screenshots uploaded (all sizes)
- [ ] iPad screenshots uploaded (if supported)
- [ ] App preview videos uploaded (optional)
- [ ] All assets display correctly in preview

### Pricing & Availability
- [ ] **Price**: Free (or selected tier)
- [ ] **Availability**: Countries selected
- [ ] **Release**: Manual or automatic release chosen
- [ ] **Pre-order**: Configured if desired

## 🚀 Submission

### Pre-Submission Review
- [ ] All required fields completed (no red warnings)
- [ ] Screenshots look professional
- [ ] Description is compelling
- [ ] Keywords are optimized
- [ ] Privacy policy is comprehensive
- [ ] Contact information is correct

### Submit for Review
- [ ] "Submit for Review" button clicked
- [ ] Confirmation received
- [ ] Status changed to "Waiting for Review"

### Post-Submission
- [ ] Monitor email for Apple updates
- [ ] Check App Store Connect daily
- [ ] Respond to any requests from Apple within 24 hours

## 📊 Review Process

### Typical Timeline
- **Waiting for Review**: 1-3 days
- **In Review**: 1-24 hours
- **Processing for App Store**: 1-24 hours
- **Ready for Sale**: Live!

### Possible Outcomes
- [ ] **Approved**: App is live! 🎉
- [ ] **Rejected**: Review rejection reason
  - [ ] Read rejection reason carefully
  - [ ] Fix issues mentioned
  - [ ] Reply to reviewer or resubmit
- [ ] **Developer Rejected**: You can reject and resubmit
- [ ] **Metadata Rejected**: Only metadata issues
  - [ ] Fix metadata
  - [ ] Resubmit without new build

## ✅ Post-Approval

### App is Live
- [ ] Verify app appears in App Store
- [ ] Test downloading app from store
- [ ] Share App Store link
- [ ] Monitor crash reports
- [ ] Monitor user reviews
- [ ] Respond to user feedback

### Marketing
- [ ] Share on social media
- [ ] Create promotional materials
- [ ] Set up App Store optimization (ASO)
- [ ] Consider running ads (optional)

### Maintenance
- [ ] Monitor analytics
- [ ] Track downloads
- [ ] Plan first update
- [ ] Respond to reviews
- [ ] Fix bugs as reported

## 📅 Important Dates

- **Today**: February 16, 2026
- **Ramadan 2026**: ~March 2026 (check Islamic calendar)
- **Submission Target**: 2-4 weeks before Ramadan
- **Recommended Deadline**: February 20-27, 2026

## 🆘 Common Issues & Solutions

### Issue: Build Processing Forever
- **Solution**: Wait 30-60 minutes. Check for email from Apple.

### Issue: Missing Compliance
- **Solution**: Go to build, click "Manage" next to export compliance

### Issue: Screenshots Wrong Size
- **Solution**: Check dimensions exactly match requirements

### Issue: Icon Rejected
- **Solution**: Ensure no transparency, no rounded corners, exactly 1024×1024

### Issue: Crash on Launch
- **Solution**: Test on real device, check console logs, fix before submitting

### Issue: Rejected for Location Usage
- **Solution**: Clearly explain why location is needed in description and review notes

### Issue: Rejected for Content
- **Solution**: Ensure all Islamic content is respectful and appropriate

## 📞 Support

### Apple Resources
- **App Store Connect**: https://appstoreconnect.apple.com
- **Developer Portal**: https://developer.apple.com
- **Developer Forums**: https://developer.apple.com/forums
- **Support**: https://developer.apple.com/contact

### ASO Resources
- **App Annie**: App store analytics
- **Sensor Tower**: ASO tools
- **AppTweak**: Keyword optimization

---

**Last Updated**: February 16, 2026  
**Version**: 1.0.0  
**Status**: 📋 Ready to start preparation

**Estimated Time to Complete**: 5-10 days
- Asset creation: 2-3 days
- Testing: 1-2 days
- Metadata preparation: 1 day
- Upload and submission: 1 day
- Review time: 1-3 days

**Good luck with your submission! 🚀**
