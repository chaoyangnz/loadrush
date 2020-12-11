---
id: core-concepts
title: Core Concepts
---

# Virtual User 

A.k.a VU, represent a user which is supposed to execute your scenarios.

# Scenario

A scenarios is a list of actions a normal user can take in your applications.

# Action

An operation in your application, typically including requests (APIs, static assets etc), think time, logging.

# Runner

A runner is the pilot who controls everything of your testing. When a new virtual user arrives, the runner will first checkin at candidates registry, and choose a scenario probabilistically as per the scenario weight. The last step is to assign the virtual user to that scenario and run it until the scenario is completed. You can decide how new virtual users arrive in a constant number or a ramp-up rate.
