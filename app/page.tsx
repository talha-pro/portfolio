"use client";

import { useState, useEffect, useRef } from "react";

type Theme = "dark" | "light";

const ALL_GROUPS = [
  {
    key: "Frontend",
    tag: "{ }",
    items: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript ES6+",
      "HTML5",
      "CSS3",
      "SCSS/SASS",
      "Redux Toolkit",
      "React Query",
      "Material UI",
      "Ant Design",
      "Tailwind CSS",
      "Styled Components",
      "Figma",
    ],
  },
  {
    key: "Testing",
    tag: "✓",
    items: [
      "Cypress",
      "Jest",
      "React Testing Library",
      "WCAG 2.2 Accessibility",
    ],
  },
  {
    key: "Tools",
    tag: "⚙",
    items: [
      "Webpack",
      "Claude Code",
      "Claude Design",
      "Codex",
      "Figma Make",
      "ESLint",
      "Prettier",
      "Husky",
      "Git",
      "GitHub Actions",
      "Sentry",
    ],
  },
  {
    key: "Backend",
    tag: "⌘",
    items: [
      "Python",
      "FastAPI",
      "Node.js",
      "MongoDB",
      "REST APIs",
      "OpenAI API",
      "Supabase",
    ],
  },
  {
    key: "Industry",
    tag: "◆",
    items: [
      "React Native (Expo)",
      "Microservices",
      "System Design",
      "Agile/Scrum",
      "PWA",
    ],
  },
];

const FILTERS = ["All", "Frontend", "Testing", "Tools", "Backend", "Industry"];

const EXPERIENCES = [
  {
    id: "dg-senior",
    title: "Senior Software Engineer",
    company: "Designgurus LLC",
    tag: "Full-time",
    period: "Jul 2023 – Jan 2026",
    location: "Remote · Redmond, WA",
    bullets: [
      "Led the Next.js 12 → 14 migration to the App Router, modernizing the rendering architecture across the platform.",
      'Built an "Ask AI" GPT-4 teaching assistant that reached a 92% user satisfaction rating.',
      "Sustained 99% uptime and 95+ Lighthouse scores across core product surfaces.",
      "Drove test coverage to 80%, cutting production bugs by 65%.",
      "Shipped an Admin Suite that contributed to a 40% increase in user retention.",
      "Built an AI image-generation dashboard and mentored engineers on the team.",
    ],
  },
  {
    id: "dg-founding",
    title: "Founding Software Engineer",
    company: "Designgurus LLC",
    tag: "Founding",
    period: "Jun 2022 – Jun 2023",
    location: "Remote",
    bullets: [
      "First engineering hire — shipped the MVP in 4 months working directly with the founders.",
      "Built the Interactive Course Player featuring Monaco Editor, Excalidraw, quizzes, and video.",
      "Created a 50+ component reusable UI library that cut development time by 40%.",
      "Built a React Native flashcard app and a Puppeteer-based PDF certificate microservice.",
    ],
  },
  {
    id: "creditper",
    title: "Front End Developer",
    company: "CreditPer Financial Services Ltd.",
    tag: "Full-time",
    period: "Aug 2020 – May 2022",
    location: "Islamabad, PK",
    bullets: [
      "Built the company site on Gatsby.js (90+ Lighthouse), generating 500+ monthly leads.",
      "Delivered a Retailer Portal serving 200+ retailers and a Careers Portal (Next.js SSR, JWT auth, AWS S3).",
      "Built Meezan Souq — an e-commerce platform for Meezan Bank, Pakistan's first Shariah-compliant marketplace.",
      "Automated CRM sync for 50,000+ records and PDF contract generation at 1,000+ documents/month.",
    ],
  },
  {
    id: "freelance",
    title: "Frontend Developer — Autodesk Construction Cloud",
    company: "Freelance",
    tag: "Contract",
    period: "2020 – 2021",
    location: "Remote",
    bullets: [
      "Built Autodesk Construction Cloud frontend features with React and SCSS.",
      "Implemented client-side report generation using jsPDF and html2canvas.",
    ],
  },
];

