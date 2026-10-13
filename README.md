# Pod's Portal

A static site: save-the-date invite with a countdown, personalised guest links and a gift registry guests can tick off.

## Put it on GitHub Pages

1. Create a new public repository on GitHub, e.g. `pods-portal`.
2. Upload everything in this folder to it (or `git init`, commit and push).
3. In the repository go to **Settings > Pages**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.
4. After a minute the site is live at `https://jacquim.github.io/pods-portal/`.

## Let guests tick off gifts

GitHub Pages cannot store anything, so the ticks are kept in a free Firebase Realtime Database.

1. At <https://console.firebase.google.com> create a project (Analytics is not needed).
2. Open **Build > Realtime Database > Create database**. Pick a location and start in locked mode.
3. On the **Rules** tab, replace everything with the contents of `firebase-rules.json` and publish.
4. On the **Data** tab, copy the database URL shown at the top and paste it into `config.js`.

Guests then see an "I am getting this" button on each gift. They enter their name, and the gift disappears from the list for everyone else. The guest who marked it still sees it and can undo it from the same phone or computer.

To see who bought what, or to untick a gift yourself, open the **Data** tab in Firebase and look under `claims`.

Anyone with the site address can tick or untick gifts; there are no logins.

## RSVPs

The RSVP form saves to the same database, so it works once `config.js` has the database URL. Replies appear on the Firebase **Data** tab under `rsvps`, each with the name, whether they are coming, how many adults (`count`) and children (`kids`), and any message. Guests cannot see each other's replies. A guest who replies again from the same device, or from their personalised link, replaces their earlier reply.

## Personalised invites

Add each guest to `guests.js` with a short code, their name and the ages to cater for. Send them the site address with `?g=` and their code on the end:

    https://jacquim.github.io/pods-portal/?g=ouma-anna

They see "Dear Ouma Anna" and "Please cater for ages 3-6 months". The plain address, without a code, shows the general invite.

## Change the content

- **Gifts:** `gifts.js`. Photos go in `images/`.
- **Date and time:** the `PARTY` line at the top of `script.js` drives the countdown; the wording is in `index.html`. The date banner is a picture, `images/date-banner.png`.
- **Wording:** `index.html`.
