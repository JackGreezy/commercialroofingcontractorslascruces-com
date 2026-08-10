#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] || process.cwd());
const publicDir = path.join(root, "public");
const styleTag = '<link href="/website-taste.css" id="rr-website-taste-css" rel="stylesheet"/>';
const scriptTag = '<script defer id="rr-website-taste-js" src="/website-taste.js"></script>';

const contactForm = `<form action="/api/submit" class="rr-contact-form" data-contact-form method="post">
<input name="page" type="hidden" value="/contact"/>
<input aria-hidden="true" autocomplete="off" class="hp-field" name="_company" tabindex="-1" type="text"/>
<label class="rr-contact-field">Name
<input autocomplete="name" name="name" placeholder="Your name" required type="text"/>
</label>
<label class="rr-contact-field">Phone
<input autocomplete="tel" name="phone" placeholder="Phone number" required type="tel"/>
</label>
<label class="rr-contact-field">Email
<input autocomplete="email" name="email" placeholder="Email address" required type="email"/>
</label>
<label class="rr-contact-field">Property Address
<input autocomplete="street-address" name="address" placeholder="Building address or roof location" required type="text"/>
</label>
<label class="rr-contact-field rr-contact-field--full">What do you need?
<select name="serviceType" required>
<option value="">Choose a roof service</option>
<option>Emergency Roof Leak Repair</option>
<option>Flat Roof Replacement Inspection</option>
<option>Commercial Roof Repair</option>
<option>Roof Coating Or Restoration</option>
<option>Commercial Roof Replacement</option>
<option>Roof Service Agreement</option>
<option>Not Sure Yet</option>
</select>
</label>
<label class="rr-contact-field">Timeline
<select name="timeline" required>
<option value="">Select a timeline</option>
<option>Emergency - active leak</option>
<option>Within 30 days</option>
<option>1-3 months</option>
<option>3-6 months</option>
<option>Planning / budgeting</option>
</select>
</label>
<label class="rr-contact-field rr-contact-field--full">Message
<textarea name="notes" placeholder="Tell us about the roof, issue, access, and schedule" required rows="7"></textarea>
</label>
<button class="rr-contact-submit" type="submit">Send Roof Request</button>
<p aria-live="polite" class="form-status" data-form-status role="status"></p>
</form>`;

const heroStories = [
  ["Roof Emergency", "Las Cruces Commercial Roof Help", "Active leak, storm damage, or a roof that cannot wait? Start here for emergency repair, inspection, coating, replacement, or an ongoing service plan.", "Get Roof Help Now", "emergency"],
  ["Know Before You Replace", "Flat Roof Replacement Inspections", "Get photos, condition findings, repair priorities, and a clear read on whether the roof should be repaired, restored, or replaced.", "Request an Inspection", "inspection"],
  ["Protect Remaining Roof Life", "Coating Or Replacement? Get A Straight Answer", "A viable roof may have restoration life left. A failed assembly needs a replacement plan. We help you make the right call for the building.", "Compare My Options", "coating"],
  ["Stay Ahead Of The Next Leak", "Commercial Roof Service Agreements", "Scheduled inspections and documented maintenance help facility teams catch small defects before monsoon weather turns them into interior damage.", "Start A Service Plan", "service-agreement"],
];

const heroMarkup = ([eyebrow, heading, body, action, request]) => `<div class="tag-left"><p>${eyebrow}</p>
<h2>${heading}</h2>
<h4>${body}</h4>
<a href="/contact?request=${request}">${action}</a>
</div>`;

const decisionDeck = `<!-- rr-las-cruces-decision:start -->
<section class="rr-lc-decision" aria-labelledby="rr-lc-decision-title">
  <div class="rr-lc-decision__intro">
    <p class="rr-lc-kicker">Start with what the roof is doing today</p>
    <h2 id="rr-lc-decision-title">One roof. Four smart next moves.</h2>
    <p>Tell us what is happening at the building. We will help turn the immediate problem into the right scope and a practical long-term plan.</p>
  </div>
  <div class="rr-lc-decision__routes">
    <a href="/contact?request=emergency"><strong>Water is getting in</strong><span>Protect the building and find the source.</span></a>
    <a href="/contact?request=inspection"><strong>Replacement is on the table</strong><span>Inspect first. Spend with evidence.</span></a>
    <a href="/contact?request=coating"><strong>The roof may be restorable</strong><span>Check coating eligibility and remaining life.</span></a>
    <a href="/contact?request=service-agreement"><strong>You need fewer surprises</strong><span>Put inspections and maintenance on a schedule.</span></a>
  </div>
</section>
<!-- rr-las-cruces-decision:end -->`;

