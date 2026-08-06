---
title: Secure Remote Access
meta_title: Secure OT Remote Access | OXOT
meta_description: Reduce risk from vendor access, remote maintenance and external connectivity to OT — least-privilege, brokered, monitored access with MFA, just-in-time and session recording, aligned to IEC 62443 and NIS2.
excerpt: Reduce risk from vendor access, remote maintenance and external connectivity — controlled, auditable access that keeps maintenance running without keeping the doors open.
content_type: page
published: true
---

Remote access is where most OT incidents start: OEM maintenance tunnels that were opened for a commissioning visit and never closed, vendor accounts that nobody manages, and external connectivity that grew organically and was never inventoried. OXOT replaces that sprawl with least-privilege, brokered, monitored access — designed so maintenance still gets done.

Every path in and out is inventoried. Every session is authenticated and recorded. Vendors get exactly the access they need, only when they need it, through a single controlled entry point.

```keyfacts
Problem :: vendor and OEM access sprawl — no single inventory, no session control
Principle :: least privilege, brokered, always monitored
Coverage :: employees, vendors, OEMs and integrators
Controls :: MFA, just-in-time access, session recording and review
Standard :: IEC 62443 access control (FR 3, FR 4), NIS2 supply-chain security
Outcome :: fully auditable remote access — every session, every action
```

## The access sprawl problem

Remote access into OT environments rarely started as a security decision. It started as a practical one: the OEM needed to connect for commissioning, the integrator needed to update a PLC, the vendor needed to monitor a system. Each of those decisions was reasonable at the time. The result, years later, is a tangle of VPN accounts, modem connections, vendor-managed tunnels and vendor-supplied remote-access tools — with no single inventory, no consistent authentication standard, and no record of who did what.

```compare
Unmanaged OT remote access
- Multiple separate access paths — VPNs, modems, vendor-managed tunnels
- Accounts created for projects that ended years ago
- No inventory of who has access to what, from where
- Authentication varies by vendor — some use shared passwords
- No session recording — no evidence of what was done
- Access is permanent, not tied to a specific task or time window
---
Brokered OT remote access
- One controlled entry point — every path enters through the broker
- Accounts tied to active relationships — reviewed and retired when they end
- A complete inventory: who, from where, to which assets, with what rights
- MFA enforced for all sessions — no exceptions for vendors
- Every session recorded — full audit trail, reviewed on a risk basis
- Just-in-time access — granted for a specific window, revoked automatically
```

## What you get

```cards
Remote access inventory :: :: A complete map of every path into your OT environment — who has access, from where, to which systems, with what credentials and what level of control. Many organisations find this map contains significant surprises.
Brokered access design :: :: A single, controlled entry point that mediates every remote session. Vendor and OEM traffic enters the OT environment through a conduit with explicit rules — not through a tunnel that bypasses your security controls.
MFA & just-in-time access :: :: Multi-factor authentication enforced for all sessions. Access granted for a specific task window and revoked automatically when the window closes — not left open indefinitely.
Session recording & review :: :: Every remote session recorded, with the ability to replay and audit what was done. Recordings reviewed on a risk basis and retained for regulatory and incident-response purposes.
Vendor access policy :: :: Clear, written rules for OEM and third-party access that your team can enforce, audit and update. Vendors know what to expect; your team knows what to verify.
Rollout support :: :: OXOT works through the migration from unmanaged to brokered access alongside your team — engaging vendors, handling legacy connections and managing the transition without disrupting active maintenance contracts.
```

## How we deliver it

```timeline
1. Access inventory :: Find and document every remote path into your OT environment. This means VPNs, modems, vendor-managed tunnels, jump hosts, and OEM-supplied remote tools. The inventory is often the most revealing step — the gap between what organisations believe their access landscape looks like and what it actually contains is consistently large.
2. Risk assessment :: Evaluate each access path: who uses it, how often, what they can reach, and what controls are in place. Paths with shared credentials, no MFA, or access to safety-critical systems go to the top of the remediation list.
3. Brokered model design :: Design the controlled entry point — the broker that mediates every remote session. Define conduit rules (what can be reached from external), authentication requirements (MFA, certificate-based), session controls (recording, time limits, just-in-time grants), and the exception process.
4. Pilot :: Prove the model with one vendor or one use case before scaling. Pilot reveals integration friction — vendor tool requirements, legacy system authentication limitations — that is cheaper to solve at small scale.
5. Rollout :: Migrate access paths onto the brokered model site by site or vendor by vendor. Retire unmanaged paths as alternatives go live. Manage vendor communication — most OEMs will comply with clear, written requirements.
6. Monitor & review :: Record sessions, review access grants periodically, and retire accounts that are no longer active. Remote access is not a one-time fix — it requires ongoing attention to stay controlled.
```

## Framework alignment

| Framework | What this service addresses |
|---|---|
| **IEC 62443 FR 3** | Use control — ensuring that only authorised users can use OT systems and only for the purposes they are authorised for |
| **IEC 62443 FR 4** | Data confidentiality — ensuring that remote sessions cannot be used to exfiltrate OT data or introduce unauthorised change |
| **IEC 62443-2-4** | Security requirements for IACS service providers — the access controls applied to OEM and integrator sessions directly address the supply-chain risk that 62443-2-4 manages |
| **NIS2 Art. 21(2)(d)** | Supply-chain security and security in network and information systems relating to suppliers — managed OEM and vendor access is the operational expression of this requirement |
| **NIS2 Art. 21(2)(i)** | Human resources security, access control and asset management — just-in-time access grants, MFA enforcement and account lifecycle management are all in scope |
| **NIS2 Art. 21(2)(e)** | Security in network acquisition, development and maintenance — the brokered access model is the secure-by-design answer to how OT remote connectivity should be built |

## How it connects

Remote access control sits at the intersection of two other workstreams. The **[Architecture & Segmentation](/architecture-segmentation)** work defines the conduit through which remote access enters the OT environment — the broker lives at that conduit boundary. You design the conduit there and enforce the access rules here; neither is complete without the other.

The **[assessment](/ot-security-assessments)** typically surfaces remote access as one of the highest-priority exposures — it is the most common initial access vector in OT incidents. That assessment finding scopes and prioritises the access remediation work.

The **[Cyber Digital Twin](/cyber-digital-twin)** carries the access inventory as part of the estate model — which systems are reachable from outside, through which conduit, by which vendors. That model makes it possible to assess the consequence of a vendor account compromise before it happens, and to identify over-privileged accounts systematically rather than by incident.

The access inventory and session records also feed the **[Capability Transfer](/capability-transfer)** deliverable: runbooks for access review, vendor onboarding procedures and the access exception process all go into the operating model your team inherits.

```cta
Close the most common way in
Turn remote access from your biggest exposure into a controlled, auditable capability — without breaking your maintenance contracts.
Talk to an OT security expert :: /contact
```
