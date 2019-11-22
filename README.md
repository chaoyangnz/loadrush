# Loadramp

## What is it?

Loadramp is a simplistic tool for load testing.
You just need to focus more on how to design your scenario, and the scripting is just taking several minutes.
The infrastructure requirement is pretty low, you can simulate hundreds of virtual users to send requests to your application.
It support different strategy to ramp the load, by default in this library, we provide:

- sustain a constant load, for example, you want to keep 200 users in your web application to do different actions. 
When one user exits, another user will be arriving to sustain the load
- ramp up the load until you know the extrame capability of your infrastructure and user experience, for example, 
you can ramp up 50 new users per second, then sometime your application will crash and have no response.

## Roadmap

- collect statistical data to help analytics and build metrics to visualise
- complex load phases
- distributed load testing




