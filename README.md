# Knex-log [![Build Status](https://secure.travis-ci.org/noblesamurai/knex-log.png?branch=master)](http://travis-ci.org/noblesamurai/knex-log) [![NPM version](https://badge-me.herokuapp.com/api/npm/knex-log.png)](http://badges.enytc.com/for/npm/knex-log)

> Implementation of a log using knex.

## Purpose

Implementation of [abstract-log](github.com/eugeneware/abstract-log) using [knex](knexjs.org).

## Usage

```js
  const knex = {/* your knex instance */};
  const knexLog = require('knex-log')(knex, { tableName: 'tableName' });
```
Now use it like [abstract-log](github.com/eugeneware/abstract-log).

## API

cf [abstract-log](github.com/eugeneware/abstract-log).

## Installation

This module is installed via npm:

``` bash
$ npm install knex-log
```
## License

The BSD License

Copyright (c) 2017, Tim Allen

All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.

* Neither the name of the Tim Allen nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

