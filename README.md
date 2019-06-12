# reCAPTCHA verification helper for node

Implementation of Google reCAPTCHA verify for nodeJS, written in TypeScript. No dependencies.
This lib targets reCAPTCHA v3.

## Installation

You need to register your website for Google reCAPTCHA to obtain a pair of keys first.
Google will give you a `SITE KEY` and a `SECRET KEY`. The `SITE KEY` is used on your website to 
request a token. To verify the token with this lib, you must use the `SECRET KEY`. 

Install the npm package:

```
$ npm i --save node-grecaptcha-verify
```


Usage:

```typescript

import {ReCAPTCHA} from "node-grecaptcha-verify";

const grec = new ReCAPTCHA(<YOUR SITE KEY>);
const isHuman = await grec.verify(<TOKEN>);

if (true === isHuman) {
    // requested by a human
} else {
    // requested by a bot
}

```

If you want to know what Google answered (e.g. to check for errors or get the score):

```typescript

// get the score
const score = grec.lastResponse.score;

// get errors
const errors = greg.lastResponse["error-codes"];


```

By default, a `score` lower than `0.5` is considered a bot. You can set your own threshold by
setting it in the constructor. You can also control if the `action` should be respected and checked.

```typescript

// set the minimum score for humans to 0.7 (defaults to 0.5)
const grec = new ReCAPTCHA(<YOUR SITE KEY>, 0.7);

// tell the lib to check the action if given to the verify call (defaults to false)
const grec = new ReCAPTCHA(<YOUR SITE KEY>, 0.7, true);
const isHuman = await grec.verify(<TOKEN>, <ACTION>);

```

## License

MIT License
