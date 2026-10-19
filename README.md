# SlothInbox 🦥

> **Local-First, Privacy-Preserving Intelligent Digital Workspace & Clutter Tidier**

SlothInbox is an offline-first productivity tool built for the Hacktoberfest *Slow and Steady* challenge. It automates sorting, prioritizing, and cataloging digital clutter—rough task notes, bug traces, billing reminders, and meeting syncs—directly inside the browser with zero external server dependencies, running on client-side heuristic classification and Google's open-weight Gemma architecture principles via WebGPU.

---

## 🚀 Key Features

* **100% Client-Side Privacy:** No external database or remote inference server. Personal thoughts, confidential receipts, and uncommitted code snippets never leave your browser.
* **Instant Clutter Ingestion:** Paste unstructured text dumps or rough task lists. The client-side parser automatically detects intent and categorizes them into Code, Tasks, Finances, Events, or Notes.
* **Interactive Kanban Board:** Drag and drop items between workflow stages (Pending, In Progress, Scheduled, Completed) with automatic state persistence.
* **Streamlined Single-File Architecture:** Self-contained reactive engine with embedded CSS design tokens, eliminating 404 script-loading errors, MIME-type mismatches, or broken asset paths.
* **Monochrome Minimalist UI:** High-contrast light mode and true OLED dark mode built with clean 1px borders, subtle tags, and zero distracting neon glows.
* **Offline Local Storage & JSON Export:** Automatically syncs with local storage and provides a one-click JSON database export for local backups.

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** Semantic HTML5, CSS3 Custom Properties (CSS Design Tokens, Responsive Flexbox & Grid, OLED Dark Mode)
* **Application Engine:** Embedded Vanilla JavaScript (Reactive State Machine, HTML5 Drag-and-Drop API, LocalStorage persistence)
* **AI & Heuristic Parser:** Client-side intent classification with zero external API calls
* **Hosting:** GitHub Pages
* ---

## 📦 Live Demo

Access the live web application:  
👉 **[https://maitriii08.github.io/SlothInbox/](https://maitriii08.github.io/SlothInbox/)**

---

## 🏆 Hacktoberfest 2026 Submission

Built for the **Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady**.
* **Partner Categories:** Best Use of Gemma, Best Use of GitHub Copilot
