/**
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

const Audit = require('../../audits/user-timings.js');
const assert = require('assert');
const traceEvents = require('../fixtures/traces/trace-user-timings.json');

/* eslint-env mocha */

describe('Performance: user-timings audit', () => {
  it('fails gracefully', () => {
    return Audit.audit({}).then(response => {
      return assert.equal(response.score, -1);
    });
  });

  it('evaluates valid input correctly', () => {
    return Audit.audit({traces: {[Audit.DEFAULT_PASS]: {traceEvents}}})
      .then(response => {
        assert.equal(response.score, 2);
        assert.ok(!Number.isNaN(response.extendedInfo.value[0].startTime));
        assert.ok(typeof response.extendedInfo.value[0].endTime === 'undefined');
        assert.ok(typeof response.extendedInfo.value[0].duration === 'undefined');
        assert.ok(!Number.isNaN(response.extendedInfo.value[1].startTime));
        assert.ok(!Number.isNaN(response.extendedInfo.value[1].endTime));
        assert.ok(!Number.isNaN(response.extendedInfo.value[1].duration));
      });
  });
});
