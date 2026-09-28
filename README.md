# O1 DISTRICT

Static project landing page. All fonts, images and video are included.

## GitHub

Extract this archive and upload its contents to the root of your repository.
For GitHub Pages, choose Settings → Pages → Deploy from a branch → main → / (root).

## Local preview

Run `python3 -m http.server 8000` in this folder and open http://localhost:8000.

## Lead forms

The two forms are not connected to a CRM yet. In app.js, LEAD_ENDPOINT is null.
Set it to your server endpoint when the Bitrix integration is ready. Keep Bitrix credentials on the server, never in browser code. The endpoint should accept POST requests with JSON fields firstName, lastName, email and phone, and return a successful HTTP status only when the lead has been accepted.

The forms currently show an honest unavailable message and do not store or send personal data.
