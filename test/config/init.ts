import * as raf from 'raf';
raf.polyfill();

import 'ionic-angular/polyfills/polyfills.js';
import 'zone.js/dist/long-stack-trace-zone';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/proxy';
import 'zone.js/dist/jasmine-patch';
import 'reflect-metadata';
import 'mock-local-storage';

jest.mock('sharp', () => {
  return {};
}, { virtual: true });

import * as meteorBundleConfig from '../../meteor-client/bundler.config.json';
import '../../meteor-client/meteor.bundle.js';

Object.keys(meteorBundleConfig.import).forEach((key) => {
  jest.mock('meteor/' + key, () => {
    return window['Package'][key];
  }, { virtual: true });
});

Object.keys(meteorBundleConfig.export).forEach((key) => {
  const toExportArray = meteorBundleConfig.export[key];

  jest.mock('meteor/' + key, () => {
    return toExportArray.map((exportName) => {
      return {
        [exportName]: window['Package'][key][exportName]
      };
    }).reduce((a, b) => {
      return Object.assign(a, b);
    }, {});
  }, { virtual: true });
});
