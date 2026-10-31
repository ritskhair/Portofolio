# 🐉 DRACO Portofolio — Muhammad Harits Khairiansyah

Personal engineering portfolio website for **Muhammad Harits Khairiansyah**, specialized in **Automation Engineering & Industrial IoT**.

**Theme:** DRACO — Dark Navy (`#0A0F1E`), Electric Blue (`#1E90FF`), and Fire Orange (`#FF6B00`)  
**Design Reference:** [alfari.my.id](https://www.alfari.my.id/)  
**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (zero external dependencies)  
**Hosting:** GitHub Pages

---

## 🏛️ Website Architecture (4 Main Sections)

1. **Home (`#home`):**
   - Opening headline, role title, CTA buttons (*Explore Experience* & *Download CV*).
   - Right side: `FOTOku.jpg` within an industrial rounded card featuring a rotating DRACO gear backdrop and live status badge.

2. **About Me (`#about`):**
   - **Triptych 3-Column Top:**
     - Left: Greeting *"HELLO, I'M"* + Full Name + Role + Key Metrics (3.26 GPA, 2 Internships, 4+ Projects).
     - Center: Transparent cutout portrait (`khairi.png`) with glowing cyber rings and Surabaya location pill.
     - Right: Detailed bio paragraphs and technical specialization specs.
   - **Education Experience Bottom:**
     - Horizontal Connected Stepper Roadmap connecting SMPIT Al Uswah Surabaya ➔ MA Darul Fikri Sidoarjo ➔ Institut Teknologi Sepuluh Nopember (ITS).

3. **Experience (`#experience`):**
   - **Interactive Pill Tabs (ala alfari.my.id):**
     - 🏢 **Internship:** PT Indoprima Gemilang & PT Sumber Graha Sejahtera (Sampoerna Kayoe).
     - 🚀 **Projects:** Plastic Waste Shredder, Three-Phase Energy Monitoring, IoT Access Security System, IoT Packing Monitoring.
     - 📜 **Certificates & Achievements:** VSGA Junior Mobile Programmer, Kongres IKMVI, OLIVIA IX, CAD-IT Industry 4.0, PLC Training (with click-to-zoom Lightbox modal).
     - ⚡ **Skills:** 4-Card Bento Grid (Embedded IoT, Industrial Automation, Cloud/Web Monitoring, Soft Skills & Languages).

4. **Contact Me (`#contact`):**
   - Closing section *"THANK YOU — Let's Work Together!"*.
   - Direct contact channel cards: Email, WhatsApp, LinkedIn, Instagram, GitHub, and Location.
   - Signature DRACO footer.

---

## 📁 Project Structure

```
Portofolio/
├── index.html                 # Main website markup (4 distinct sections)
├── styles.css                 # DRACO dark industrial styles & responsive rules
├── script.js                  # Tab switching, Lightbox modal & scroll spy
├── favicon.png                # Tab browser icon
├── .gitignore                 # Ignores node_modules/ and temporary files
├── README.md                  # Documentation
└── assets/
    ├── documents/
    │   └── CV Khairi_12-10-2026.pdf
    └── images/
        ├── 3phasemonitoring.jpg
        ├── aluswah.jpg
        ├── Dafi.png
        ├── DRACO.jpeg
        ├── DRACO_transparent.png
        ├── Foto tim.jpg
        ├── FOTOku.jpg
        ├── ITS.png
        ├── khairi.png
        ├── Muhammad Harits Khairiansyah_IKMVI.png
        ├── pencacahsampah.jpg
        ├── Screenshot 2026-06-04 092534.png
        └── Sertifikat JMP_page-0001.jpg
```

---

## 🚀 How to Run & Deploy

### Run Locally
Simply double-click `index.html` in your file explorer to open it in any web browser.

### Deploy to GitHub Pages
```bash
git add .
git commit -m "feat: restructure portfolio into 4 sections with interactive tabs and roadmap"
git push -u origin main
```
Enable GitHub Pages in your repository **Settings > Pages > Branch: main / (root)**.
