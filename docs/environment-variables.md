---
id: environment-variables
title: Environment Variables
sidebar_label: Environment Variables
---

Loadflux has some environment variables worth noticing. Either create a .env file or specify them when you run your application (e.g. in Dockerfile, docker-composer file, k8s deployment.yaml, CloudFormation, etc).

These environment variables are fallen into 3 categories: general, metrics and logging.

# General

LOADFLUX_DURATION: how long you plan to run your load testing.
LOADFLUX_BASE_URL: the base url of your application. If you don't set, you have to use absolute URL in your http action.
LOADFLUX_TEST_ID: the test id (16 chars at most) used for different iteration of your testing. Default: current timestamp since unix epoch.

# Metrics

- LOADFLUX_INFLUXDB_API: InfluxDB v2 API endpoint, typically like https://us-west-2-1.aws.cloud2.influxdata.com/api/v2. Refer to InfluxDB documentation.
- LOADFLUX_INFLUXDB_TOKEN: InfluxDB token, which can be found in InfluxDB cloud admin console.
- LOADFLUX_INFLUXDB_ORG: InfluxDB organization, which be can be found in the URL of InfluxDB cloud admin console. e.g. https://us-west-2-1.aws.cloud2.influxdata.com/orgs/#orgID#.
- LOADFLUX_VERBOSE_METRICS: in terms of InfluxDB cost, text fields will be sent when it is set as true, otherwise only numeric fields are sent. Default: false. As we know, InfluxDB Cloud free plan has a rate limit of 10kb/s write.

# Logging

- DEBUG: we are use debug as our underlying logger, so you can enable a namespace. e.g. DEBUG=loadflux:*
