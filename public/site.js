const SEP = " :: ";

const ROOT = document.currentScript?.dataset.root ?? ".";

// Icons are inline Feather/Lucide line paths (no external dependency); they
// inherit the nav colour via currentColor, like the CV contact icons.
const NAV_LINKS = [
  {
    href: `${ROOT}/`,
    label: "Home",
    icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  },
  {
    href: `${ROOT}/history.html`,
    label: "History",
    icon: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  },
  {
    href: `${ROOT}/blogs/`,
    label: "Blogs",
    icon: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  },
  {
    href: `${ROOT}/cv.html`,
    label: "CV",
    icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  },
];

function renderNav() {
  const nav = document.querySelector("nav");
  if (!nav) return;
  const path = window.location.pathname;
  const homePath = new URL(NAV_LINKS[0].href, document.baseURI).pathname;
  nav.innerHTML = NAV_LINKS.map((link) => {
    const linkPath = new URL(link.href, document.baseURI).pathname;
    const current = path === linkPath || (linkPath !== homePath && path.startsWith(linkPath));
    const icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${link.icon}</svg>`;
    return `<a href="${link.href}"${current ? ' aria-current="page"' : ""}>${icon}${link.label}</a>`;
  }).join("");
  nav.querySelectorAll('a[aria-current="page"]').forEach((a) => {
    if (new URL(a.href).pathname !== path) return;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

renderNav();

function wrapBrackets(html) {
  return html.replace(/\([^)]+\)/g, '<span class="nowrap">$&</span>');
}

async function loadData() {
  const res = await fetch(`${ROOT}/public/data.json`);
  return res.json();
}

function listItems(items, transform = (x) => x) {
  return `<ul>${items.map((item) => `<li>${transform(item)}</li>`).join("")}</ul>`;
}

function collapsibleSection(summary, content) {
  return `<section><details><summary>${summary}</summary>${content}</details></section>`;
}

function renderJob(job) {
  const reflection = job.reflection
    ? `<section><h4>Reflection</h4><blockquote>"${job.reflection}"</blockquote></section>`
    : "";
  const responsibilities = `<section><h4>What I took from it</h4>${listItems(job.details, wrapBrackets)}</section>`;
  const skills = `<section><h4>Skills</h4><p class="skills">${job.skills.map((s) => `<code>${s}</code>`).join(SEP)}</p></section>`;

  return `
        <article>
            <h3><span class="nowrap">${job.role} -</span> <span class="nowrap">${job.company}</span></h3>
            <p class="meta">${job.start} - ${job.end || "Present"}${SEP}${job.location}</p>
            ${reflection}
            ${responsibilities}
            ${skills}
        </article>`;
}

function renderWork(work) {
  return work.map(renderJob).join("<hr />");
}

function renderQualification(qualification) {
  return qualification
    .split(/ (?=with |of |\()/)
    .map((p) => `<span class="nowrap">${p}</span>`)
    .join(" ");
}

function renderMajorSpecialisation(edu) {
  if (!edu.major && !edu.specialisation) return "";
  const major = edu.major ? `<div><span class="label">Major:</span> ${edu.major}</div>` : "";
  const spec = edu.specialisation ? `<div><span class="label">Specialisation:</span> ${edu.specialisation}</div>` : "";
  return `<section>${major}${spec}</section>`;
}

function renderEdu(edu) {
  const majorSpec = renderMajorSpecialisation(edu);
  const firstDetail = `<section>${listItems(edu.details.slice(0, 1), wrapBrackets)}</section>`;
  const awards =
    edu.details.length > 1 ? collapsibleSection("Academic Awards", listItems(edu.details.slice(1), wrapBrackets)) : "";
  const theatre = edu.theatre
    ? collapsibleSection(
        "Theatre Awards and Participation",
        `<p><em>And you thought I was joking about being musically involved.</em></p>${listItems(edu.theatre, wrapBrackets)}`,
      )
    : "";

  return `
        <article>
            <h3>${renderQualification(edu.qualification)}</h3>
            <p class="meta">${edu.start} - ${edu.end}${SEP}<span class="nowrap">${edu.institution}</span></p>
            ${majorSpec}
            ${firstDetail}
            ${awards}
            ${theatre}
        </article>`;
}

function renderEducation(education) {
  return education.map(renderEdu).join("<hr />");
}

function renderInterests(interests) {
  return `<div class="interests-list">${interests
    .map(
      (i) => `
        <article>
            <h3>${i.name}</h3>
            <p>${i.summary}</p>
        </article>`,
    )
    .join("")}</div>`;
}
