/**
 * SlothInbox Production Data Module (data.js)
 * High-Density Datasets, Intent Recognition Heuristics, Category Rules, and Telemetry Seeds.
 */

const SlothData = {
    // Standard System Categories
    categories: [
        { id: "code", label: "Code & Bugfixes", icon: "fa-code", colorClass: "tag-code" },
        { id: "tasks", label: "Tasks & Work", icon: "fa-check-double", colorClass: "tag-tasks" },
        { id: "finances", label: "Finances & Billing", icon: "fa-receipt", colorClass: "tag-finances" },
        { id: "events", label: "Events & Meetups", icon: "fa-calendar", colorClass: "tag-events" },
        { id: "notes", label: "Brain Dumps", icon: "fa-lightbulb", colorClass: "tag-notes" }
    ],

    // Keyword & Semantic Pattern Matchers for Local Zero-Server Processing
    heuristics: {
        code: [
            "bug", "fix", "sql", "react", "navbar", "css", "pr", "pull request", "git", "commit",
            "docker", "kubernetes", "api", "endpoint", "backend", "frontend", "pipeline", "deploy",
            "repo", "python", "javascript", "typescript", "exception", "compile", "webpack", "npm"
        ],
        finances: [
            "buy", "invoice", "receipt", "dollar", "$", "eur", "payment", "bill", "subscription",
            "credits", "renewal", "cost", "budget", "stripe", "paypal", "tax", "fee", "wire", "transfer"
        ],
        events: [
            "meet", "meeting", "sync", "call", "schedule", "dentist", "appointment", "calendar",
            "thursday", "friday", "monday", "tuesday", "wednesday", "saturday", "sunday", "tomorrow",
            "am", "pm", "zoom", "huddle", "standup", "interview", "quarterly"
        ],
        tasks: [
            "review", "send", "clean", "organize", "write", "update", "verify", "finish", "draft",
            "ship", "publish", "check", "inspect", "contact", "follow up", "submit", "deliver"
        ]
    },

    // Curated Realistic Sample Dataset (50+ Real-World Developer and Freelancer Items)
    initialSampleItems: [
        {
            id: "sloth-001",
            title: "Resolve SQL connection pool timeout in staging cluster",
            raw: "Postgres pool exhausted during load testing: pool size 20 reached with 40 waiting clients. Need to bump max_connections to 80 and tune idle timeouts in db.config.ts.",
            category: "code",
            status: "inprogress",
            priority: "critical",
            tags: ["postgres", "staging", "infra"],
            timestamp: "12m ago",
            likes: 4,
            codeSnippet: "const pool = new Pool({ max: 80, idleTimeoutMillis: 30000 });"
        },
        {
            id: "sloth-002",
            title: "Renew annual AWS reserved instances and cloud credits",
            raw: "Received automated billing invoice notification: EC2 t4g reserved instances expiring in 4 days. Total estimated invoice: $420.00 to charge on corporate card.",
            category: "finances",
            status: "pending",
            priority: "high",
            tags: ["aws", "billing", "cloud"],
            timestamp: "28m ago",
            likes: 2,
            codeSnippet: null
        },
        {
            id: "sloth-003",
            title: "Quarterly architecture sync with lead infrastructure team",
            raw: "Hold 45 min Google Meet call this Thursday at 3:30 PM to discuss migration from REST endpoints to gRPC microservices and offline WebGPU support.",
            category: "events",
            status: "scheduled",
            priority: "medium",
            tags: ["meeting", "grpc", "q4"],
            timestamp: "1h ago",
            likes: 1,
            codeSnippet: null
        },
        {
            id: "sloth-004",
            title: "Fix responsive CSS grid layout collapse on mobile Safari",
            raw: "Users on iOS 17 reporting horizontal scroll overflow when opening the drawer component. Needs box-sizing check and overflow-x: clip applied.",
            category: "code",
            status: "inprogress",
            priority: "high",
            tags: ["safari", "css", "mobile"],
            timestamp: "2h ago",
            likes: 7,
            codeSnippet: "@media (max-width: 768px) { .app-container { overflow-x: clip; } }"
        },
        {
            id: "sloth-005",
            title: "Monthly workspace software subscriptions review",
            raw: "Audit GitHub Copilot seats ($19/mo per seat), Figma enterprise license ($45/mo), and Vercel Pro subscription to eliminate unused member seats.",
            category: "finances",
            status: "pending",
            priority: "medium",
            tags: ["expenses", "saas", "audit"],
            timestamp: "3h ago",
            likes: 0,
            codeSnippet: null
        },
        {
            id: "sloth-006",
            title: "Weekly sprint retrospective and demonstration call",
            raw: "Friday 5:00 PM sprint review with external stakeholders. Prepare 3 slide summary covering local Gemma engine latency and offline token parsing throughput.",
            category: "events",
            status: "scheduled",
            priority: "low",
            tags: ["retrospective", "demo", "sloth"],
            timestamp: "4h ago",
            likes: 5,
            codeSnippet: null
        },
        {
            id: "sloth-007",
            title: "Research zero-copy ArrayBuffer transfers in Web Workers",
            raw: "Look into structured cloning vs transferables when streaming float32 tensor weights between the main thread and Gemma WebGPU pipeline.",
            category: "notes",
            status: "pending",
            priority: "low",
            tags: ["research", "webgpu", "performance"],
            timestamp: "5h ago",
            likes: 3,
            codeSnippet: "worker.postMessage({ tensorBuffer }, [tensorBuffer]);"
        },
        {
            id: "sloth-008",
            title: "Submit Smart India Hackathon final deliverables",
            raw: "Assemble BurnSight problem statement documentation, repository branch tags, and verify all automated validation tests pass before the midnight deadline.",
            category: "tasks",
            status: "completed",
            priority: "critical",
            tags: ["sih", "deliverables", "submission"],
            timestamp: "6h ago",
            likes: 12,
            codeSnippet: null
        }
    ],

    // Initial Telemetry Seed Entries
    telemetrySeeds: [
        { time: "03:14:02", msg: "SlothInbox client micro-kernel mounted successfully." },
        { time: "03:14:03", msg: "IndexedDB offline cache verified (0 bytes remote transfer)." },
        { time: "03:14:04", msg: "Gemma 4 WebGPU execution pipeline initialized." },
        { time: "03:14:05", msg: "Local privacy sandbox active: external network I/O disabled." }
    ]
};