const PROJECTS = [
  {
    num: "01",
    badge: "RAG · AGENT",
    name: "Lead Gen AI Agent",
    desc: "A retrieval-augmented support agent that qualifies and routes leads automatically — grounded in a vector knowledge base for accurate, on-brand responses.",
    stack: ["n8n", "OpenAI", "Pinecone VectorDB", "RAG"],
  },
  {
    num: "02",
    badge: "FULL-STACK",
    name: "AI Job Accelerator",
    desc: "A full-stack dashboard using the OpenAI API with custom system prompting for tailored resume generation and end-to-end application tracking.",
    stack: ["React", "OpenAI API", "System Prompting", "Node.js"],
  },
];

const SKILL_COUNT = ALL_GROUPS.reduce((n, g) => n + g.items.length, 0);

const F = {
  space: "var(--font-space-grotesk), sans-serif",
  inter: "var(--font-inter), system-ui, sans-serif",
  mono: "var(--font-jetbrains), monospace",
};

export default function Home() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [filter, setFilter] = useState("All");
  const [openExp, setOpenExp] = useState<Record<string, boolean>>({
    "dg-senior": true,
  });
  const rootRef = useRef<HTMLDivElement>(null);

  const visitReported = useRef(false);
  useEffect(() => {
    if (visitReported.current) return;
    visitReported.current = true;
    fetch("/api/visit", { method: "POST" }).catch(() => {});
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));

    const reveal = (el: HTMLElement) => {
      const delay = el.getAttribute("data-delay") ?? "0";
      el.style.transitionDelay = delay + "ms";
      el.style.transition =
        "opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1)";
      el.style.opacity = "1";
      el.style.transform = "none";
    };

    const inView = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };

    els.forEach((el) => {
      if (inView(el)) reveal(el);
    });

    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              reveal(e.target as HTMLElement);
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
      );
      els.forEach((el) => {
        if (el.style.opacity !== "1") io?.observe(el);
      });
    } else {
      els.forEach(reveal);
    }

    const fallback = setTimeout(() => {
      els.forEach((el) => {
        if (el.style.opacity !== "1") reveal(el);
      });
    }, 1600);

    return () => {
      io?.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  const filteredGroups =
    filter === "All" ? ALL_GROUPS : ALL_GROUPS.filter((g) => g.key === filter);

  const toggleExp = (id: string) =>
    setOpenExp((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div
      ref={rootRef}
      data-theme={theme}
      style={{
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: F.inter,
        minHeight: "100vh",
        transition: "background .4s ease, color .4s ease",
        overflowX: "hidden",
      }}
    >
      {/* ====== NAV ====== */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          background: "color-mix(in srgb, var(--bg) 72%, transparent)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <a
            href="#top"
            aria-label="Talha Khan home"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              textDecoration: "none",
              color: "var(--text)",
            }}
          >
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 38,
                height: 38,
                borderRadius: 10,
                border: "1.5px solid var(--accent-line)",
                background: "var(--accent-soft)",
                fontFamily: F.mono,
                fontWeight: 700,
                fontSize: 15,
                color: "var(--accent)",
                letterSpacing: "-0.5px",
              }}
            >
              TK
            </span>
            <span
              style={{
                fontFamily: F.space,
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: "-0.2px",
              }}
            >
              Talha Khan
            </span>
          </a>

          <div
            className="hidden md:flex"
            style={{ alignItems: "center", gap: 4 }}
          >
            {["About", "Skills", "Experience", "Projects", "Contact"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="nav-link"
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    textDecoration: "none",
                    color: "var(--muted)",
                    fontSize: 14,
                    fontWeight: 500,
                    transition: "color .2s, background .2s",
                  }}
                >
                  {item}
                </a>
              ),
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              aria-label="Toggle color theme"
              title="Toggle theme"
              className="theme-btn"
              style={{
                display: "grid",
                placeItems: "center",
                width: 38,
                height: 38,
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--card)",
                cursor: "pointer",
                transition: "border-color .2s, background .2s",
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "1.5px solid var(--text)",
                  background:
                    "linear-gradient(90deg, var(--text) 0 50%, transparent 50% 100%)",
                }}
              />
            </button>
            <a
              href="#contact"
              className="cta-btn"
              style={{
                padding: "9px 18px",
                borderRadius: 10,
                background: "var(--accent)",
                color: "#04100F",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
                transition: "transform .2s, box-shadow .2s",
              }}
            >
              Get in touch
            </a>
          </div>
        </div>
      </nav>

      {/* ====== HERO ====== */}
      <header
        id="top"
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "clamp(70px,12vh,130px) 24px clamp(60px,9vh,100px)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundImage:
              "radial-gradient(var(--grid) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, #000 20%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, #000 20%, transparent 75%)",
            animation: "gridPan 20s linear infinite",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -120,
            left: "12%",
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, var(--accent-soft), transparent 68%)",
            filter: "blur(50px)",
            animation: "blobFloat 16s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 40,
            right: "8%",
            width: 440,
            height: 440,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(63,208,202,0.12), transparent 70%)",
            filter: "blur(60px)",
            animation: "blobFloat2 20s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto" }}>
          <div
            data-reveal
            style={{
              opacity: 0,
              transform: "translateY(24px)",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "7px 14px",
              borderRadius: 100,
              border: "1px solid var(--accent-line)",
              background: "var(--accent-soft)",
              fontFamily: F.mono,
              fontSize: 12.5,
              color: "var(--accent)",
              letterSpacing: "0.3px",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--accent)",
                animation: "pulseDot 2.4s ease-in-out infinite",
              }}
            />
            Available for opportunities — remote &amp; global
          </div>

          <p
            data-reveal
            style={{
              opacity: 0,
              transform: "translateY(24px)",
              fontFamily: F.mono,
              color: "var(--muted)",
              fontSize: 15,
              margin: "34px 0 10px",
              letterSpacing: "0.2px",
            }}
          >
            const engineer = &#123;
          </p>
          <h1
            data-reveal
            style={{
              opacity: 0,
              transform: "translateY(24px)",
              fontFamily: F.space,
              fontWeight: 700,
              fontSize: "clamp(2.9rem,8vw,6rem)",
              lineHeight: 0.98,
              letterSpacing: "-0.03em",
              margin: 0,
              paddingLeft: "clamp(0px,2vw,28px)",
            }}
          >
            Talha Khan<span style={{ color: "var(--accent)" }}>.</span>
            <span className="sr-only">
              {" "}
              — Full Stack Engineer specializing in React, Next.js, and
              Agentic AI
            </span>
          </h1>
          <div
            data-reveal
            style={{
              opacity: 0,
              transform: "translateY(24px)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              gap: 12,
              paddingLeft: "clamp(0px,2vw,28px)",
              marginTop: 14,
            }}
          >
            <span
              style={{
                fontFamily: F.mono,
                color: "var(--muted)",
                fontSize: 15,
              }}
            >
              role:
            </span>
            <span
              style={{
                fontFamily: F.space,
                fontWeight: 500,
                fontSize: "clamp(1.3rem,3.2vw,2rem)",
                color: "var(--accent-2)",
                letterSpacing: "-0.01em",
              }}
            >
              &quot;Full Stack Engineer&quot;
            </span>
          </div>
          <p
            data-reveal
            style={{
              opacity: 0,
              transform: "translateY(24px)",
              fontFamily: F.mono,
              color: "var(--muted)",
              fontSize: 15,
              margin: "8px 0 0",
            }}
          >
            &#125;;
          </p>

          <p
            data-reveal
            data-delay="80"
            style={{
              opacity: 0,
              transform: "translateY(24px)",
              maxWidth: 640,
              margin: "32px 0 0",
              fontSize: "clamp(1.05rem,2vw,1.25rem)",
              lineHeight: 1.6,
              color: "color-mix(in srgb, var(--text) 82%, transparent)",
            }}
          >
            I bridge the gap between{" "}
            <span style={{ color: "var(--text)", fontWeight: 600 }}>
              ambiguous product requirements
            </span>{" "}
            and{" "}
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>
              robust, production-ready code
            </span>{" "}
            — shipping accessible, high-performance interfaces that move real
            business metrics.
          </p>

          <div
            data-reveal
            data-delay="140"
            style={{
              opacity: 0,
              transform: "translateY(24px)",
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              marginTop: 38,
            }}
          >
            <a
              href="#experience"
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "14px 26px",
                borderRadius: 12,
                background: "var(--accent)",
                color: "#04100F",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 15,
                transition: "transform .2s, box-shadow .2s",
                boxShadow: "0 6px 20px rgba(32,178,172,0.18)",
              }}
            >
              View Work <span aria-hidden="true">↓</span>
            </a>
            <a
              href="#contact"
              className="btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "14px 26px",
                borderRadius: 12,
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 15,
                transition: "transform .2s, border-color .2s, background .2s",
              }}
            >
              Contact Me
            </a>
          </div>

          <div
            data-reveal
            data-delay="200"
            style={{
              opacity: 0,
              transform: "translateY(24px)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 22,
              marginTop: 44,
              paddingTop: 26,
              borderTop: "1px solid var(--border)",
              fontFamily: F.mono,
              fontSize: 13.5,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "var(--muted)",
              }}
            >
              <span style={{ color: "var(--accent)" }}>◍</span> Islamabad,
              Pakistan
            </span>
            <a
              href="https://github.com/talha-pro"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              style={{
                color: "var(--muted)",
                textDecoration: "none",
                transition: "color .2s",
              }}
            >
              GitHub ↗
            </a>
            <a
              href="https://linkedin.com/in/talha-pro"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              style={{
                color: "var(--muted)",
                textDecoration: "none",
                transition: "color .2s",
              }}
            >
              LinkedIn ↗
            </a>
            <a
              href="mailto:hello@talhakhan.pro"
              className="social-link"
              style={{
                color: "var(--muted)",
                textDecoration: "none",
                transition: "color .2s",
              }}
            >
              hello@talhakhan.pro ↗
            </a>
          </div>
        </div>
      </header>

      {/* ====== ABOUT ====== */}
      <section
        id="about"
        aria-labelledby="about-h"
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "clamp(60px,10vh,110px) 24px",
        }}
      >
        <div data-reveal style={{ opacity: 0, transform: "translateY(24px)" }}>
          <p
            style={{
              fontFamily: F.mono,
              color: "var(--accent)",
              fontSize: 13,
              letterSpacing: "1px",
              margin: "0 0 14px",
            }}
          >
            // 01 — about
          </p>
          <h2
            id="about-h"
            style={{
              fontFamily: F.space,
              fontWeight: 700,
              fontSize: "clamp(1.9rem,4vw,3rem)",
              letterSpacing: "-0.02em",
              margin: 0,
              maxWidth: 800,
              lineHeight: 1.1,
            }}
          >
            Software engineer who ships features that{" "}
            <span style={{ color: "var(--accent)" }}>move the metric</span>.
          </h2>
        </div>

        <div
          className="about-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 48,
            marginTop: 44,
            alignItems: "start",
          }}
        >
          <div
            data-reveal
            data-delay="60"
            style={{
              opacity: 0,
              transform: "translateY(24px)",
              fontSize: "clamp(1rem,1.6vw,1.12rem)",
              lineHeight: 1.72,
              color: "color-mix(in srgb, var(--text) 80%, transparent)",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <p style={{ margin: 0 }}>
              I recently wrapped up a core role at an{" "}
              <strong style={{ color: "var(--text)", fontWeight: 600 }}>
                ex-FAANG-founded startup
              </strong>
              , working directly with founders, designers, and cross-functional
              teams under tight timelines. That environment sharpened how I
              approach ambiguity — turning fuzzy product ideas into architecture
              that scales.
            </p>
            <p style={{ margin: 0 }}>
              My philosophy is simple:{" "}
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                architectural efficiency
              </span>
              , ruthless{" "}
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                component reusability
              </span>
              , and shipping things that actually change business outcomes. I
              care about the invisible details — bundle size, Lighthouse scores,
              accessibility, and the developer experience of whoever inherits
              the code next.
            </p>
          </div>

          <div
            data-reveal
            data-delay="120"
            style={{
              opacity: 0,
              transform: "translateY(24px)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            {[
              { num: "5+", label: "years shipping" },
              { num: "95+", label: "Lighthouse score" },
              { num: "-65%", label: "bug rate" },
              { num: "+40%", label: "user retention" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  padding: 20,
                  borderRadius: 14,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                }}
              >
                <div
                  style={{
                    fontFamily: F.space,
                    fontWeight: 700,
                    fontSize: "1.9rem",
                    color: "var(--accent)",
                  }}
                >
                  {s.num}
                </div>
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    marginTop: 4,
                    fontFamily: F.mono,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== SKILLS ====== */}
      <section
        id="skills"
        aria-labelledby="skills-h"
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "clamp(50px,8vh,90px) 24px",
        }}
      >
        <div data-reveal style={{ opacity: 0, transform: "translateY(24px)" }}>
          <p
            style={{
              fontFamily: F.mono,
              color: "var(--accent)",
              fontSize: 13,
              letterSpacing: "1px",
              margin: "0 0 14px",
            }}
          >
            // 02 — stack
          </p>
          <h2
            id="skills-h"
            style={{
              fontFamily: F.space,
              fontWeight: 700,
              fontSize: "clamp(1.9rem,4vw,3rem)",
              letterSpacing: "-0.02em",
              margin: "0 0 8px",
              lineHeight: 1.1,
            }}
          >
            Tools I reach for
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 15, margin: 0 }}>
            Filter by category — {SKILL_COUNT} technologies and counting.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Filter skills"
          data-reveal
          data-delay="60"
          style={{
            opacity: 0,
            transform: "translateY(24px)",
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            margin: "30px 0 34px",
          }}
        >
          {FILTERS.map((f) => {
            const on = f === filter;
            return (
              <button
                key={f}
                role="tab"
                aria-selected={on}
                onClick={() => setFilter(f)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 100,
                  cursor: "pointer",
                  fontSize: 13.5,
                  fontWeight: 600,
                  fontFamily: F.mono,
                  transition: "all .2s",
                  background: on ? "var(--accent)" : "var(--card)",
                  color: on ? "#04100F" : "var(--muted)",
                  border: on
                    ? "1px solid transparent"
                    : "1px solid var(--border)",
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
            gap: 16,
          }}
        >
          {filteredGroups.map((group) => (
            <div
              key={`${group.key}-${filter}`}
              className="hover-card skill-card-appear"
              style={{
                padding: 22,
                borderRadius: 16,
                border: "1px solid var(--border)",
                background: "var(--card)",
                transition: "border-color .3s, background .3s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    color: "var(--accent)",
                    fontFamily: F.mono,
                    fontSize: 13,
                  }}
                >
                  {group.tag}
                </span>
                <span
                  style={{
                    fontFamily: F.space,
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                >
                  {group.key}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {group.items.map((skill) => (
                  <span
                    key={skill}
                    className="skill-tag"
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      background: "var(--card2)",
                      border: "1px solid var(--border)",
                      fontSize: 13,
                      color: "color-mix(in srgb, var(--text) 88%, transparent)",
                      fontFamily: F.mono,
                      transition: "color .2s, border-color .2s, background .2s",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====== EXPERIENCE ====== */}
      <section
        id="experience"
        aria-labelledby="exp-h"
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "clamp(50px,8vh,90px) 24px",
        }}
      >
        <div data-reveal style={{ opacity: 0, transform: "translateY(24px)" }}>
          <p
            style={{
              fontFamily: F.mono,
              color: "var(--accent)",
              fontSize: 13,
              letterSpacing: "1px",
              margin: "0 0 14px",
            }}
          >
            // 03 — experience
          </p>
          <h2
            id="exp-h"
            style={{
              fontFamily: F.space,
              fontWeight: 700,
              fontSize: "clamp(1.9rem,4vw,3rem)",
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Where I&apos;ve shipped
          </h2>
        </div>

        <div
          style={{
            marginTop: 40,
            position: "relative",
            paddingLeft: "clamp(0px,4vw,34px)",
          }}
        >
          {EXPERIENCES.map((exp) => {
            const open = !!openExp[exp.id];
            return (
              <div
                key={exp.id}
                data-reveal
                style={{
                  opacity: 0,
                  transform: "translateY(24px)",
                  position: "relative",
                  marginBottom: 16,
                }}
              >
                <div
                  className="hover-card"
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    background: "var(--card)",
                    overflow: "hidden",
                    transition: "border-color .3s",
                  }}
                >
                  <button
                    aria-expanded={open}
                    onClick={() => toggleExp(exp.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "22px 24px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 16,
                      color: "var(--text)",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: F.space,
                            fontWeight: 600,
                            fontSize: "clamp(1.05rem,2vw,1.25rem)",
                          }}
                        >
                          {exp.title}
                        </span>
                        <span
                          style={{
                            padding: "3px 9px",
                            borderRadius: 6,
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                            fontSize: 11.5,
                            fontFamily: F.mono,
                          }}
                        >
                          {exp.tag}
                        </span>
                      </div>
                      <div
                        style={{
                          color: "var(--accent-2)",
                          fontSize: 14.5,
                          marginTop: 5,
                          fontWeight: 500,
                        }}
                      >
                        {exp.company}
                      </div>
                      <div
                        style={{
                          color: "var(--muted)",
                          fontSize: 13,
                          marginTop: 4,
                          fontFamily: F.mono,
                        }}
                      >
                        {exp.period} · {exp.location}
                      </div>
                    </div>
                    <span
                      aria-hidden="true"
                      style={{
                        fontSize: 22,
                        color: "var(--accent)",
                        lineHeight: 1,
                        transition: "transform .3s ease",
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      ⌄
                    </span>
                  </button>
                  <div
                    style={{
                      overflow: "hidden",
                      transition: "max-height .5s ease, opacity .4s ease",
                      maxHeight: open ? 900 : 0,
                      opacity: open ? 1 : 0,
                    }}
                  >
                    <ul
                      style={{
                        margin: 0,
                        padding: "0 24px 24px 42px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 11,
                        color:
                          "color-mix(in srgb, var(--text) 78%, transparent)",
                        fontSize: 14.5,
                        lineHeight: 1.6,
                      }}
                    >
                      {exp.bullets.map((b, i) => (
                        <li key={i} style={{ position: "relative" }}>
                          <span
                            aria-hidden="true"
                            style={{
                              position: "absolute",
                              left: -18,
                              top: 9,
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "var(--accent)",
                            }}
                          />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ====== AI PROJECTS ====== */}
      <section
        id="projects"
        aria-labelledby="proj-h"
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "clamp(60px,10vh,110px) 24px",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -40,
            right: -60,
            width: 460,
            height: 460,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, var(--accent-soft), transparent 70%)",
            filter: "blur(70px)",
            animation: "blobFloat 22s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto" }}>
          <div
            data-reveal
            style={{ opacity: 0, transform: "translateY(24px)" }}
          >
            <p
              style={{
                fontFamily: F.mono,
                color: "var(--accent)",
                fontSize: 13,
                letterSpacing: "1px",
                margin: "0 0 14px",
              }}
            >
              // 04 — ai builds · 2026
            </p>
            <h2
              id="proj-h"
              style={{
                fontFamily: F.space,
                fontWeight: 700,
                fontSize: "clamp(1.9rem,4vw,3rem)",
                letterSpacing: "-0.02em",
                margin: "0 0 8px",
                lineHeight: 1.1,
              }}
            >
              What I&apos;m building now
            </h2>
            <p
              style={{
                color: "var(--muted)",
                fontSize: 15,
                margin: 0,
                maxWidth: 560,
              }}
            >
              Current-gen AI systems — agents, retrieval, and full-stack tooling
              built around modern LLM APIs.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
              gap: 18,
              marginTop: 38,
            }}
          >
            {PROJECTS.map((p) => (
              <article
                key={p.num}
                data-reveal
                className="project-card"
                style={{
                  opacity: 0,
                  transform: "translateY(24px)",
                  display: "flex",
                  flexDirection: "column",
                  padding: 28,
                  borderRadius: 18,
                  border: "1px solid var(--border)",
                  background:
                    "linear-gradient(160deg, var(--card2), var(--card))",
                  transition: "border-color .3s, transform .3s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 18,
                  }}
                >
                  <span
                    style={{
                      fontFamily: F.mono,
                      fontSize: 12,
                      color: "var(--accent)",
                      padding: "5px 10px",
                      border: "1px solid var(--accent-line)",
                      borderRadius: 100,
                      background: "var(--accent-soft)",
                    }}
                  >
                    {p.badge}
                  </span>
                  <span
                    style={{
                      fontFamily: F.space,
                      fontWeight: 700,
                      fontSize: "1.6rem",
                      color: "var(--border)",
                    }}
                  >
                    {p.num}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: F.space,
                    fontWeight: 600,
                    fontSize: "1.4rem",
                    margin: "0 0 12px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {p.name}
                </h3>
                <p
                  style={{
                    margin: "0 0 20px",
                    color: "color-mix(in srgb, var(--text) 78%, transparent)",
                    fontSize: 15,
                    lineHeight: 1.6,
                    flex: 1,
                  }}
                >
                  {p.desc}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      style={{
                        padding: "5px 11px",
                        borderRadius: 7,
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        fontSize: 12.5,
                        fontFamily: F.mono,
                        color: "var(--muted)",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ====== EDUCATION ====== */}
      <section
        aria-labelledby="edu-h"
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "clamp(40px,6vh,70px) 24px",
        }}
      >
        <div
          data-reveal
          style={{
            opacity: 0,
            transform: "translateY(24px)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            padding: "26px 28px",
            borderRadius: 16,
            border: "1px solid var(--border)",
            background: "var(--card)",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: F.mono,
                color: "var(--accent)",
                fontSize: 13,
                letterSpacing: "1px",
                margin: "0 0 10px",
              }}
            >
              // 05 — education
            </p>
            <h2
              id="edu-h"
              style={{
                fontFamily: F.space,
                fontWeight: 600,
                fontSize: "clamp(1.2rem,2.4vw,1.6rem)",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              BS Software Engineering
            </h2>
            <div
              style={{ color: "var(--muted)", fontSize: 14.5, marginTop: 6 }}
            >
              COMSATS University Islamabad
            </div>
          </div>
          <div
            style={{
              fontFamily: F.mono,
              color: "var(--accent-2)",
              fontSize: 15,
              padding: "8px 16px",
              border: "1px solid var(--accent-line)",
              borderRadius: 100,
              background: "var(--accent-soft)",
            }}
          >
            2015 — 2019
          </div>
        </div>
      </section>

      {/* ====== CONTACT ====== */}
      <section
        id="contact"
        aria-labelledby="contact-h"
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "clamp(70px,11vh,120px) 24px",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundImage:
              "radial-gradient(var(--grid) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(ellipse 70% 80% at 50% 50%, #000 10%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 80% at 50% 50%, #000 10%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: -140,
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, var(--accent-soft), transparent 68%)",
            filter: "blur(70px)",
            animation: "blobFloat2 24s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          data-reveal
          style={{
            opacity: 0,
            transform: "translateY(24px)",
            position: "relative",
            maxWidth: 760,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "7px 15px",
              borderRadius: 100,
              border: "1px solid var(--accent-line)",
              background: "var(--accent-soft)",
              fontFamily: F.mono,
              fontSize: 12.5,
              color: "var(--accent)",
              marginBottom: 26,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--accent)",
                animation: "pulseDot 2.4s ease-in-out infinite",
              }}
            />
            Available for opportunities
          </div>
          <h2
            id="contact-h"
            style={{
              fontFamily: F.space,
              fontWeight: 700,
              fontSize: "clamp(2.2rem,5.5vw,4rem)",
              letterSpacing: "-0.03em",
              margin: 0,
              lineHeight: 1.02,
            }}
          >
            Let&apos;s build something{" "}
            <span style={{ color: "var(--accent)" }}>production-grade</span>.
          </h2>
          <p
            style={{
              color: "color-mix(in srgb, var(--text) 78%, transparent)",
              fontSize: "clamp(1.05rem,2vw,1.2rem)",
              lineHeight: 1.6,
              margin: "22px auto 0",
              maxWidth: 560,
            }}
          >
            Have a role, a product, or a hard front-end problem? My inbox is
            open — I reply to every serious message.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 14,
              marginTop: 38,
            }}
          >
            <a
              href="mailto:hello@talhakhan.pro"
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "15px 30px",
                borderRadius: 12,
                background: "var(--accent)",
                color: "#04100F",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 15,
                transition: "transform .2s, box-shadow .2s",
                boxShadow: "0 6px 20px rgba(32,178,172,0.2)",
              }}
            >
              hello@talhakhan.pro
            </a>
            <a
              href="tel:+923255898066"
              className="btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "15px 28px",
                borderRadius: 12,
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: 15,
                fontFamily: F.mono,
                transition: "border-color .2s, background .2s",
              }}
            >
              +92 325 5898066
            </a>
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer
        style={{ borderTop: "1px solid var(--border)", padding: "34px 24px" }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 34,
                height: 34,
                borderRadius: 9,
                border: "1.5px solid var(--accent-line)",
                background: "var(--accent-soft)",
                fontFamily: F.mono,
                fontWeight: 700,
                fontSize: 13,
                color: "var(--accent)",
              }}
            >
              TK
            </span>
            <span
              style={{
                color: "var(--muted)",
                fontSize: 13.5,
                fontFamily: F.mono,
              }}
            >
              © 2026 Talha Khan — built from scratch, no template
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontFamily: F.mono,
              fontSize: 13.5,
            }}
          >
            <a
              href="https://github.com/talha-pro"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              style={{
                color: "var(--muted)",
                textDecoration: "none",
                transition: "color .2s",
              }}
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/talha-pro"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              style={{
                color: "var(--muted)",
                textDecoration: "none",
                transition: "color .2s",
              }}
            >
              LinkedIn
            </a>
            <a
              href="mailto:hello@talhakhan.pro"
              className="social-link"
              style={{
                color: "var(--muted)",
                textDecoration: "none",
                transition: "color .2s",
              }}
            >
              Email
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
