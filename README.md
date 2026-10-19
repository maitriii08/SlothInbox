# SlothInbox 🦥

> **Local-First, Privacy-Preserving Intelligent Digital Workspace & Clutter Tidier**

SlothInbox is an offline-capable, client-side productivity system built for the Hacktoberfest *Slow and Steady* challenge. It automates the organization of messy digital clutter—unstructured notes, code bug reports, billing records, and calendar entries—into an actionable, categorized stream and Kanban workflow entirely on your local machine using client-side heuristics and Google's open-weight Gemma architecture via WebGPU.

---

## 🚀 Key Features

* **Zero-Server Processing & 100% Data Privacy:** Built on client-side WebGPU architecture. Your confidential meeting notes, code snippets, and financial receipts never leave your browser or hit external third-party servers.
* **Intelligent Clutter Ingestion:** Paste chaotic text dumps, upload Markdown/JSON files, or drop snippets directly into the composer. The local engine automatically classifies content into Code, Tasks, Finances, Events, or Notes.
* **Interactive Kanban Workflow:** Switch between an organized feed, an interactive drag-and-drop Kanban board, and a raw buffer inspector.
* **Subtle Monochrome Aesthetic:** A distraction-free design system featuring light and true OLED dark modes, 1px borders, and zero intrusive neon animations.
* **Keyboard-First Navigation:** Press `Cmd + K` (or `Ctrl + K`) anytime to invoke the Command Palette and switch workspaces, load datasets, or export backups.
* **Zero Infrastructure Overhead:** Deployed entirely as a static web client via GitHub Pages with no subscription costs, rate limits, or backend server bills.

---

## 🛠️ Tech Stack & Modular Architecture

* **Frontend:** Semantic HTML5, CSS3 Custom Properties (Design Tokens, Responsive Grid, OLED Dark Mode)
* **Application Layer:** Modular Vanilla JavaScript (State Machine, Drag & Drop API, LocalStorage persistence)
* **AI & Parser Engine:** Client-side heuristic intent extraction with Google Gemma 4 WebGPU execution sandbox
* **Deployment:** GitHub Pages
