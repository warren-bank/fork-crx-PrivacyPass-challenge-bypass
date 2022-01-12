### [Privacy Pass protocol: Challenge Bypass Extension](https://github.com/warren-bank/fork-crx-PrivacyPass-challenge-bypass)

The Privacy Pass browser extension implements the Privacy Pass protocol for providing a private authentication mechanism during web browsing.
Privacy Pass is currently supported by Cloudflare to allow users to redeem validly signed tokens instead of completing CAPTCHA solutions.

- - - -

#### Fork

* [upstream repo](https://github.com/privacypass/challenge-bypass-extension)
  - forked from:
    * tag: [v2.0.9](https://github.com/privacypass/challenge-bypass-extension/releases/tag/v2.0.9)
    * commit: _0eb141a4b84e80012994583017af41df8e630651_
    * date: Jun 30, 2021

#### Change Log

* v2.0.9
  - removed all dev dependencies (webpack, babel, ...)
    * interesting to note that babel wasn't actually being used to transpile the code from ES6 to ES5
  - replaced the process for building a Chromium crx with a simple build script
    * actually, a few build scripts are included to produce the same crx using alternate methods
  - the repo is now a direct 1-to-1 with the contents that are included in the packed crx, which makes development much simpler
  - the code for the extension is identical to the upstream release for [v2.0.9](https://github.com/privacypass/challenge-bypass-extension/releases/tag/v2.0.9)
* v2.1.0
  - add logic to restrict token redemption on URLs
    * hosted by:
      - [captcha.website](https://captcha.website/)
      - [hcaptcha.com](https://www.hcaptcha.com/privacy-pass)
    * the purpose of which is to allow the user to earn tokens on these sites by repeatedly solving captchas
  - add logic to retry the HTTP request to claim _hCaptcha_ tokens earned when the server responds with the error:<br>`{"success":false,"error-codes":["invalid-data"]}`
    * this error occurs when the user is attempting to earn _hCaptcha_ tokens using an _incognito_ Chrome browser window
    * sometimes the request will succeed, but most of the time it doesn't
    * the only real workaround at the moment is to always earn _hCaptcha_ tokens using a _normal_ Chrome browser window
      - once earned, these tokens can be redeemed using either a _normal_ or an _incognito_ Chrome browser window
    * this code will retry each failed HTTP request a maximum of 5x times

- - - -

#### Description

**The Privacy Pass protocol is now being standardised by the [privacypass](https://datatracker.ietf.org/wg/privacypass/about/) IETF working group.
All contributions are welcome! See the [GitHub page](https://github.com/ietf-wg-privacypass) for more details.**

The protocol we use is based on a realization of a 'Verifiable, Oblivious Pseudorandom Function' (VOPRF) first established by [Jarecki et al.](https://eprint.iacr.org/2014/650.pdf).
For a technical description of the protocol see the [PROTOCOL.md](https://github.com/privacypass/challenge-bypass-extension/blob/v2.0.9/docs/PROTOCOL.md).
We also detail the entire protocol and results from this deployment in a [research paper](https://content.sciendo.com/view/journals/popets/2018/3/article-p164.xml) that appeared at PETS 2018 (Issue 3).

#### Documentation

Documentation for the protocol, workflow and extension components.

* [Protocol](https://github.com/privacypass/challenge-bypass-extension/blob/v2.0.9/docs/PROTOCOL.md)
* [Extension implementation](https://github.com/privacypass/challenge-bypass-extension/blob/v2.0.9/docs/EXT_PROTOCOL_IMPL.md)
* [Configuration options](https://github.com/privacypass/challenge-bypass-extension/blob/v2.0.9/docs/CONFIG.md)
* [Supported hash-to-curve algorithms](https://github.com/privacypass/challenge-bypass-extension/blob/v2.0.9/docs/HASH_TO_CURVE.md)

- - - -

#### Legal

* [copyright and license](https://github.com/privacypass/challenge-bypass-extension/blob/v2.0.9/LICENSE) for the original project at the time of this fork