const planningSections = `<!-- rr-las-cruces-planning:start -->
<section class="rr-lc-inspection">
  <div class="rr-lc-inspection__image"><img src="/ours/services/commercial-roof-inspection-commercial-roofing-contractors-las-cruces-nm.webp" alt="Flat commercial roof inspection in Las Cruces" loading="lazy"/></div>
  <div class="rr-lc-inspection__copy">
    <p class="rr-lc-kicker">Flat roof replacement inspection</p>
    <h2>Do not price a new roof until you know what failed.</h2>
    <p>Las Cruces sun, monsoon rain, wind, hail, rooftop traffic, drainage problems, and aging details do not affect every roof the same way. A replacement inspection gives you a documented starting point before a major capital decision.</p>
    <ul><li>Membrane, seams, flashings, drains, penetrations, and edge conditions</li><li>Photos and clear repair priorities</li><li>Repair, coating, or replacement direction</li><li>A scope that can support budgeting and contractor conversations</li></ul>
    <a class="rr-lc-button" href="/contact?request=inspection">Request The Inspection</a>
  </div>
</section>
<section class="rr-lc-field-board">
  <div class="rr-lc-field-board__heading"><p class="rr-lc-kicker">Make the roof earn its next dollar</p><h2>Repair it. Restore it. Replace it. Then keep it maintained.</h2></div>
  <div class="rr-lc-field-board__paths">
    <article><span>Repair</span><h3>Stop the leak and correct the cause</h3><p>Trace the entry point, stabilize the area, and document the repair boundary.</p><a href="/contact?request=repair">Request Roof Repair</a></article>
    <article><span>Restore</span><h3>Extend service life when the roof qualifies</h3><p>Evaluate moisture, adhesion, drainage, details, and substrate condition before recommending a coating.</p><a href="/contact?request=coating">Check Coating Eligibility</a></article>
    <article><span>Replace</span><h3>Plan the capital project with fewer unknowns</h3><p>Define system, insulation, drainage, phasing, access, occupied-space protection, and closeout needs.</p><a href="/contact?request=replacement">Plan Roof Replacement</a></article>
  </div>
</section>
<section class="rr-lc-service-plan">
  <div><p class="rr-lc-kicker">Commercial roof service agreements</p><h2>Get out of emergency mode.</h2><p>Scheduled roof visits create a working record of conditions, completed maintenance, recurring trouble spots, and upcoming capital needs. That means fewer surprises for owners, facility teams, and property managers.</p></div>
  <div class="rr-lc-service-plan__actions"><a class="rr-lc-button rr-lc-button--light" href="/contact?request=service-agreement">Ask About A Service Agreement</a><a href="/services/preventive-maintenance-programs">See Preventive Maintenance</a></div>
</section>
<section class="rr-lc-final">
  <p class="rr-lc-kicker">Commercial roofing across Las Cruces and Dona Ana County</p>
  <h2>Bring us the leak, the inspection question, or the capital plan.</h2>
  <p>You do not need to diagnose the roof before reaching out. Share the building address and what you are seeing. We will help identify the next move.</p>
  <a class="rr-lc-button" href="/contact">Request Commercial Roof Help</a>
</section>
<!-- rr-las-cruces-planning:end -->`;

