# Developing for Blueprints

## Overview

Blueprints have three flavors -- Infrastructure, Architecture and Reference. This repo contains an Architecture
Blueprint.

## Prerequisites

- All Toyota onboarding completed
- Chofer developer onboarding - this can be requested as part of your team onboarding through the DevEx team manager
  (Steve Berry)

## Working on code

- Create a feature branch with the naming convention (source?) `feature/CDX-xxx`
- Create a PR and get it approved
    - At the time of this writing, builds are not required to pass for the PR to be approved -- builds seem
      to be invalid for this Blueprint

### Setting up to Deploy using Terragrunt from Your Local Machine

In order to locally execute deployment of infrastructure (e.g. `terragrunt deploy`) from your infra-live repo for
testing, you will need:

- Infra Modules GitHub access - You will need access
  to [this repo](https://github.com/Toyota-Motor-North-America/ace-aws-blueprint-ecs)
    - currently, forking is disabled. In order to contribute, you need RW access to the repo
- Gruntworks GitHub access - You will also need access
  to [the Gruntworks GitHub org for their modules.](https://github.com/gruntwork-io) Note that this is not on the TMNA
  internal enterprise GitHub, so you will need to use a separate
  account and request access through DevEx/Mitchell Jenkins
- SSH Keys - Setup SSH keys to enable access to the above sources when executing terragrunt. Your steps to do this will
  depend on your dev environment, such as your shell. You likely need to configure your `.ssh/config` to use the proper
  GitHub usernames and SSH keys for each source.

    ```
    Host github-external.com
        Hostname github.com
        User <your-external-user-name>
        IdentityFile ~/.ssh/<your-external-ssh-key>
    Host github.com
        Hostname github.com
        User <your-internal-user-name>
        IdentityFile ~/.ssh/<your-internal-ssh-key>
    ```

If you use default ssh key names of different key types (e.g. "/.ssh/id_ed25519" and "/.ssh/id_rsa", later setup may be
easier, as your SSH agent may automatically pick up keys with those names (this isn't required). If you have
authentication issues due to your ssh keys not being automatically picked up, you may need to manually start your ssh
agent and/or add the keys.

- You also may need to add these or similar lines to your `~/.gitconfig`

    ```
    [url "ssh://git@github-external.com/gruntwork-io"]
        insteadOf = ssh://git@github.com/gruntwork-io
    [url "git@github-external.com:gruntwork-io"]
        insteadOf = git@github.com:gruntwork-io
    ```

- Long file name issues (Windows/Git) - Some modules that are downloaded during the `terragrunt init` process may end up
  with file paths that are long enough to cause issues on Windows. There are a few things you can try to prevent these
  issues:
    - Have Terragrunt cache modules closer to the root directory. To do this, set the environment
      variable `TERRAGRUNT_DOWNLOAD` to a folder like `C:\.terragrunt-cache`
    - Enable Windows long path support. Specifics may depend on your OS version, but searching "enable Windows <version>
      long path support" should give the relevant steps
    - Enable Git long path support with `git config --system core.longpaths true`

## Finishing

- When PR is approved, it can be safely merged to master
- (optional) Tag (lightweight) the merge (loosely) following SemVer, e.g. `vM.m.p`. For example, `v0.0.0` or `v1.2.3`
- [create a release](https://github.com/Toyota-Motor-North-America/ace-aws-infra-modules/releases/new)
    - If you skipped the previous step, the create release will also create a new tag. Use the tag previously created or
      create one as part of the release. The tag can also be the title of the release. Use the autogenerate to fill in
      the details, or hand-write a description of the changes.
- Create a PR
  in [ace-self-service-templates](https://github.com/Toyota-Motor-North-America/ace-self-service-templates/tree/master/templates)
    - The template.yaml which corresponds to the module you worked on may need to be updated if existing Blueprint, or
      added if a new Blueprint
    - The changes you made to template.yaml require verifying on your local. This (currently) requires a locally
      running [Chofer Portal](https://github.com/Toyota-Motor-North-America/ace-self-service-mono)
- Create a PR
  in [ace-tech-docs](https://github.com/Toyota-Motor-North-America/ace-tech-docs/blob/master/docs/blueprints/published-blueprints.md)
    - You may need to change published blueprints, or other files
- Create a PR
  in [ace-self-service-content](https://github.com/Toyota-Motor-North-America/ace-self-service-content/tree/master/markdown/news)
    - Create release notes and update the JSON
