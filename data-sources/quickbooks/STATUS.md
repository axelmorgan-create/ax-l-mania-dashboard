# Finance source — QuickBooks blocked, vault extraction active

Status as of 2026-05-09: QuickBooks itself is still blocked because the Intuit connection/token needs re-auth, but the Finance tab is no longer empty.

Current state:
- QuickBooks live API: blocked / needs re-auth.
- Replacement finance source: active vault money extraction from `outputs/money/SUMMARY.json` and related extracted files.
- Dashboard Finance status: extracted.

What the replacement source currently covers:
- Extracted royalty income signals.
- 2024 tax exposure signal.
- Pershing brokerage signal surfaced from extracted docs.
- Card/subscription spend signals from extracted statements/invoices.

Still missing until QuickBooks or a bank feed is connected:
- Live cash on hand.
- Current monthly burn.
- Current runway.
- Fresh P&L / cash-flow from bookkeeping.

Next step:
- Re-auth QuickBooks if it is the real bookkeeping source, or decide that the dashboard should use manual/business-state finance capture plus extracted statements instead.

No bank credentials, tokens, account numbers, or private login details are stored in this note.
