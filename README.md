# Reaktor Birsnest
Answer to the Reaktor 2023 Developer Trainee pre-assigment https://assignments.reaktor.com/birdnest/?_gl=1*1a7lrer*_ga*MzM5NzY2NzI4LjE2NzI2NzM1NzA.*_ga_DX023XT0SX*MTY3MzAxMjQxMS44LjAuMTY3MzAxMjQxMS42MC4wLjA.

## Stack and about the solution
The solution utilises Sveltekit + Google firebase. The most important parts of the solution are located in:

functions/

Source folder for the google cloud functions, operating as the back end logic Most of the solution related logic is in droneLogger.js scheduler.js answers the question how to get a task like this running on cloud funtionns

src/droneWatcher

Frontend of the solution in svelte DroneWatcher.svelte for the whole component, Violations.svelte for a table of the reguired adata for the assigment and LiveView for (arguably) cool areal snapshot of the area

## Kinks and quirks
The scheduler turns of after 30 minutes without and update from client.

Bc of the way scheduler is only run every minute, it takes up to a minute to start working again.

The cloudfunctions have somethign called "ramp-up-time" before they are given the full performance (I suppose dedicated threat or something) for which is why the program might studder or lag for the first ten minutes of being active or so.

Also the assigment URL returns 429 every now or then (I would assume its bc someone else is doing the assigment aswell) an update might be skipped.
