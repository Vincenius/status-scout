import runSubzy from '../utils/runSubzy';
import dns from 'dns/promises';

const dkimSelectors = [
  // Generic / common
  "default", "selector", "selector1", "selector2", "selector3", "selector4",
  "mail", "email", "smtp", "mx", "s1", "s2",
  // Google Workspace
  "google", "google._domainkey",
  // Microsoft 365 / Exchange
  "selector1", "selector2", "selector3", "selector4",
  // Amazon SES
  "amazonses", "dkim", "ses",
  // SendGrid
  "sendgrid", "sg", "sendgrid.net",
  // Mailchimp / Mandrill
  "k1", "k2", "mailchimp", "mandrill",
  // Zoho
  "zoho", "zoho._domainkey",
  // Fastmail
  "fm1", "fm2", "fm3",
  // Proton
  "protonmail", "pm1", "pm2",
  // Other transactional email services
  "mailgun", "mg", "sparkpost", "postmark", "hubspot", "sendinblue", "brevo", "campaignmonitor"
];

// known issue: only checks for subdomains that had certificates issued
// later improvement -> integrate with paid tool like eg VIRUSTOTAL
async function getSubdomainsFromCrt(domain) {
  // todo retry if failed 3 times 
  const url = `https://crt.sh/?q=%25.${domain}&output=json`;
  console.log(url)
  try {
    const res = await fetch(url);
    const data = await res.json();

    // Extract unique subdomains
    const subdomains = new Set();
    for (const entry of data) {
      const names = entry.name_value.split("\n");
      names.forEach(n => subdomains.add(n.replace(/\*./, "")));
    }
    return Array.from(subdomains);
  } catch (err) {
    console.error("Error fetching from crt.sh:", err);
    return [];
  }
}

async function checkSubdomains(subs) {
  for (const sub of subs) {
    runSubzy(sub).then(issues => {
      if (issues.length) {
        console.log(`⚠️ Subzy issues for ${sub}:`, issues);
      }
    }).catch(err => {
      console.error(`Error running subzy for ${sub}:`, err);
    });
  }
}


async function checkRecord(type, name = domain) {
  try {
    return await dns.resolve(name, type);
  } catch {
    return [];
  }
}

async function checkTxtRecords(name) {
  try {
    const records = await dns.resolveTxt(name);
    return records.flat().join(" ");
  } catch {
    return "";
  }
}

const runSecurityCheck = async (domain) => {
  console.log(`🔍 DNS Security Scan for ${domain}\n`);

  // NS records
  const ns = await checkRecord("NS");
  console.log("• NS records:", ns.length ? ns.join(", ") : "❌ None found");

  // MX records
  const mx = await dns.resolveMx(domain).catch(() => []);
  console.log("• MX records:", mx.length ? mx.map(m => `${m.exchange} (prio ${m.priority})`).join(", ") : "❌ None found");

  // IPv6 check
  const aaaa = await checkRecord("AAAA");
  console.log("• IPv6 (AAAA):", aaaa.length ? "✅ Present" : "⚠️ Missing IPv6");

  // SPF
  const spf = (await checkTxtRecords(domain)).match(/v=spf1[^"]*/i);
  console.log("• SPF:", spf ? `✅ Found (${spf[0]})` : "⚠️ Missing SPF record");

  // DMARC
  const dmarc = (await checkTxtRecords(`_dmarc.${domain}`)).match(/v=DMARC1[^"]*/i);
  console.log("• DMARC:", dmarc ? `✅ Found (${dmarc[0]})` : "⚠️ Missing DMARC record");

  // DKIM (common selector check)
  let dkimFound = false;
  for (const s of dkimSelectors) {
    const dkim = await checkTxtRecords(`${s}._domainkey.${domain}`);
    if (dkim.includes("v=DKIM1")) {
      console.log(`• DKIM: ✅ Found at selector "${s}"`);
      dkimFound = true;
      break;
    }
  }
  if (!dkimFound) console.log("• DKIM: ⚠️ No DKIM record found for common selectors");

  // CAA
  const caa = await checkRecord("CAA");
  console.log("• CAA:", caa.length ? `✅ Found (${JSON.stringify(caa)})` : "⚠️ Missing CAA record");

  // DNSSEC (check DS + DNSKEY)
  const ds = await checkRecord("DS");
  const dnskey = await checkRecord("DNSKEY");
  console.log("• DNSSEC DS:", ds.length ? "✅ Present" : "⚠️ Missing");
  console.log("• DNSSEC DNSKEY:", dnskey.length ? "✅ Present" : "⚠️ Missing");

  // Wildcard check
  const rand = Math.random().toString(36).substring(2, 10);
  const wildcard = await checkRecord("A", `${rand}.${domain}`);
  console.log("• Wildcard:", wildcard.length ? "⚠️ Wildcard DNS may be enabled" : "✅ None detected");

  // subdomains check
  const subdomains = await getSubdomainsFromCrt(domain);
  console.log(`\n🔍 Checking ${subdomains.length} subdomains from crt.sh for issues`);
  await checkSubdomains(subdomains);

  console.log("\n✅ Scan complete.\n");
};
