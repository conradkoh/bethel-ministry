Here’s the full roadmap with v0.1 revised to support nested “sub‑teams” instead of flat sub‑groups. All later versions remain as before.

Version 0.1 – Basic Teams, Nested Sub‑teams & Link Sharing  
• As a user, I want to create a Team (name + timezone), so I can begin organizing my group.  
• As a Team‑creator, I want to define a Sub‑team under any existing Team, nesting to any depth, so I can mirror real‑world hierarchies.  
• As a Team Member, I want to see and expand the Team → Sub‑team tree, so I always know where I am in the hierarchy.  
• As a Team‑creator, I want to generate a named sharing link with a specific permission bundle (e.g. “Attendance‑Editor”), so I can grant scoped access.  
• As someone clicking a sharing link, I want to land on that Team’s page and immediately receive the link’s permissions.

Version 0.2 – Participant Management  
• As a user with “manage‑participants” permission, I want to add Participants (name + join date) into any Team or Sub‑team.  
• As a user with “manage‑participants” permission, I want to view & edit the Participant list for a Team/Sub‑team.  
• As a user with “view‑participants” permission, I want to see a simple profile for each Participant.

Version 0.3 – Attendance Tracking  
• As a user with “attendance‑edit” permission, I want to create an attendance activity for a chosen date.  
• As a user with “attendance‑edit” permission, I want to mark Participants as present/absent.  
• As a user with “view‑attendance” permission, I want to view the roster of past attendance activities.

Version 0.4 – Link Permission Management  
• As a Team‑creator, I want to create multiple links, each carrying a unique name + set of permissions, so I can invite different roles.  
• As a Team‑creator, I want to revoke or edit existing links at any time.

Version 0.5 – Basic Reporting Framework  
• As a user with “view‑reports” permission, I want to see high‑level attendance stats (e.g. attendance rate).  
• As a user with “view‑reports” permission, I want an API endpoint to pull raw attendance data.

Version 0.6 – UI Enhancements  
• As any user, I want a clear, mobile‑friendly navigation.  
• As a user with “view‑reports” permission, I want simple charting of attendance trends.

Version 1.0 – MVP Launch  
• As a user with “view‑reports” permission, I want a monthly attendance report (average + trend).  
• As a user with “view‑reports” permission, I want to see how many Participants joined during the month.  
• As a user with appropriate permissions, I want a single dashboard showing key team metrics.  
• As a user with appropriate permissions, I want search & filter across Participants and attendance records.

Version 1.5 – Participant Self‑Registration  
• As a Team‑creator, I want to generate a QR code linking to a self‑registration form.  
• As a new Participant, I want to scan the QR code and register myself into the correct Team.