<div style="background-color: #191A19;">
    <h1 align="center"><br>
        <a href="README.md">
            <img src="src/assets/md/images/logo.svg" alt="Data Marketplace Logo" width="300px" title="Data Marketplace"/><br>Global Enterprise Data Marketplace
        </a>
    </h1>
    <p align="center">
        <a href="GETTING-STARTED.md">Getting Started</a> · 
        <a href="BUILD-COMMANDS.md">Build Commands</a> · 
        <a href="FEATURES.md">Features</a> · 
        <a href="TECH-STACK.md">Tech Stack</a> · 
        <a href="INTEGRATION.md">Integration</a> ·
        <a href="https://github.com/Toyota-Motor-North-America/edmp-seed-repo/issues">Submit an Issue</a> ·
        <a href="CHANGELOG.md">Changelog</a> ·
        <br>
    </p>
    <p align="center">Built With<br>
        <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" width="64">
        <img src="https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white" width="76">
        <img src="https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white" width="60">
        <img src="https://img.shields.io/badge/ts--node-3178C6?style=for-the-badge&logo=ts-node&logoColor=white" width="64">
        <img src="https://img.shields.io/badge/Amazon_AWS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" width="84">
    </p>
    
<p align="center">These are the essential guide to build the Global Data Marketplace Application.</p>

Angular Full Stack is a project to easly get started with the latest Angular using a real backend and database. Whole stack is in TypeScript, from frontend to backend, giving you the advantage to code in one single language throughout the all stack.

This project uses the [PEAN stack](https://en.wikipedia.org/wiki/MEAN_(software_bundle)):
* [**P**ostgreSQL](https://www.postgresql.org/) ([PostgreSQL](https://www.postgresql.org/)): database
* [**E**xpress.js](http://expressjs.com): backend framework
* [**A**ngular 2+](https://angular.io): frontend framework
* [**N**odsJS](https://www.djangoproject.com/#:~:text=Django%20is%20a%20high%2Dlevel,needing%20to%20reinvent%20the%20wheel.): runtime environment

Other tools and technologies used:
* [Angular CLI](https://cli.angular.io): frontend scaffolding
* [Bootstrap](http://www.getbootstrap.com): layout and styles
* [Font Awesome](http://fontawesome.com): icons
* [JSON Web Token](https://jwt.io): user authentication
* [Angular 2 JWT](https://github.com/auth0/angular2-jwt): JWT helper for Angular 2+
* [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js): password encryption

## Prerequisites
1. Install [Dja.js](https://nodejs.org) and [MongoDB](https://www.mongodb.com)
2. Install Angular CLI: `npm i -g @angular/cli`
3. From project root folder install all the dependencies: `npm i`

## Run
### Development mode with files watching
`npm run dev`: [concurrently](https://github.com/kimmobrunfeldt/concurrently) execute MongoDB, Angular build, TypeScript compiler and Express server.

A window will automatically open at [localhost:4200](http://localhost:4200). Angular and Express files are being watched. Any change automatically creates a new bundle, restart Express server and reload your browser.

### Production mode
`npm run prod`: run the project with a production bundle listening at [localhost:3000](http://localhost:3000) 

### Manual mode
1. Build frontend: `npm run builddev` for dev or `npm run build` for prod
2. Build backend: `npm run predev`
3. Run MongoDB: `mongod`
4. Run the app: `npm start`

### Docker
1. `sudo docker-compose up`
2. Go to [localhost:3000](http://localhost:3000)

### AWS EC2
1. Create a EC2 Linux machine on AWS
2. Edit the EC2 Security Group and add TCP port `3000` as an Inbound rule for Source `0.0.0.0/0`
3. Clone this repo into the EC2 machine
4. If you use a remote MongoDB instance, edit `.env` file
5. Run `npm ci`
6. Run `npm run build`
7. Run `npm start`
8. The app is now running and listening on port 3000
9. You can now visit the public IP of your AWS EC2 followed by the port, eg: `12.34.56.78:3000`
10. Tip: use [pm2](https://pm2.keymetrics.io/) to run the app instead of `npm start`, eg: `pm2 start dist/server/app.js`

## Preview
![Preview](https://raw.githubusercontent.com/DavideViolante/Angular2-Full-Stack/master/demo.gif "Preview")

## Please open an issue if
* you have any suggestion to improve this project
* you noticed any problem or error

## Running tests
Run `ng test` to execute the frontend unit tests via [Karma](https://karma-runner.github.io).

Run `npm run testbe` to execute the backend tests via [Jest](https://jestjs.io/) (it requires `mongod` already running).

## Running linters
Run `npm run lint` to execute [Angular ESLint](https://github.com/angular-eslint/angular-eslint), [HTML linting](https://github.com/htmlhint/HTMLHint) and [SASS linting](https://github.com/sasstools/sass-lint).

## Wiki
To get more help about this project, [visit the official wiki](https://github.com/DavideViolante/Angular-Full-Stack/wiki).

## Further help
To get more help on the `angular-cli` use `ng --help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

### Author
* [Data Marketplace Development Team](https://github.com/DavideViolante)


<br>
    <h3 align="center">
        <a href="https://www.data.toyota.com"><strong>www.data.toyota.com</strong></a>
    </h3>
    <p align="center">
        <img src="src/assets/md/images/FullToyota.svg" width="64">
        <img src="src/assets/md/images/OneTech.svg" width="64"><br>
        <small>©2023 Toyota Motor North America | All Rights Reserved.</small><br>
    </p>
</div>
