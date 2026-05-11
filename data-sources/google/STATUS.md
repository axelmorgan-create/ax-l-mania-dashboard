# Google Workspace — connected, API enablement pending

Status as of 2026-05-09: Google OAuth login is complete, but Gmail/Calendar/Contacts cannot be snapshotted yet because the required Google Cloud APIs are not enabled for the OAuth project.

Current state:
- Google login: complete.
- Local token: valid in the Hermes credential cache.
- Dashboard status: blocked until usable Gmail, Calendar, and Contacts snapshots exist.
- Gmail API: needs to be enabled in Google Cloud.
- Calendar API: needs to be enabled in Google Cloud.
- People/Contacts API: needs to be enabled in Google Cloud.
- Dashboard snapshots still missing: `gmail.json`, `calendar.json`, `contacts.json`.

Next step:
- In Google Cloud Console, enable Gmail API, Google Calendar API, and People API for the same OAuth project, then rerun the snapshot refresh.

No Google tokens, secrets, mail bodies, calendar contents, private contacts, project IDs, auth codes, or raw API errors are stored in this status note.
