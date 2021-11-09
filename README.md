# Usergeek-IC-JS

Usergeek JavaScript IC SDK for Internet Computer can be installed as an npm package.

## Installation

### NPM

Install the npm package and embed Usergeek JavaScript IC SDK into your project.

```sh
npm install -D github:usergeek/usergeek-ic-js
```

Import Usergeek JavaScript IC SDK into your code.

```javascript
import {Usergeek} from "usergeek-ic-js"
//or
const {Usergeek} = require("usergeek-ic-js")
```

## Usage

### Initialization

Project API key is needed to initialise Usergeek JavaScript IC SDK.

It can be found in your project settings at [https://fbbjb-oyaaa-aaaah-qaojq-cai.raw.ic0.app/](https://fbbjb-oyaaa-aaaah-qaojq-cai.raw.ic0.app/).

```javascript
Usergeek.init({
    apiKey: "<API_KEY>",
})
```

### Setting Principal

Principal should be set after initialization with the `setPrincipal` method. It could be either from `AuthClient.authClient.login()` method `onSuccess` callback, or from any wallet (Plug, Stoic...). **Only <ins>non-anonymous</ins> Principal can be used for session tracking.** 

```javascript
//identity got from AuthClient.authClient.login()
const principal: Principal = identity.getPrincipal()
Usergeek.setPrincipal(principal)
````

### Session tracking

This method will send session related event to Usergeek analytics canister. It should be called after non-anonymous principal is set.

*Be sure to call `setPrincipal` + `trackSession` every time user auto-logins.*

```javascript
Usergeek.trackSession()
```

### Full example

```javascript
//somewhere in the very start of an app (e.g. index.tsx)
Usergeek.init({
    apiKey: "<API_KEY>" //change <API_KEY> with your api key
})

//...

//after user sign-in (lets say Principal is available in "userPrincipal" variable)
Usergeek.setPrincipal(userPrincipal)
Usergeek.trackSession()

//...

//after user sign-out
Usergeek.setPrincipal(null) //or Usergeek.setPrincipal(Principal.anonymous())
```

## Constraints

* Currently Usergeek provides metrics only for **<ins>registered users (non-anonymous Principals)</ins>**.
* Please note that babel plugin `@babel/plugin-transform-exponentiation-operator"` transforms the exponentiation assignment operator to Math.pow() function which does not support BigInt.<br/>One of the solutions could be to reduce number of supported browsers in `package.json`:
<br/>

```json
"browserslist": {
  "production": [
    "last 2 chrome version",
    "last 2 firefox version",
    "last 2 safari version",
    "last 2 edge version"
  ],
}
```

## Community

If you have any questions or suggestions please join our [Discord server](https://discord.gg/CvTpv2TeKs).

## License

`Usergeek-IC-JS` is distributed under the terms and conditions of the [MIT license](https://github.com/usergeek/usergeek-ic-js/blob/main/LICENSE).