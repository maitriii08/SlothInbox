/**
 * SlothInbox Master Controller & Application Logic (app.js)
 * Full-scale production engine: State Management, Intent Extraction, Kanban Drag & Drop,
 * Modal Controls, Telemetry Profiling, and Offline Gemma Simulation.
 */

class SlothAppController {
    constructor() {
        this.items = [];
        this.rawBuffer = [];
        this.activeCategory = "all";
        this.activeView = "feed";
        this.theme = "light";
        this.searchQuery = "";
        this.sortMode = "newest";
        this.telemetryLogs = [];
        this.draggedItemId = null;
        this.isEngineActive = true;
    }

    init() {
        this.loadStorage();
        this.initTheme();
        this.bindEvents();
        this.renderAll();
        this.logTelemetry("SlothInbox workspace initialized cleanly in local sandbox.");
    }

    // ------------------------------------------------------------------------
    // STORAGE & PERSISTENCE
    // ------------------------------------------------------------------------
    loadStorage() {
        const storedItems = localStorage.getItem("sloth_inbox_items");
        const storedRaw = localStorage.getItem("sloth_inbox_raw");
        const storedTheme = localStorage.getItem("sloth_inbox_theme");

        if (storedItems) {
            try { this.items = JSON.parse(storedItems); } catch (e) { this.items = []; }
        } else {
            // First run: load initial curated dataset
            this.items = [...SlothData.initialSampleItems];
            this.saveItems();
        }

        if (storedRaw) {
            try { this.rawBuffer = JSON.parse(storedRaw); } catch (e) { this.rawBuffer = []; }
        }

        if (storedTheme) {
            this.theme = storedTheme;
        }

        this.telemetryLogs = [...SlothData.telemetrySeeds];
    }

    saveItems() {
        localStorage.setItem("sloth_inbox_items", JSON.stringify(this.items));
        this.updateCounts();
    }

    saveRaw() {
        localStorage.setItem("sloth_inbox_raw", JSON.stringify(this.rawBuffer));
        this.updateCounts();
    }

    // ------------------------------------------------------------------------
    // THEME HANDLING
    // ------------------------------------------------------------------------
    initTheme() {
        document.documentElement.setAttribute("data-theme", this.theme);
        this.updateThemeUI();
    }

    toggleTheme() {
        this.theme = this.theme === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", this.theme);
        localStorage.setItem("sloth_inbox_theme", this.theme);
        this.updateThemeUI();
        this.showToast(`Switched to ${this.theme === "light" ? "Light" : "OLED Dark"} mode`);
    }

    updateThemeUI() {
        const icon = document.getElementById("themeIcon");
        const label = document.getElementById("themeLabel");
        if (icon && label) {
            if (this.theme === "dark") {
                icon.className = "fa-regular fa-moon";
                label.innerText = "Dark Mode";
            } else {
                icon.className = "fa-regular fa-sun";
                label.innerText = "Light Mode";
            }
        }
    }

