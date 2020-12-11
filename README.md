![](https://img.shields.io/npm/v/loadflux?color=green&style=flat-square)
![](https://img.shields.io/github/package-json/v/loadflux/loadflux?color=blue&style=flat-square)
![](https://img.shields.io/github/license/loadflux/loadflux?color=orange&style=flat-square)
![](https://github.com/loadflux/loadflux/workflows/build/badge.svg)

# [LOADFLUX](https://loadflux.io)

## What is it?

`Loadflux` is a simplistic tool for load testing.
You just need to focus more on how to design your scenario, and the scripting is just taking several minutes.
The infrastructure requirement is pretty low, you can simulate hundreds of virtual users to send requests to your application in your local machine.
It supports different strategies to ramp the load, by default in this library, we provide:

- sustain a constant load, for example, you want to keep 200 users in your web application to do different actions.
When one user exits, another user will be arriving to sustain the load
- ramp up the load until you know the extrame capability of your infrastructure and user experience, for example,
you can ramp up 50 new users per second, then sometime your application will crash and have no response.

## Quick Start

```
cd ops && docker-compose up
cd - && DEBUG=loadflux:* ts-node examples/main.ts
```

## Concepts

- `Virtual User`: a.k.a `VU`, represent a user which is supposed to execute your scenarios.
- `Scenario`: a scenarios is a list of actions a normal user can take in your applications.
- `Action`: an operation in your application, typically including requests (APIs, static assets etc), think time, logging.
- `Runner`: a runner is the pilot who controls everything of your testing. When a new virtual user arrives,
the runner will first checkin at candidates registry, and choose a scenario probabilistically as per the scenario weight. The last step is to assign
the virtual user to that scenario and run it until the scenario is completed. You can decide how new virtual users arrive in a constant number or a ramp-up rate.
- `Metrics`: metrics are important for observability and help you analyse the performance afterwards.
We support TimescaleDB + Grafana at the first place, at the same time, we also integrate wtih InfluxDB.

## Usage

### Scenario Script: describe your scenario and action flow

You can refer to the `examples` folder, there are some examples. If you read them, actually it is easy to write and you just need to take advantage of
your NodeJS/Javascript knowledge.

You can make use of these actions: `get`, `post`, `put`, `think`, `loop`, `parallel`, `log`.

```js
import { runner, scenario, get, post, put,log, think, loop, parallel } from 'loadflux';

scenario({
    name: 'an example flow',
    weight: 1
  },
  get({
    url: '/stories?limit=5'
  }),
  think(1000),
  log('retrieved a story'),
  post({
    url: '/stories',
    data: {
      title: 'a story',
      content: 'test',
      notes: [
        'a note'
      ]
    },
    expect: {
      status: 201
    },
    capture: {
      json: 'notes[0]',
      as: 'firstNote'
    }
  })
)

runner.sustain(5); // keep 5 users busy to run a scenario
```

### Metrics: TimescaleDB + Grafana

This is our recommended approach to collect metrics and visualise it. Run `docker-compose` in your local:

```
cd ops
docker-compose up
```

Then you should get TimescaleDB and Grafana up and running:
- TimescaleDB: listening on `5432`
- Grafana: http://localhost:3000

By default, we created a Loadflux dashboard to visualise: Virtual users, HTTP throughput (RPM), success/error rate etc.

![](https://i.imgur.com/h5sewgS.gif)

### Run It

Just like any other NodeJS application, run it using `node` command line. `Loadflux` is just a _library_, **NOT** a framework or CLI.

Normally, you don't need to set any environment variables to keep it up and running with default values. But `Loadflux` does have some environment variables worth noticing. Either create a `.env` file or specify them when you run your application
(e.g. in Dockerfile, docker-composer file, k8s deployment.yaml, CloudFormation, etc).

Environment Variables:
- General
    - `LOADFLUX_DURATION`: how long you plan to run your load testing.
    - `LOADFLUX_BASE_URL`: the base url of your application. If you don't set, you have to use absolute URL in your http action.
    - `LOADFLUX_TEST_ID`: the test id (16 chars at most) used for different iteration of your testing. Default: current timestamp since unix epoch.
- TimescaleDB
    - `LOADFLUX_TIMESCALEDB_HOST`: TimescaleDB host. Default `localhost`.
    - `LOADFLUX_TIMESCALEDB_PORT`: TimescaleDB port, Default `5432`.
- Logging
    - `DEBUG`: we are use `debug` as our underlying logger, so you can enable a namespace. e.g. `DEBUG=loadflux:*`

### Report and logs

Normally, the report logs around scenarios and actions can be seen in console and it is written to `stderr`.
So if you are running in a container environment or cloud platform (e.g. GCP), not surprised about the log severity is `error` level, which is intentional.

![](https://i.imgur.com/RLcFPJh.gif)

Other than the report logs, all rest logs are going to `stdout`, further redirected to a log file in current directory: `loadflux.log`.
You can run the command line: `tail -f loadflux.log` to keep the file open to display updated changes to console.

## Story behind it

The original intention is we have to develop an ad-hoc solution for our cases of load testing. We evaluated different load
testing tools:
- [`Cypress`](https://github.com/StuffNZ/stuff-composer-load-test): generate load with e2e testing and run in a browser for each virtual user, but it's slow and prone to crash sometimes
- [`Artillery`](https://github.com/StuffNZ/stuff-composer-load-test-artillery): ramp up users per second, but not support the case - sustain a constant load
- `K6`: customised runtime, not compatible with existing nodejs modules and 3rd-party library
- `Gatling`: we do use it to do the performance testing for our Java application, but we think the scripting in Scala is not our flavour.

## Roadmap

- [x] collect statistical data to help analytics and build metrics to visualise and real-time charts and 360° view of virtual users activities
- [x] TimescaleDB and Grafana integration
- [ ] complex load phases: multiple phases for different load strategy and duration
- [ ] distributed load testing
- [ ] [`loadflux recorder`](https://github.com/loadflux/loadflux-recorder) Chrome extension to record the scenario and generate scenario file automatically
- [ ] [`loadflux webbench`](https://github.com/loadflux/loadflux-webbench) Browser-side performance/load testing tool which simulates the web browser users
and drives browsers to test the comprehensive performance of your application.
