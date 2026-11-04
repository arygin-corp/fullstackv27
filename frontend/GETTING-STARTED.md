<div style="background-color: #191A19;">
  <h1 align="center"><br>
    <a href="README.md">
        <img src="src/assets/icons/icon-512x512.png" alt="Data Marketplace Logo" width="64px" height="64px" title="Data Marketplace"/><br>Global Enterprise Data Marketplace Application
    </a>
    <br>
    <a href="https://www.data.toyota.com" style="font-size: 16px; font-weight: 900;"><strong>www.data.toyota.com</strong></a>
  </h1>

  <p align="center">
    Global Enterprise Data Marketplace is a self-service data marketplace portal which enables TMNA users, business partners, affiliates, and contingent workers to discover and request Readily Available Data, Analytics, and Reports at Toyota. The Data Marketplace provides all Toyota users with the ability to search, discover and request any data, available in any form, at Toyota. This reduces the reliance on Data Stewards, Data Analysts, and other individuals/groups related to data management, and also saves the users a lot of time trying to find or request access to data.
  </p>

  <p align="center">
    <a hr[README.md](README.md)ef="GETTING-STARTED.md">Getting Started</a> · 
    <a href="BUILD-COMMANDS.md">Build Commands</a> · 
    <a href="FEATURES.md">Features</a> · 
    <a href="TECH-STACK.md">Tech Stack</a> · 
    <a href="INTEGRATION.md">Integration</a> ·
    <a href="https://github.com/Toyota-Motor-North-America/edmp-seed-repo/issues">Submit an Issue</a> ·
    <a href="CHANGELOG.md">Changelog</a> ·
    <br>
  </p>

  <p align="center">Built With <br>
    <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" width="64">
    <img src="https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white" width="76">
    <img src="https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white" width="60">
    <img src="https://img.shields.io/badge/ts--node-3178C6?style=for-the-badge&logo=ts-node&logoColor=white" width="64">
    <img src="https://img.shields.io/badge/Amazon_AWS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" width="84">
  </p>

  <h1 align="center">GETTING STARTED</h1>

## Contents
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development Server](#development-server)
- [Code Scaffolding](#code-scaffolding)
- [Build](#build)
- [Running Unit Tests](#running-unit-tests)
- [Running End-to-End Tests](#running-end-to-end-tests)
- [Further Help](#further-help)

## Prerequisites
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- Node.js and NPM – we recommend using [NVM (Linux/Mac)](https://github.com/creationix/nvm) or [NVM-Windows (Windows)](https://github.com/coreybutler/nvm-windows)
- Install Angular CLI via `npm i -g @angular/cli@13.1.2`

## Getting Started

```
git clone https://github.com/Toyota-Motor-North-America/edmp-data-marketplace-frontend
cd edmp-data-marketplace-frontend
npm i
npm start
```

The `npm start:client` calls the `serve:all` command which is a convenience method that runs the `serve:api` and `serve:web` commands concurrently. You can run each command separately if you need to.

```
"start:client": "npm run serve:all",
"serve:web": "ng serve --port 4300 --open",
"serve:api": "json-server server/db.json",
"serve:all": "concurrently \"npm run serve:api\" \"npm run serve:web\"",
```

The web application will open to [http://localhost:4200](http://localhost:4200) in your browser.

You can see the API by navigating to [http://localhost:3000/](http://localhost:3000/) in your browser.

> Note: the above terminal commands are for Mac. Remember to substitute the appropriate commands for your OS.

## Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code Scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running Unit Tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running End-to-End Tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further Help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

  <p align="center">
    <img src="md/images/FullToyota.svg" width="64">
    <img src="md/images/OneTech.svg" width="64"><br>
    <small>©2023 Toyota Motor North America | All Rights Reserved.</small><br>
  </p>
</div>
