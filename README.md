# Usergeek-IC-JS

Usergeek JavaScript IC SDK for Internet Computer can be installed as an npm package.

## Installation

### NPM

Install the npm package and embed Usergeek JavaScript IC SDK into your project.

```sh
npm install usergeek-ic-js
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
    host: "https://ic0.app" | undefined //used on environments other than IC main network
})
```

### Setting Principal

Principal should be set after initialization with the `setPrincipal` method. It could be either from `AuthClient.authClient.login()` method `onSuccess` callback, or from any wallet (Plug, Stoic...). **Only <ins>non-anonymous</ins> Principal can be used for session tracking.** 

```javascript
//identity got from AuthClient.authClient.login()
const principal: Principal = identity.getPrincipal()
Usergeek.setPrincipal(principal)
````

#### Log Out

If a user logs out you will need to:

```javascript
Usergeek.setPrincipal(undefined)
````

### Session tracking

This method will send session related event to Usergeek analytics canister. It should be called after non-anonymous principal is set.

*Be sure to call `setPrincipal` + `trackSession` every time user auto-logins.*

```javascript
Usergeek.trackSession()
```

### Sending Events

You can track an event by calling `trackEvent` method with the event name:

```javascript
Usergeek.trackEvent("PostCreated")
````

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

//somewhere in your app
Usergeek.trackEvent("PostCreated")

//...

//after user sign-out
Usergeek.setPrincipal(undefined) //or Usergeek.setPrincipal(Principal.anonymous())
```

## Constraints

* Currently, Usergeek provides metrics only for **<ins>registered users (non-anonymous Principals)</ins>**.
* Sessions and custom events are temporarily tracked once per user per day (to reduce the number of update calls and cycles burned). 
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

## Usergeek on environments other than IC main network

If you’re testing on an environment other than IC main network (e.g. local DFX replica) you need to add additional parameter `host` to the `Usergeek.init` function passing your service public asset canister URL e.g. “https://ic0.app”.

In order not to mix users from development environment with users from production environment we suggest separating development (DEV) and production (PROD) environments by creating additional project in Usergeek portal.

Final initialization in the code would look like this:
```javascript
const USERGEEK_PROJECT_API_KEY_PROD = "ABCD"
const USERGEEK_PROJECT_API_KEY_DEV = "EFGH"
const SERVICE_PUBLIC_URL = "https://ic0.app"

if (process.env.NODE_ENV === "development") {
    Usergeek.init({apiKey: USERGEEK_PROJECT_API_KEY_DEV, host: SERVICE_PUBLIC_URL})
} else {
    Usergeek.init({apiKey: USERGEEK_PROJECT_API_KEY_PROD})
}
```

If you are integrating Usergeek into Web2.0 website (e.g. hosted on AWS) - you should pass Dfinity base domain as a `host` (https://ic0.app/).

## Community

If you have any questions or suggestions please join our [Discord server](https://discord.gg/CvTpv2TeKs).

## License

`Usergeek-IC-JS` is distributed under the terms and conditions of the [MIT license](https://github.com/usergeek/usergeek-ic-js/blob/main/LICENSE).