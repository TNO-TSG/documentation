# TNO Security Gateway Documentation

This repository contains the Jekyll-based documentation that is deployed on https://tno-tsg.github.io

## Prerequisites

* [Ruby](https://www.ruby-lang.org/en/downloads/) version 2.5.0 or higher, including all development headers (check your Ruby version using `ruby -v`)
* [RubyGems](https://rubygems.org/pages/download) (check your Gems version using `gem -v`)
* [GCC](https://gcc.gnu.org/install/) and [Make](https://www.gnu.org/software/make/) (check versions using `gcc -v`,`g++ -v`, and `make -v`)
* [NodeJS](https://nodejs.org/en/)

See for more details: [Jekyll Requirements](https://jekyllrb.com/docs/installation/#requirements)

Install `bundler`:
```bash
gem install bundler
```


## Run locally

The repository uses [Gulp](https://gulpjs.com/) to compile SASS and Javascript into versions that can be used in browsers.

To compile the resources run:
```bash
npm run dev
```

To serve the Jekyll page, while watching changes in the filesystem (excluding changes to SASS & Javascript), run:
```bash
bundle exec jekyll serve
```

## Publishing the Documentation site

The Jekyll page is automatically built and pushed to Github pages on commits to the `main` branch.
At this moment changes to SASS & JS are not compiled by Github Pages, so before committing changes to SASS & JS files first run `npm run dev`.