# Audio Files for Notifications

## Salah ala el Naby Audio

To enable real audio playback for Salah ala el Naby (الصلاة على النبي) notifications:

1. Download or record an authentic Arabic audio file of the Salawat (الصلاة على النبي)
2. Name the file: `salah-ala-naby.mp3`
3. Place it in this directory: `public/audio/`

### Recommended Audio Content

The audio should contain one of these supplications:

- **اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ**
  - "Allāhumma ṣalli ʿalā Muḥammadin wa-ʿalā āli Muḥammad, kamā ṣallayta ʿalā Ibrāhīma wa-ʿalā āli Ibrāhīm"

- **اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ**
  - "Allāhumma bārik ʿalā Muḥammadin wa-ʿalā āli Muḥammad, kamā bārakta ʿalā Ibrāhīma wa-ʿalā āli Ibrāhīm"

### Audio Requirements

- **Format**: MP3 (recommended for compatibility)
- **Duration**: 5-15 seconds
- **Quality**: Clear, audible recitation
- **Source**: Use authentic recordings from verified sources

### Where to Find Audio

You can find authentic Salawat audio from:

1. Islamic audio websites (e.g., IslamicFinder, IslamWay)
2. YouTube videos (download and convert to MP3)
3. Islamic apps with downloadable content
4. Record your own recitation

### Fallback Behavior

If the audio file is not found, the app will automatically fall back to text-to-speech using the device's Arabic voice.

---

## Technical Notes

- The audio file is loaded from: `/audio/salah-ala-naby.mp3`
- File path is relative to the `public` folder
- Make sure the audio file has proper permissions
- For mobile apps, the audio is bundled during the build process

## Building the App

After adding the audio file, rebuild the app:

```bash
npm run build
npm run cap:sync
```

---

جزاكم الله خيراً 💚
