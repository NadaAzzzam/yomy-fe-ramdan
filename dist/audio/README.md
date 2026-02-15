# Audio Files for Notifications

## Salah ala el Naby Audio

To enable real audio playback for Salah ala el Naby (الصلاة على النبي) notifications:

1. Download or record an authentic Arabic audio file of the Salawat (الصلاة على النبي)
2. Name the file: `salah-ala-naby.mp3`
3. Place it in this directory: `public/audio/`

---

## 🎙️ Natural Human Voice (Like Al-Shafie App)

**The app sounds best with a real human reciter** — like the Al-Shafie app (صوت طبيعي مثل تطبيق الشافعي).  
Computer-generated (TTS) voice is not natural. Use a **real reciter’s recording**:

### Step-by-step (recommended)

1. **Open YouTube** and search (copy exactly):
   - **"الصلاة الإبراهيمية مشاري العفاسي"**  
     (Mishary Alafasy – very popular, calm voice)
   - Or: **"الصلاة على النبي مقرئ"**
   - Or: **"Salawat Ibrahim Mishary"**

2. **Pick a short clip** (about 5–20 seconds) of the Salawat.

3. **Convert to MP3**:
   - Go to **ytmp3.cc** or **y2mate.com**
   - Paste the video URL → choose **MP3** → Download

4. **Trim if needed** (optional):  
   Use a free trimmer (e.g. Audacity, or an online trimmer) so the file is only the first 5–15 seconds.

5. **Rename** the file to: **`salah-ala-naby.mp3`**

6. **Put it here**: **`public/audio/salah-ala-naby.mp3`**

7. In the app: **دفتر رمضان** → **الصلاة على النبي** → press the test button to verify.

### Why this sounds like Al-Shafie

Al-Shafie uses **real reciter voices**, not text-to-speech. Using a clip from Mishary Alafasy (or any trusted reciter) gives you the same kind of natural, calm human voice.

---

### Recommended Audio Content

The audio should contain a beautiful and calm recitation of:

**اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ**
- "Allāhumma ṣalli ʿalā sayyidinā Muḥammadin wa-ʿalā āli sayyidinā Muḥammad"

Or the longer version (Salat Ibrahim):

**اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ**
- "Allāhumma ṣalli ʿalā Muḥammadin wa-ʿalā āli Muḥammad, kamā ṣallayta ʿalā Ibrāhīma wa-ʿalā āli Ibrāhīm, innaka ḥamīdun majīd"

### Audio Requirements

- **Format**: MP3 (recommended for compatibility)
- **Duration**: 5-20 seconds
- **Quality**: Clear, beautiful, and calm recitation
- **Voice**: **Real human reciter** (like Al-Shafie) — avoid TTS for best result
- **Source**: Use authentic recordings from verified Islamic sources

### Where to Find Beautiful Audio

1. **YouTube** (best for natural voice like Al-Shafie):
   - "الصلاة الإبراهيمية مشاري العفاسي"
   - "الصلاة على النبي صوت جميل وهادئ"
   - "Salawat Ibrahim beautiful recitation"
   - Then convert to MP3 (ytmp3.cc, y2mate.com).

2. **Professional reciters** (search their name + "صلاة إبراهيمية" or "salawat"):
   - Mishary Rashid Alafasy (مشاري العفاسي)
   - Saad Al-Ghamdi (سعد الغامدي)
   - Abdul Basit (عبد الباسط)

3. **Islamic apps**: Muslim Pro, Al-Shafie, Al-Quran — listen, then use a similar style from YouTube if you need a file.

4. **Or record your own** with a calm voice.

### Testing the Audio

After placing the audio file:
1. Go to the Notes page (دفتر رمضان)
2. Navigate to "الصلاة على النبي" section
3. Click the test button to verify the audio works
4. The button will show:
   - ✅ Green if audio is found and plays correctly
   - ❌ Red if audio file is missing

### Fallback Behavior

If the audio file is not found, the app will automatically fall back to text-to-speech using the device's Arabic voice.

---

## Android: Voice when app is closed/background

For the **custom voice to play when the app is closed or in the background**, the same file must be in Android’s raw resources:

1. **Path**: `android/app/src/main/res/raw/salah_ala_naby.mp3`  
   (name must be lowercase with underscores, no hyphens.)

2. **Copy**:  
   `public/audio/salah-ala-naby.mp3` → `android/app/src/main/res/raw/salah_ala_naby.mp3`

3. **Rebuild**:  
   `npm run build` then `npx cap sync android`.

The app uses a dedicated notification channel for Salah ala Naby with this sound, so the system plays it even when the app is not running.

---

## Technical Notes

- The audio file is loaded from: `/audio/salah-ala-naby.mp3`
- File path is relative to the `public` folder
- Make sure the audio file has proper permissions
- For mobile apps, the audio is bundled during the build process
- Android: custom notification sound uses `res/raw/salah_ala_naby.mp3` (see above)

## Building the App

After adding the audio file, rebuild the app:

```bash
npm run build
npm run cap:sync
```

---

جزاكم الله خيراً 💚

## Example Audio Sources

### Recommended YouTube Videos (convert to MP3):

1. Search: "الصلاة الإبراهيمية بصوت جميل"
2. Search: "اللهم صل على محمد Mishary Rashid"
3. Search: "Salawat Ibrahim beautiful recitation"

### Online MP3 Converters:

- ytmp3.cc
- y2mate.com
- onlinevideoconverter.com

**Note**: Always ensure you have the right to use and distribute any audio you download.
