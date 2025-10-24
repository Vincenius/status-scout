export const dnsChecksInfo = {
  ns: {
    name: "Missing NS Records",
    description: "Name Server (NS) records delegate your domain to DNS servers; missing NS records mean the domain can't be resolved by most clients and is effectively unreachable."
  },
  mx: {
    name: "Missing MX Records",
    description: "Mail Exchange (MX) records direct email for the domain; missing or misconfigured MX records will cause email delivery failures."
  },
  aaaa: {
    name: "Missing AAAA Record",
    description: "An AAAA record maps the domain to an IPv6 address; absence only matters if clients or services expect IPv6 reachability."
  },
  spf: {
    name: "Missing SPF Record",
    description: "SPF (TXT) helps prevent email spoofing by listing authorized sending servers; missing or invalid SPF increases risk of email being marked as spam or rejected."
  },
  dmarc: {
    name: "Missing DMARC Record",
    description: "DMARC provides policy for handling unauthenticated mail; without it, domain owners lose control over how receivers treat forged messages."
  },
  dkim: {
    name: "Missing DKIM Selector",
    description: "DKIM allows recipients to verify that mail was authorized by the domain owner; no DKIM selector reduces email authenticity and deliverability."
  },
  caa: {
    name: "Missing CAA Records",
    description: "CAA records restrict which Certificate Authorities can issue TLS certificates for your domain; missing CAA is not fatal but reduces control over certificate issuance."
  },
  ds: {
    name: "Missing DS Records",
    description: "DS records are used for DNSSEC delegation; missing DS means the domain is not DNSSEC-signed at the parent, reducing protection against DNS tampering."
  },
  dnskey: {
    name: "Missing DNSKEY Records",
    description: "DNSKEY records hold the public keys for DNSSEC; absence means the zone isn't DNSSEC-signed, removing that integrity protection."
  },
  wildcard: {
    name: "Unexpected Wildcard A Record",
    description: "A wildcard A record can mask missing subdomains and lead to confusing behavior; finding no wildcard (expected) indicates no unexpected catch-all mapping."
  },
  subdomains: {
    name: "Exposed Subdomain Issues",
    description: "Subdomain scans detect exposed assets or misconfigurations (e.g., forgotten services); discovered issues can lead to takeover or information leakage."
  }
};