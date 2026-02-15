# Hadith verification with Dorar.net (الدرر السنية)

The app uses [Dorar.net](https://dorar.net/hadith) (الموسوعة الحديثية) to verify that hadiths shown are authenticated as **Sahih** when possible.

## API

- **Endpoint:** `https://dorar.net/dorar_api.json?skey=SEARCH_TERM`
- **Method:** GET
- **Response:** JSON with `ahadith.result` (HTML string of hadith entries; each may include "خلاصة حكم المحدث: صحيح").

## Curl tests

From the repo root (or any terminal):

**Bash / WSL:**
```bash
# Search by keyword (e.g. صيام)
curl -s "https://dorar.net/dorar_api.json?skey=صيام" | head -c 800

# Search a hadith phrase (URL-encoded)
curl -s "https://dorar.net/dorar_api.json?skey=من%20صام%20رمضان%20إيماناً%20واحتساباً"
```

**PowerShell (Windows):**
```powershell
# Search by keyword
$r = Invoke-WebRequest -Uri "https://dorar.net/dorar_api.json?skey=صيام" -UseBasicParsing
$r.Content.Substring(0, [Math]::Min(1500, $r.Content.Length))
```

**Expected:** JSON like `{"ahadith":{"result":"...<html>...صحيح......"}}`. The `result` field contains HTML with hadith entries; we look for "خلاصة حكم المحدث" followed by "صحيح" (or "إسناده صحيح") to consider the hadith verified.

**Note:** Some environments (e.g. Node, PowerShell, or strict networks) may receive a short response (e.g. a "المزيد" link only). The app runs in the user’s browser, so verification there typically gets the full result. For local curl/script runs, full HTML may depend on client/network.

## In the app

- **`src/lib/dorar.ts`** — Client: `verifyHadithWithDorar(hadithText)` calls the API, parses the HTML for a Sahih ruling, and caches the result (30 days) in `localStorage`.
- **`src/lib/api.ts`** — `useHadithOfTheDay` and `useDhikrHadith` run Dorar verification in the background for hadiths not from a known Sahih source (e.g. البخاري, مسلم, متفق عليه). When verified, the UI shows **"صحيح حسب الدرر"**.
- **Home** — "حديث اليوم" (Bukhari or fallback) and the day hadith (RAMADAN_DAY_HADITHS) are verified when possible; badge shown when Dorar returns Sahih.
- **Subha** — Dhikr hadiths (Nawawi or fallback) are verified; badge shown when Sahih.

## Static hadith script

To verify all static hadiths (data.ts, Subha, etc.) from the command line:

```bash
node scripts/verify-hadith-dorar.mjs
```

Requires Node 18+ (for `fetch`). The script prints `VERIFIED` or `NOT FOUND AS SAHIH` per hadith and rate-limits requests.

## References

- [Dorar.net hadith search](https://dorar.net/hadith)
- [check-hadith (jQuery + Dorar)](https://github.com/adelpro/check-hadith)
