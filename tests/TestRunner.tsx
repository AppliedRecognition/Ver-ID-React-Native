/*global globalThis*/
'use strict';
const jasmineRequire = require('./api/jasmine');
import VerIDTests from './tests';
import { store } from './redux/store';

export default {
  //Export object with an execute function
  execute: function (VerIDPlugin: any) {
    // Boot jasmine (this is borrowed from their boot.js script)
    var jasmine = jasmineRequire.core(jasmineRequire);
    var env = jasmine.getEnv();
    var jasmineInterface = jasmineRequire.interface(jasmine, env);

    function extend(destination: any, source: any) {
      for (var property in source) destination[property] = source[property];
      return destination;
    }
    let global: any = globalThis;

    extend(global.window, jasmineInterface);

    // Helper function for adding test results to the state tree
    function emitResult(text: any, classes: any[] = []) {
      console.log(text);
      store.dispatch({
        type: 'ADD_TESTS',
        payload: {
          text: text,
          classes: classes,
        },
      });
    }
    // Custom reporter to collect the test results
    var reactReporter = {
      jasmineStarted: function () {
        // Let everybody know we are testing
        store.dispatch({ type: 'SET_TESTS', payload: [] });
        store.dispatch({ type: 'SET_TESTING', payload: true });
      },
      suiteStarted: function (result: any) {
        console.log('[suiteStarted]');
        console.table(result);
        emitResult(result.fullName, ['suite_started']);
      },
      specStarted: function (result: any) {
        console.log('[specStarted]');
        console.table(result);
        emitResult(result.fullName, ['spec_started']);
      },
      specDone: function (result: any) {
        console.log('[specDone]');
        console.table(result);
        var spec_class = 'empty';
        if (
          result.passedExpectations.length > 0 &&
          result.failedExpectations.length === 0
        ) {
          // There were some passes and no failures
          spec_class = 'passed';
        } else if (result.failedExpectations.length > 0) {
          // There were failures
          spec_class = 'failed';
        }
        emitResult(
          result.status +
            ' (' +
            result.passedExpectations.length +
            ' passed, ' +
            result.failedExpectations.length +
            ' failed)',
          [spec_class, 'spec_done']
        );
        for (var i = 0; i < result.failedExpectations.length; i++) {
          emitResult('Failure: ' + result.failedExpectations[i].message, [
            'failure_detail',
          ]);
          // We can use the error stack too if we want :
          // result.failedExpectations[i].stack
        }
      },
      suiteDone: function () {
        // Nothing to do here
      },
      jasmineDone: function () {
        // Let everyone know we are done testing
        store.dispatch({ type: 'SET_TESTING', payload: false });
      },
    };
    env.addReporter(reactReporter);
    // Invoke our test specs
    VerIDTests(VerIDPlugin);
    // Run the tests
    env.execute();
  },
};
