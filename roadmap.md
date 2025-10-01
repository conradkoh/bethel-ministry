Here’s the same roadmap, now phrased so that “team” is one recursive entity (with an optional parent) rather than two separate features.  The rest of the versions stay as before—just reordered a bit to clarify that nested teams are part of the core model.

Version 0.1 – Hierarchical Teams & Scoped Link Sharing  
• As a user, I want to create a Team (name + timezone) with an optional parent team, so I can build arbitrary hierarchies.  
• As a user, I want to browse the Team tree (expand/collapse), so I always know my place in the hierarchy.  

Version 0.2 – Participant Management  
• As a user with “manage‑participants” permission, I want to add Participants (name + join date) into any Team node.  
• As a user with “manage‑participants” permission, I want to view & edit that node’s Participant list.  
• As a user with “view‑participants” permission, I want to see a simple profile for each Participant.  

Version 0.3 – Attendance Tracking  
• As a user, I want to create an attendance activity for a chosen date.  
• As a user, I want to mark Participants present or absent.  
• As a user, I want to browse past attendance rosters.  

Version 0.4 – Link Permission Management  
• As a team‑owner, I want to create multiple share links, each with a unique name + set of permissions, so I can invite different roles.  
• As a team‑owner, I want to revoke or edit existing links at any time.  

Version 0.5 – Basic Reporting Framework  
• As a user with “view‑reports” permission, I want to see high‑level attendance stats (e.g. attendance rate).  
• As a user with “view‑reports” permission, I want an API endpoint to pull raw attendance data.  

Version 0.6 – UI Enhancements  
• As any user, I want a clear, mobile‑friendly navigation.  
• As a user with “view‑reports” permission, I want simple charting of attendance trends.  

Version 1.0 – MVP Launch  
• As a user with “view‑reports” permission, I want a monthly attendance report (average + trend).  
• As a user with “view‑reports” permission, I want to see how many Participants joined during the month.  
• As a user with appropriate permissions, I want a single dashboard showing key team metrics.  
• As a user with appropriate permissions, I want search & filter across Participants and attendance records.  

Version 1.5 – Participant Self‑Registration  
• As a team‑owner, I want to generate a QR code linking to a self‑registration form.  
• As a new Participant, I want to scan the QR code and register myself into the correct Team node.  

—  
Now “teams” and “sub‑teams” are just one model with an optional parent reference, surfaced in both API and UI as a tree.