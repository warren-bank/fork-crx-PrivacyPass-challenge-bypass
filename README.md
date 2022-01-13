### [Privacy Pass protocol: Challenge Bypass Extension](https://github.com/warren-bank/fork-crx-PrivacyPass-challenge-bypass/tree/v3-typescript)

The Privacy Pass browser extension implements the Privacy Pass protocol for providing a private authentication mechanism during web browsing.
Privacy Pass is currently supported by Cloudflare to allow users to redeem validly signed tokens instead of completing CAPTCHA solutions.

- - - -

#### Fork

* [upstream repo](https://github.com/privacypass/challenge-bypass-extension)
  - forked from:
    * tag: _N/A_
    * commit: _266a560e9650118e739586dcb339b8cdfeee790d_
    * date: Nov 18, 2021

#### Change Log

* v3.0.0
  - the code for the extension is identical to the upstream repo at the time of this fork

- - - -

#### Description

**The Privacy Pass protocol is now being standardised by the [privacypass](https://datatracker.ietf.org/wg/privacypass/about/) IETF working group.
All contributions are welcome! See the [GitHub page](https://github.com/ietf-wg-privacypass) for more details.**

The protocol we use is based on a realization of a 'Verifiable, Oblivious Pseudorandom Function' (VOPRF) first established by [Jarecki et al.](https://eprint.iacr.org/2014/650.pdf).
We also detail the entire protocol and results from this deployment in a [research paper](https://content.sciendo.com/view/journals/popets/2018/3/article-p164.xml) that appeared at PETS 2018 (Issue 3).

#### Cryptography

Cryptography is implemented using the elliptic-curve library [SJCL](https://github.com/bitwiseshiftleft/sjcl)
and compression of points is done in accordance with the standard SEC1.
This work uses the NIST standard P256 elliptic curve for performing operations.
Third-party implementers should note that the outputs of the hash-to-curve, key derivation, and point encoding functions
must match their Go equivalents exactly for interaction with our server implementation.

- - - -

#### Legal

* [copyright and license](https://github.com/privacypass/challenge-bypass-extension/blob/v2.0.9/LICENSE) for the original project
  - for v2 code
  - the v3 code did not include a _LICENSE_ file at the time of this fork
