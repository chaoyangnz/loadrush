---
id: get-started
title: Get Started
sidebar_label: Get Started
---

# Install

Like any NodeJS package, you can run:

`npm install loadflux`

or

`yarn install loadflux`
# Write your scenario
A simple Javascript file to define your scenario.

```javascript
// scenario.js
import { runner, scenario, get, post, put,log, think, loop, parallel } from 'loadflux';

scenario({
    name: 'an example flow',
    weight: 1
  },
  get({
    url: 'http://www.mocky.io/v2/5e2515fc2f00007400ce279c'
  }),
  think(1000),
  log('requested a API'),
)

runner.sustain(5); // keep 5 users busy to run a scenario
```
# Run

`node scenario.js`

# Metrics visualisation

Go to https://data.loadflux.io
