# Example EmailLogin Server

```sh
npm install
(cd node_modules/camp && make https)
cp node_modules/camp/https.* .
node app
open https://[::1]:8000
```

`app.js` contains hooks for a simple auth app where users are identified by
email and saved in memory.
It is HTTPS, using a local CRT and KEY which are included to get you started
fast, but you would need to obtain your own.

`web/` contains the website's pages.

`secrets.json` has to be crafted for your email system:

```js
{
  "mailer": {
    "secure": true,
    "host": "mail.isp.net",
    "from": "auth@example.com",
    "auth": {"user": "auth@example.com", "pass": "hunter2"}
  }
}
```
