# InfluxDB integration

## Environment variables
- Metrics (InfluxDB)
    - `LOADFLUX_INFLUXDB_API`: `InfluxDB` v2 API endpoint, typically like `https://us-west-2-1.aws.cloud2.influxdata.com/api/v2`. Refer to `InfluxDB` documentation.
    - `LOADFLUX_INFLUXDB_TOKEN`: `InfluxDB` token, which can be found in InfluxDB cloud admin console.
    - `LOADFLUX_INFLUXDB_ORG`: `InfluxDB` organization, which be can be found in the URL of InfluxDB cloud admin console. e.g. `https://us-west-2-1.aws.cloud2.influxdata.com/orgs/<orgID>`.
    - `LOADFLUX_VERBOSE_METRICS`: in terms of InfluxDB cost, text fields will be sent when it is set as `true`, otherwise only numeric fields are sent. Default: `false`.
    As we know, InfluxDB Cloud free plan has a rate limit of 10kb/s write.

## InfluxDB

If you'd like to use InfluxDB as a metric storage, we still support it.

All the data is collected in `InfluxDB` if you set up the account beforehand. Then you can filter and aggregate time-series data, and end up with fancy charts.
If you like, build a dashboard and keep monitoring. All these things are depending on your Data processing skills.

You can easily set up a InfluxDB in your cluster. Please check `influxdb` folder where there are some kubernetes resource to help you deploy an influxDB in your kubernetes cluster.
We set up a public one: https://data.loadflux.io

We integrate [InfluxDB](https://www.influxdata.com/) and send real-time metrics to the cloud, so we can do analytics later.
Some basic metrics like requests/success/failure count, mean response time, RPS, active virtual users etc can be monitored in its platform.
We choose InfluxDB as it has an intuitive UI and easy to integrate. But we will add more integrations to other monitoring platforms in the future.

![](https://i.imgur.com/gqWg5Xz.gif)
