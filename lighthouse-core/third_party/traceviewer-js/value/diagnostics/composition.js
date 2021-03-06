/**
Copyright 2016 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("./related_value_map.js");

'use strict';

global.tr.exportTo('tr.v.d', function() {
  /**
   * Composition encapsulates an additive relationship between NumericValues:
   * the Value that contains this Composition diagnostic is composed of the
   * Values referenced by this Composition diagnostic. Composition is a
   * "breakdown" of its containing Value into its contained Values. This
   * additive relationship can apply to groups of other things besides Events,
   * such as memory allocations. Compositions over groups of Events is expected
   * to be the most common way of building Compositions, though it is not the
   * only way. See buildFromEvents() for an example of how to build a
   * Composition from an EventSet and a grouping function.
   *
   * @constructor
   */
  function Composition() {
    tr.v.d.RelatedValueMap.call(this);
  }

  /**
   * Build a Composition and its NumericValues from |events|. Group events using
   * |categoryForEvent|. Add the NumericValues to |values|. NumericValues' names
   * are prefixed with |namePrefix|. Numerics are built by |numericBuilder|. The
   * Numeric sample for each Event is derived from |opt_sampleForEvent|, which
   * defaults to event.cpuSelfTime. The caller must add the result Composition
   * to their Value's diagnostics.
   *
   * @param {!tr.v.ValueSet} values
   * @param {string} namePrefix
   * @param {!tr.model.EventSet} events
   * @param {!tr.v.NumericBuilder} numericBuilder
   * @param {!function(!tr.model.Event):string} categoryForEvent
   * @param {!function(!tr.model.Event):number=} opt_sampleForEvent
   * @param {*=} opt_this
   * @return {!Composition}
   */
  Composition.buildFromEvents = function(
      values, namePrefix, events, numericBuilder, categoryForEvent,
      opt_sampleForEvent, opt_this) {
    var sampleForEvent = opt_sampleForEvent || ((event) => event.cpuSelfTime);

    var composition = new Composition();
    for (var event of events) {
      var sample = sampleForEvent.call(opt_this, event);
      if (sample === undefined)
        continue;

      var eventCategory = categoryForEvent.call(opt_this, event);
      var value = composition.get(eventCategory);
      if (value === undefined) {
        value = new tr.v.NumericValue(
            namePrefix + eventCategory, numericBuilder.build());
        values.addValue(value);
        composition.set(eventCategory, value);
      }

      value.numeric.add(sample, new tr.v.d.RelatedEventSet([event]));
    }
    return composition;
  };

  Composition.prototype = {
    __proto__: tr.v.d.RelatedValueMap.prototype,

    /**
     * Add a Value by an explicit name to this map.
     *
     * @param {string} name
     * @param {!(tr.v.d.ValueRef|tr.v.Value)} value
     */
    set: function(name, value) {
      if (!(value instanceof tr.v.d.ValueRef)) {
        if (!(value instanceof tr.v.NumericValue))
          throw new Error('Composition can only contain NumericValues');

        if (value.name.indexOf(name) !== (value.name.length - name.length))
          throw new Error('Composition name must be a suffix of value.name');

        var existingValues = this.values;
        if ((existingValues.length > 0) &&
            (value.numeric.unit !== existingValues[0].numeric.unit)) {
          throw new Error('Units mismatch', existingValues[0].numeric.unit,
                          value.numeric.unit);
        }
      }

      tr.v.d.RelatedValueMap.prototype.set.call(this, name, value);
    }
  };

  Composition.fromDict = function(d) {
    var composition = new Composition();
    tr.b.iterItems(d.values, function(name, guid) {
      composition.set(name, new tr.v.d.ValueRef(guid));
    });
    return composition;
  };

  tr.v.d.Diagnostic.register(Composition, {
    elementName: 'tr-v-ui-composition-span'
  });

  return {
    Composition: Composition
  };
});
