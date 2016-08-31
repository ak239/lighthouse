/**
 * @license
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const Gatherer = require('./gatherer');

class Offline extends Gatherer {
  beforePass(options) {
    return options.driver.goOffline();
  }

  afterPass(options, tracingData) {
    const navigationRecord = tracingData.networkRecords.filter(record => {
      // If options.url is just an origin without a path, Chrome will implicitly
      // add in a path of '/'.
      return (record._url === options.url || record._url === options.url + '/') &&
        record._fetchedViaServiceWorker;
    }).pop(); // Take the last record that matches.

    this.artifact = navigationRecord ? navigationRecord.statusCode : -1;

    return options.driver.goOnline(options);
  }
}

module.exports = Offline;
