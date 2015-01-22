# SDE Integration

[![Build Status](http://build.etilizepak.com/buildStatus/icon?job=sde-integration-nightly)](http://build.etilizepak.com/job/sde-integration-nightly/)

SDE Integration is a web project used as an addon for CMS edit specs page, and communicates with SDE and Inference engine to extract values in edit specs interface. It allows the user to extract source string, and get extraction suggestions from it, and also get inference suggestions for dependent parameters based on user extracted parameters.

# Building from Source

Clone the git repository using the URL on the Gitlab home page:

    $ git clone http://git.etilizepak.com/automation/sde-integration.git
    $ cd sde-integration

## Command Line
Use Maven 2.2 or 3.0, then on the command line:

    $ mvn install

## SpringSource Tool Suite (STS)
In STS (or any Eclipse distro or other IDE with Maven support), import the module directories as existing projects.  They should compile and the tests should run with no additional steps.

# Contributing to Smart Data Extraction
Before checkin make sure to run mvn clean install -Pdev. This will add license and format code according to etilize standards.

Here are some ways for you to get involved:

* Create [JIRA](http://jira.etilizepak.com/browse/SDE) tickets for bugs and new features and comment and vote on the ones that you are interested in.
* If you want to write code, we encourage contributions through merge requests from forks of this repository.
If you want to contribute code this way, please familiarize yourself with the process outlined for contributing to projects here: [Contributor Guidelines](http://git.etilizepak.com/automation/sde/wikis/Contributor-Guidelines).
