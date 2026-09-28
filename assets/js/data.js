(() => {
  const TABLES = ["profile", "social_links", "skills", "skill_items", "experience", "projects", "resume"];
  const LEVELS = { beginner: 1, intermediate: 2, skillful: 3, advanced: 3, expert: 3 };
  const listeners = [];
  let current = null;

  const esc = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const text = (value) => (typeof value === "string" ? value.trim() : "");
  const list = (value) => (Array.isArray(value) ? value.map(text).filter(Boolean) : []);
  const visible = (rows) => rows.filter((row) => row && row.is_visible !== false);
  const byOrder = (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0);

  function splitTech(subtitle) {
    return text(subtitle).split(",").map((part) => part.trim()).filter(Boolean);
  }

  function normalizeFlow(flow) {
    let value = flow;
    if (typeof value === "string") {
      try { value = JSON.parse(value); } catch { value = null; }
    }
    if (!Array.isArray(value)) return null;
    const steps = value
      .map((step) => (Array.isArray(step) ? step : [step]).map(text).filter(Boolean))
      .filter((step) => step.length > 0);
    return steps.length > 1 ? steps : null;
  }

  function firstSentence(paragraph) {
    const clean = text(paragraph);
    const match = clean.match(/^.+?[.!?](?=\s|$)/);
    return match ? match[0] : clean;
  }

  function normalize(raw) {
    const profileRow = (raw.profile || [])[0] || {};
    const resumeRow = (raw.resume || [])[0] || {};
    const summary = list(profileRow.summary);

    const profile = {
      name: text(profileRow.name) || text(resumeRow.name),
      title: text(profileRow.title),
      tagline: text(profileRow.tagline) || text(profileRow.title),
      lede: firstSentence(summary[0] || ""),
      summary,
      worksOn: list(profileRow.works_on),
    };

    const socials = visible(raw.social_links || [])
      .sort(byOrder)
      .map((row) => ({ name: text(row.name), url: text(row.url), icon: row.icon }))
      .filter((row) => row.url);

    const items = visible(raw.skill_items || []).sort(byOrder);
    const skills = (raw.skills || [])
      .slice()
      .sort(byOrder)
      .map((group) => ({
        title: text(group.title),
        icon: group.icon,
        items: items
          .filter((item) => item.skill_category_id === group.id)
          .map((item) => {
            const level = text(item.level);
            return { name: text(item.name), level, rank: LEVELS[level.toLowerCase()] || 2, image: text(item.image_url) };
          }),
      }))
      .filter((group) => group.items.length > 0);

    const experience = visible(raw.experience || [])
      .sort(byOrder)
      .map((row) => ({
        role: text(row.role),
        company: text(row.company),
        start: text(row.start_date),
        end: text(row.end_date),
        current: /present/i.test(text(row.end_date)),
        highlights: list(row.highlights),
      }));

    const projects = visible(raw.projects || [])
      .sort((a, b) => Number(!!b.is_featured) - Number(!!a.is_featured) || byOrder(a, b))
      .map((row) => ({
        title: text(row.title),
        subtitle: text(row.subtitle),
        tech: splitTech(row.subtitle),
        description: text(row.description),
        image: text(row.image_url),
        link: text(row.project_link),
        linkText: text(row.link_text) || "View",
        featured: !!row.is_featured,
        flow: normalizeFlow(row.flow),
      }));

    const education = (Array.isArray(resumeRow.education) ? resumeRow.education : []).map((row) => ({
      degree: text(row.degree),
      institution: text(row.institution),
      start: text(row.startDate),
      end: text(row.endDate),
      detail: text(row.score),
    }));

    const contact = {
      email: text(resumeRow.email),
      location: text(resumeRow.location),
      resumeLink: text(resumeRow.resume_download_link),
    };

    return { profile, socials, skills, experience, projects, education, contact, resume: resumeRow };
  }

  async function live(table) {
    if (typeof supabase === "undefined") throw new Error("supabase client missing");
    const { data, error } = await supabase.from(table).select("*").execute();
    if (error) throw new Error(error);
    if (!Array.isArray(data)) throw new Error(`${table}: bad payload`);
    return data;
  }

  async function fallback(table) {
    const response = await fetch(`assets/json/${table}.json`);
    if (!response.ok) throw new Error(`${table}.json: ${response.status}`);
    return response.json();
  }

  function emit(raw, source) {
    let content;
    try {
      content = normalize(raw);
    } catch (error) {
      console.error("content normalize failed", error);
      return;
    }
    content.source = source;
    current = content;
    document.documentElement.dataset.content = source;
    listeners.forEach((fn) => {
      try { fn(content); } catch (error) { console.error("render failed", error); }
    });
    document.dispatchEvent(new CustomEvent("site:content", { detail: content }));
  }

  function load() {
    let liveEmitted = false;
    const fallbackRaw = Promise.all(TABLES.map((t) => fallback(t).catch(() => []))).then((rows) =>
      Object.fromEntries(TABLES.map((t, i) => [t, rows[i]]))
    );

    fallbackRaw.then((raw) => {
      if (!liveEmitted) emit(raw, "fallback");
    });

    Promise.allSettled(TABLES.map(live)).then(async (results) => {
      if (!results.some((r) => r.status === "fulfilled")) return;
      const fb = await fallbackRaw;
      const raw = Object.fromEntries(
        TABLES.map((t, i) => [t, results[i].status === "fulfilled" && results[i].value.length ? results[i].value : fb[t]])
      );
      liveEmitted = true;
      emit(raw, "live");
    });
  }

  function onContent(fn) {
    listeners.push(fn);
    if (current) {
      try { fn(current); } catch (error) { console.error("render failed", error); }
    }
  }

  window.Site = window.Site || {};
  Object.assign(window.Site, { esc, onContent, normalize });
  Object.defineProperty(window.Site, "content", { get: () => current });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load, { once: true });
  } else {
    load();
  }
})();
