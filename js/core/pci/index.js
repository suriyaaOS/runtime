// Copyright 2015 runtime.js project authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';
var assert = require('assert');
var scan = require('./scan');
var PciDevice = require('./pci-device');
var typeutils = require('typeutils');
var isint = require('isint');

var deviceList = [];

function init() {
  var pciDataList = scan();
  for (var i = 0, l = pciDataList.length; i < l; ++i) {
    var pciData = pciDataList[i];
    deviceList.push(new PciDevice(pciData));
  }
}

function findDevice(vendorId, deviceId) {
  assert(isint.uint16(vendorId));
  assert(isint.uint16(deviceId) || typeutils.isFunction(deviceId));

  for (var i = 0, l = deviceList.length; i < l; ++i) {
    var device = deviceList[i];
    if (device.hasDriver()) {
      continue;
    }

    if (device.vendorId !== vendorId) {
      continue;
    }

    if (typeutils.isFunction(deviceId)) {
      if (!deviceId(device.deviceId)) {
        continue;
      }
    } else {
      if (device.deviceId !== deviceId) {
        continue;
      }
    }

    return device;
  }

  return null;
}

init();

exports.addDriver = function(vendorId, deviceId, opts) {
  var device = findDevice(vendorId, deviceId);
  if (device) {
    device.setDriver(opts);
  }
};