const transformHomepage = (source) => {
  let html = source
    .replace(/<!-- rr-las-cruces-decision:start -->[\s\S]*?<!-- rr-las-cruces-decision:end -->\s*/g, "")
    .replace(/<!-- rr-las-cruces-planning:start -->[\s\S]*?<!-- rr-las-cruces-planning:end -->\s*/g, "");
  let heroIndex = 0;
  html = html.replace(/<div class="tag-left"><p>[^<]*<\/p>\s*<h2>[\s\S]*?<\/h2>\s*<h4>[\s\S]*?<\/h4>\s*<a[^>]*href="\/contact(?:\?[^\"]*)?"[^>]*>[\s\S]*?<\/a>\s*<\/div>/g, () => heroMarkup(heroStories[Math.min(heroIndex++, heroStories.length - 1)]));
  const companionStories = [
    ["Emergency Roof Help", "Active leaks, storm damage, and urgent stabilization"],
    ["Flat Roof Replacement Inspection", "Condition findings before a capital decision"],
    ["Coating Or Replacement", "Restoration eligibility and replacement planning"],
    ["Roof Service Agreements", "Scheduled inspections and documented maintenance"],
  ];
  let companionIndex = 0;
  html = html.replace(/(<div class="section(?: on)?" id="[1-4]">\s*<h2>)[\s\S]*?(<\/h2>\s*<h4>)[\s\S]*?(<\/h4>\s*<\/div>)/g, (_match, open, middle, close) => {
    const story = companionStories[Math.min(companionIndex++, companionStories.length - 1)];
    return `${open}${story[0]}${middle}${story[1]}${close}`;
  });
  html = html.replace(/(?=<div class="content(?: rr-lc-intro)?" style="background: rgb\(240,240,240\); top:0;">)/, `${decisionDeck}\n`);
  html = html.replace(/<div class="content" style="background: rgb\(240,240,240\); top:0;"><div class="mid">[\s\S]*?<\/div><\/div>\s*(?=<div class="content" data-rr-band="services")/, `<div class="content rr-lc-intro" style="background: rgb(240,240,240); top:0;"><div class="mid"><h1>Commercial roofing help for the roof in front of you</h1><div class="bar"></div><p class="home">A leak needs a fast response. A flat roof nearing replacement needs a careful inspection. A roof with usable life may be a coating candidate. A portfolio needs repeatable service. Commercial Roofing Contractors of Las Cruces helps owners and facility teams move from the condition they have to the right next step.</p><div class="rr-lc-inline-actions"><a href="/contact?request=emergency">I Have An Active Leak</a><a href="/contact?request=inspection">I Need A Roof Inspection</a></div></div></div>\n`);
  html = html.replace(/(<style>\s*div\.ft \{ top:0; \})/, `${planningSections}\n$1`);
  return html;
};

const files = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (["assets-f", "ours", "images"].includes(entry.name)) continue;
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(item);
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(item);
  }
};
walk(publicDir);

let changed = 0;
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  html = html
    .replace(/,?\s*"telephone"\s*:\s*"[5]{3}-[5]{3}-6151"/g, "")
    .replace(/href="tel:[5]{6}6151"/g, 'href="/contact"')
    .replace(/Call [5]{3}-[5]{3}-6151\s*/g, "")
    .replace(/[5]{3}-[5]{3}-6151/g, "Request Roof Help")
    .replace(/—/g, "-");
  if (!html.includes('id="rr-website-taste-css"')) {
    html = html.replace(/<\/head>/i, `${styleTag}\n</head>`);
  }
  if (!html.includes('id="rr-website-taste-js"')) {
    html = html.replace(/<\/body>/i, `${scriptTag}\n</body>`);
  }
  if (path.basename(file) === "contact.html") {
    const formPattern = /<form\b(?=[^>]*(?:data-contact-form|action=["']\/api\/(?:contact|submit)["']))[\s\S]*?<\/form>/i;
    if (formPattern.test(html)) html = html.replace(formPattern, contactForm);
  }
  if (["index.html", "home.html"].includes(path.basename(file))) html = transformHomepage(html);
  if (!html.includes('class="rr-lc-sticky"')) {
    html = html.replace(/<\/body>/i, '<a class="rr-lc-sticky" href="/contact?request=emergency" aria-label="Request commercial roof help">Roof Help</a>\n</body>');
  }
  if (html !== before) {
    fs.writeFileSync(file, html);
    changed += 1;
  }
}

console.log(`website-taste-pass: ${changed} page(s) updated`);