    // ------------------------------------------------------------------------
    // EVENT BINDINGS
    // ------------------------------------------------------------------------
    bindEvents() {
        // Navigation Views
        document.querySelectorAll(".nav-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const targetView = btn.dataset.view;
                this.switchView(targetView);
            });
        });

        // Theme Toggle
        const themeBtn = document.getElementById("themeToggleBtn");
        if (themeBtn) themeBtn.addEventListener("click", () => this.toggleTheme());

        // Category Chips
        document.querySelectorAll(".category-chip").forEach(chip => {
            chip.addEventListener("click", () => {
                document.querySelectorAll(".category-chip").forEach(c => c.classList.remove("active"));
                chip.classList.add("active");
                this.activeCategory = chip.dataset.category;
                this.renderFeed();
            });
        });

        // Search
        const searchInput = document.getElementById("globalSearchInput");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.renderFeed();
            });
        }

        // Sort Select
        const sortSelect = document.getElementById("streamSortSelect");
        if (sortSelect) {
            sortSelect.addEventListener("change", (e) => {
                this.sortMode = e.target.value;
                this.renderFeed();
            });
        }

        // Ingestion Composer Buttons
        const processBtn = document.getElementById("btnProcessClutter");
        if (processBtn) {
            processBtn.addEventListener("click", () => this.handleIngestion());
        }

        const sampleBtn = document.getElementById("quickSampleBtn");
        if (sampleBtn) {
            sampleBtn.addEventListener("click", () => this.loadSampleData());
        }

        const exportBtn = document.getElementById("exportDataBtn");
        if (exportBtn) {
            exportBtn.addEventListener("click", () => this.exportJSON());
        }

        const clearComposerBtn = document.getElementById("clearComposerBtn");
        if (clearComposerBtn) {
            clearComposerBtn.addEventListener("click", () => {
                document.getElementById("clutterTextarea").value = "";
            });
        }

        // Drag & Drop Ingestion Zone
        const dropzone = document.getElementById("fileDropzone");
        const fileInput = document.getElementById("fileInputHidden");
        if (dropzone && fileInput) {
            dropzone.addEventListener("click", () => fileInput.click());
            dropzone.addEventListener("dragover", (e) => {
                e.preventDefault();
                dropzone.classList.add("drag-active");
            });
            dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag-active"));
            dropzone.addEventListener("drop", (e) => {
                e.preventDefault();
                dropzone.classList.remove("drag-active");
                if (e.dataTransfer.files.length > 0) {
                    this.readFile(e.dataTransfer.files[0]);
                }
            });
            fileInput.addEventListener("change", (e) => {
                if (e.target.files.length > 0) {
                    this.readFile(e.target.files[0]);
                }
            });
        }

        // Modal Controls
        this.bindModalEvents();

        // Keyboard Shortcuts (Cmd + K)
        window.addEventListener("keydown", (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                this.toggleCommandPalette();
            }
            if (e.key === "Escape") {
                this.closeAllModals();
            }
        });

        // Command Palette clicks
        document.querySelectorAll(".command-row").forEach(row => {
            row.addEventListener("click", () => {
                const cmd = row.dataset.cmd;
                this.executeCommand(cmd);
            });
        });
    }

    // ------------------------------------------------------------------------
    // INGESTION & LOCAL HEURISTIC PARSING ENGINE
    // ------------------------------------------------------------------------
    handleIngestion() {
        const textarea = document.getElementById("clutterTextarea");
        const rawText = textarea.value.trim();
        if (!rawText) {
            this.showToast("Please enter or paste text to organize.");
            return;
        }

        this.triggerProgressBar();
        this.logTelemetry("Initiating client-side token parsing via Gemma heuristics...");

        setTimeout(() => {
            const fragments = rawText.split(/\n|,|;/).map(f => f.trim()).filter(f => f.length > 3);
            let createdCount = 0;

            fragments.forEach(frag => {
                const detected = this.classifyFragment(frag);
                const newItem = {
                    id: "sloth-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
                    title: detected.title,
                    raw: frag,
                    category: detected.category,
                    status: "pending",
                    priority: detected.priority,
                    tags: detected.tags,
                    timestamp: "Just now",
                    likes: 0,
                    codeSnippet: detected.codeSnippet
                };
                this.items.unshift(newItem);
                createdCount++;
            });

            this.saveItems();
            textarea.value = "";
            this.renderAll();
            this.logTelemetry(`Organized ${createdCount} items into categories with 0 ms server delay.`);
            this.showToast(`Organized ${createdCount} items into your feed!`);
        }, 300);
    }

    classifyFragment(text) {
        const lower = text.toLowerCase();
        let category = "notes";
        let priority = "medium";
        let tags = [];
        let codeSnippet = null;

        // Check code
        if (SlothData.heuristics.code.some(k => lower.includes(k))) {
            category = "code";
            priority = lower.includes("bug") || lower.includes("fix") ? "high" : "medium";
            tags.push("development");
            if (lower.includes("sql")) tags.push("database");
            if (lower.includes("css") || lower.includes("layout")) tags.push("ui");
            if (lower.includes("git") || lower.includes("pr")) tags.push("vcs");
        }
        // Check finances
        else if (SlothData.heuristics.finances.some(k => lower.includes(k))) {
            category = "finances";
            priority = lower.includes("invoice") || lower.includes("bill") ? "high" : "medium";
            tags.push("expense");
            if (lower.includes("subscription")) tags.push("recurring");
        }
        // Check events
        else if (SlothData.heuristics.events.some(k => lower.includes(k))) {
            category = "events";
            priority = lower.includes("urgent") || lower.includes("standup") ? "high" : "low";
            tags.push("calendar");
            if (lower.includes("meeting") || lower.includes("sync")) tags.push("sync");
        }
        // Check tasks
        else if (SlothData.heuristics.tasks.some(k => lower.includes(k))) {
            category = "tasks";
            priority = "medium";
            tags.push("actionable");
        }

        // Title creation
        let title = text.length > 55 ? text.substring(0, 52) + "..." : text;
        title = title.charAt(0).toUpperCase() + title.slice(1);

        return { category, priority, tags, codeSnippet, title };
    }

    readFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            document.getElementById("clutterTextarea").value = content;
            this.showToast(`Loaded ${file.name} into composer.`);
        };
        reader.readAsText(file);
    }

    // ------------------------------------------------------------------------
    // RENDERING
    // ------------------------------------------------------------------------
    renderAll() {
        this.renderFeed();
        this.renderKanban();
        this.renderRawBuffer();
        this.renderAnalytics();
        this.renderTelemetry();
        this.updateCounts();
    }

    renderFeed() {
        const container = document.getElementById("postCardsContainer");
        const emptyState = document.getElementById("feedEmptyState");
        if (!container) return;

        let filtered = this.items.filter(item => {
            const matchesCat = this.activeCategory === "all" || item.category === this.activeCategory;
            const matchesSearch = !this.searchQuery || 
                item.title.toLowerCase().includes(this.searchQuery) || 
                item.raw.toLowerCase().includes(this.searchQuery) ||
                item.tags.some(t => t.toLowerCase().includes(this.searchQuery));
            return matchesCat && matchesSearch;
        });

        // Sorting
        if (this.sortMode === "oldest") {
            filtered = [...filtered].reverse();
        } else if (this.sortMode === "priority") {
            const rank = { critical: 4, high: 3, medium: 2, low: 1 };
            filtered = [...filtered].sort((a, b) => (rank[b.priority] || 0) - (rank[a.priority] || 0));
        } else if (this.sortMode === "title") {
            filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        }

        document.getElementById("visibleItemCount").innerText = filtered.length;
        document.getElementById("totalItemCount").innerText = this.items.length;

        if (filtered.length === 0) {
            container.innerHTML = "";
            container.appendChild(emptyState);
            emptyState.style.display = "flex";
            return;
        }

        emptyState.style.display = "none";
        container.innerHTML = filtered.map(item => this.createCardHTML(item)).join("");

        // Attach Card Action Listeners
        this.bindCardActions();
    }

    createCardHTML(item) {
        const prioClass = `prio-${item.priority}`;
        const tagClass = `tag-${item.category}`;

        return `
            <article class="item-card" data-id="${item.id}">
                <div class="card-topbar">
                    <div class="card-category-tag ${tagClass}">
                        <i class="fa-solid fa-folder"></i>
                        <span>${this.getCategoryLabel(item.category)}</span>
                    </div>
                    <div class="card-topbar-actions">
                        <span class="priority-pill ${prioClass}">${item.priority}</span>
                        <button class="card-icon-action" data-action="edit" title="Edit Item">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="card-icon-action" data-action="delete" title="Delete Item">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content-body">
                    <h3 class="card-main-title">${this.escapeHTML(item.title)}</h3>
                    <p class="card-raw-snippet">${this.escapeHTML(item.raw)}</p>
                    ${item.codeSnippet ? `<pre class="card-code-block"><code>${this.escapeHTML(item.codeSnippet)}</code></pre>` : ""}
                    <div class="card-tags-row">
                        ${item.tags.map(t => `<span class="tag-label">#${this.escapeHTML(t)}</span>`).join("")}
                    </div>
                </div>
                <div class="card-action-bar">
                    <span class="card-timestamp"><i class="fa-regular fa-clock"></i> ${item.timestamp}</span>
                    <div class="card-buttons-group">
                        <button class="card-icon-action" data-action="like">
                            <i class="fa-regular fa-heart"></i> <span>${item.likes || 0}</span>
                        </button>
                        <button class="card-icon-action" data-action="status">
                            <i class="fa-solid fa-arrows-spin"></i> <span>${item.status}</span>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    getCategoryLabel(catId) {
        const found = SlothData.categories.find(c => c.id === catId);
        return found ? found.label : "General";
    }

    bindCardActions() {
        document.querySelectorAll(".item-card").forEach(card => {
            const id = card.dataset.id;
            card.querySelectorAll("[data-action]").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const action = btn.dataset.action;
                    if (action === "delete") this.deleteItem(id);
                    if (action === "edit") this.openEditModal(id);
                    if (action === "like") this.likeItem(id, btn);
                    if (action === "status") this.cycleItemStatus(id);
                });
            });
        });
    }

    deleteItem(id) {
        this.items = this.items.filter(i => i.id !== id);
        this.saveItems();
        this.renderAll();
        this.showToast("Item deleted.");
    }

 likeItem(id, btn) {
    const item = this.items.find(i => i.id === id);
    if (item) {
        item.likes = (item.likes || 0) + 1;
        btn.querySelector("span").innerText = item.likes;
        btn.querySelector("i").className = "fa-solid fa-heart";
        btn.style.color = "var(--danger-red)";
        this.saveItems();
    }
}
```[cite: 4]

With this toggle logic:
```javascript
likeItem(id, btn) {
    const item = this.items.find(i => i.id === id);
    if (item) {
        if (!item.isLiked) {
            item.isLiked = true;
            item.likes = (item.likes || 0) + 1;
            btn.querySelector("i").className = "fa-solid fa-heart";
            btn.style.color = "var(--danger-red)";
        } else {
            item.isLiked = false;
            item.likes = Math.max(0, (item.likes || 1) - 1);
            btn.querySelector("i").className = "fa-regular fa-heart";
            btn.style.color = "";
        }
        btn.querySelector("span").innerText = item.likes;
        this.saveItems();
    }
}

    cycleItemStatus(id) {
        const statuses = ["pending", "inprogress", "scheduled", "completed"];
        const item = this.items.find(i => i.id === id);
        if (item) {
            const nextIdx = (statuses.indexOf(item.status) + 1) % statuses.length;
            item.status = statuses[nextIdx];
            this.saveItems();
            this.renderAll();
            this.showToast(`Updated status to ${item.status}`);
        }
    }

    // ------------------------------------------------------------------------
    // KANBAN DRAG & DROP
    // ------------------------------------------------------------------------
    renderKanban() {
        const cols = ["pending", "inprogress", "scheduled", "completed"];
        cols.forEach(col => {
            const dropArea = document.getElementById(`colDrop${this.capitalize(col)}`);
            const badge = document.getElementById(`badge${this.capitalize(col)}Count`);
            if (!dropArea) return;

            const colItems = this.items.filter(i => i.status === col);
            if (badge) badge.innerText = colItems.length;

            dropArea.innerHTML = colItems.map(item => `
                <div class="kanban-card" draggable="true" data-id="${item.id}">
                    <div class="kanban-card-title">${this.escapeHTML(item.title)}</div>
                    <div class="kanban-card-desc">${this.escapeHTML(item.raw)}</div>
                    <div class="kanban-card-footer">
                        <span>#${item.category}</span>
                        <span>${item.priority}</span>
                    </div>
                </div>
            `).join("");

            // Setup drag events
            dropArea.querySelectorAll(".kanban-card").forEach(kcard => {
                kcard.addEventListener("dragstart", (e) => {
                    this.draggedItemId = kcard.dataset.id;
                    e.dataTransfer.setData("text/plain", kcard.dataset.id);
                });
            });

            dropArea.addEventListener("dragover", (e) => {
                e.preventDefault();
                dropArea.classList.add("dragover");
            });

            dropArea.addEventListener("dragleave", () => {
                dropArea.classList.remove("dragover");
            });

            dropArea.addEventListener("drop", (e) => {
                e.preventDefault();
                dropArea.classList.remove("dragover");
                const id = e.dataTransfer.getData("text/plain") || this.draggedItemId;
                if (id) {
                    const item = this.items.find(i => i.id === id);
                    if (item && item.status !== col) {
                        item.status = col;
                        this.saveItems();
                        this.renderAll();
                        this.showToast(`Moved to ${col}`);
                    }
                }
            });
        });
    }

    // ------------------------------------------------------------------------
    // RAW BUFFER TABLE
    // ------------------------------------------------------------------------
    renderRawBuffer() {
        const tbody = document.getElementById("rawBufferTbody");
        if (!tbody) return;

        if (this.items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted);">No raw fragments stored.</td></tr>`;
            return;
        }

        tbody.innerHTML = this.items.slice(0, 15).map((item, index) => `
            <tr>
                <td><input type="checkbox"></td>
                <td><span style="font-family: var(--font-mono); font-size: 0.72rem;">#${index + 1}</span></td>
                <td><strong>${this.escapeHTML(item.title)}</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">${this.escapeHTML(item.raw)}</span></td>
                <td><span class="tag-label">${item.category}</span></td>
                <td>${item.raw.length} chars</td>
                <td>
                    <button class="link-btn" onclick="slothApp.deleteItem('${item.id}')">Delete</button>
                </td>
            </tr>
        `).join("");
    }

    // ------------------------------------------------------------------------
    // ANALYTICS & TELEMETRY
    // ------------------------------------------------------------------------
    renderAnalytics() {
        const count = this.items.length;
        document.getElementById("statInferenceRuns").innerText = count + 4;
        document.getElementById("statAvgLatency").innerText = "2.4 ms";
        document.getElementById("statTokensProcessed").innerText = count * 38;

        const historyContainer = document.getElementById("auditHistoryList");
        if (historyContainer) {
            historyContainer.innerHTML = this.telemetryLogs.map(l => `
                <div class="audit-entry-row">
                    <span>${this.escapeHTML(l.msg)}</span>
                    <span style="font-family: var(--font-mono); color: var(--text-muted); font-size: 0.7rem;">${l.time}</span>
                </div>
            `).join("");
        }
    }

    renderTelemetry() {
        const box = document.getElementById("telemetryTerminalBox");
        if (!box) return;

        box.innerHTML = this.telemetryLogs.map(log => `
            <div class="term-line">
                <span class="term-time">[${log.time}]</span>
                <span>${this.escapeHTML(log.msg)}</span>
            </div>
        `).join("");
        box.scrollTop = box.scrollHeight;
    }

    logTelemetry(msg) {
        const time = new Date().toTimeString().split(" ")[0];
        this.telemetryLogs.push({ time, msg });
        if (this.telemetryLogs.length > 50) this.telemetryLogs.shift();
        this.renderTelemetry();
    }

    updateCounts() {
        const total = this.items.length;
        document.getElementById("sidebarStreamCount").innerText = total;
        document.getElementById("sidebarBufferCount").innerText = total;
        document.getElementById("metricTotalTasks").innerText = total;

        const actionables = this.items.filter(i => i.category === "code" || i.category === "tasks").length;
        document.getElementById("metricActionable").innerText = actionables;
        document.getElementById("metricSavedTime").innerText = (total * 2) + "m";

        // Category breakdown badges
        SlothData.categories.forEach(cat => {
            const count = this.items.filter(i => i.category === cat.id).length;
            const el = document.getElementById(`count${this.capitalize(cat.id)}`);
            if (el) el.innerText = count;
        });

        const allEl = document.getElementById("countAll");
        if (allEl) allEl.innerText = total;

        this.renderCategoryBars();
    }

    renderCategoryBars() {
        const list = document.getElementById("categoryBarsList");
        if (!list) return;

        const total = this.items.length || 1;
        list.innerHTML = SlothData.categories.map(cat => {
            const count = this.items.filter(i => i.category === cat.id).length;
            const pct = Math.round((count / total) * 100);
            return `
                <div class="cat-bar-item">
                    <div class="cat-bar-meta">
                        <span>${cat.label}</span>
                        <span style="font-weight: 600;">${count} (${pct}%)</span>
                    </div>
                    <div class="cat-progress-track">
                        <div class="cat-progress-fill" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        }).join("");
    }

    // ------------------------------------------------------------------------
    // MODALS & DIALOGS
    // ------------------------------------------------------------------------
    bindModalEvents() {
        const editOverlay = document.getElementById("editModalOverlay");
        const closeEditBtn = document.getElementById("closeEditModalBtn");
        const cancelEditBtn = document.getElementById("cancelEditModalBtn");
        const saveEditBtn = document.getElementById("saveEditModalBtn");

        const closeEdit = () => editOverlay.classList.remove("open");
        if (closeEditBtn) closeEditBtn.addEventListener("click", closeEdit);
        if (cancelEditBtn) cancelEditBtn.addEventListener("click", closeEdit);

        if (saveEditBtn) {
            saveEditBtn.addEventListener("click", () => {
                const id = document.getElementById("editItemId").value;
                const item = this.items.find(i => i.id === id);
                if (item) {
                    item.title = document.getElementById("editItemTitle").value;
                    item.raw = document.getElementById("editItemContent").value;
                    item.category = document.getElementById("editItemCategory").value;
                    item.status = document.getElementById("editItemStatus").value;
                    item.priority = document.getElementById("editItemPriority").value;
                    this.saveItems();
                    this.renderAll();
                    closeEdit();
                    this.showToast("Changes saved successfully.");
                }
            });
        }

        const cmdOverlay = document.getElementById("commandModalOverlay");
        if (cmdOverlay) {
            cmdOverlay.addEventListener("click", (e) => {
                if (e.target === cmdOverlay) cmdOverlay.classList.remove("open");
            });
        }
    }

    openEditModal(id) {
        const item = this.items.find(i => i.id === id);
        if (!item) return;

        document.getElementById("editItemId").value = item.id;
        document.getElementById("editItemTitle").value = item.title;
        document.getElementById("editItemContent").value = item.raw;
        document.getElementById("editItemCategory").value = item.category;
        document.getElementById("editItemStatus").value = item.status;
        document.getElementById("editItemPriority").value = item.priority;

        document.getElementById("editModalOverlay").classList.add("open");
    }

    toggleCommandPalette() {
        const overlay = document.getElementById("commandModalOverlay");
        if (overlay) {
            overlay.classList.toggle("open");
            if (overlay.classList.contains("open")) {
                document.getElementById("commandInput").focus();
            }
        }
    }

    closeAllModals() {
        document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("open"));
    }

    executeCommand(cmd) {
        this.closeAllModals();
        if (cmd === "feed") this.switchView("feed");
        if (cmd === "board") this.switchView("board");
        if (cmd === "raw") this.switchView("raw");
        if (cmd === "sample") this.loadSampleData();
        if (cmd === "theme") this.toggleTheme();
        if (cmd === "export") this.exportJSON();
    }

    switchView(viewName) {
        this.activeView = viewName;
        document.querySelectorAll(".view-panel").forEach(p => p.classList.remove("active"));
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));

        const targetPanel = document.getElementById(`panel${this.capitalize(viewName)}`);
        const targetBtn = document.getElementById(`nav${this.capitalize(viewName)}Btn`);

        if (targetPanel) targetPanel.classList.add("active");
        if (targetBtn) targetBtn.classList.add("active");

        const titles = {
            feed: "Organized Stream",
            board: "Kanban Board",
            raw: "Raw Buffer",
            analytics: "Metrics & Audit",
            settings: "Preferences"
        };
        document.getElementById("currentViewTitle").innerText = titles[viewName] || "Workspace";
    }

    // ------------------------------------------------------------------------
    // UTILITIES
    // ------------------------------------------------------------------------
    loadSampleData() {
        this.items = [...SlothData.initialSampleItems];
        this.saveItems();
        this.renderAll();
        this.showToast("Loaded curated sample dataset.");
    }

    exportJSON() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.items, null, 2));
        const dlAnchor = document.createElement("a");
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `slothinbox_export_${Date.now()}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
        this.showToast("Exported JSON records.");
    }

    triggerProgressBar() {
        const bar = document.getElementById("globalProgressBar");
        if (!bar) return;
        bar.style.width = "40%";
        setTimeout(() => { bar.style.width = "85%"; }, 100);
        setTimeout(() => { bar.style.width = "100%"; }, 250);
        setTimeout(() => { bar.style.width = "0%"; }, 400);
    }

    showToast(message) {
        const container = document.getElementById("toastContainer");
        if (!container) return;
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${this.escapeHTML(message)}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 200);
        }, 2400);
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    escapeHTML(str) {
        if (!str) return "";
        return str.replace(/[&<>'"]/g, tag => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;"
        }[tag] || tag));
    }
}

// Global Instantiation
const slothApp = new SlothAppController();
window.addEventListener("DOMContentLoaded", () => {
    slothApp.init();
});
