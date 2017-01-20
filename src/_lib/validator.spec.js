import test from 'ava';
import {severitiesByKey, validator} from './validator.js';

test('severitiesByKey', t => {
	t.is(typeof severitiesByKey, 'object', 'should be an object');
	t.truthy(severitiesByKey.error, 'should contain an `error` property');
	t.truthy(severitiesByKey.info, 'should contain an `info` property');
	t.truthy(severitiesByKey.warning, 'should contain an `warning` property');
	t.truthy(severitiesByKey.success, 'should contain an `success` property');
});

test('validator()', t => {
	t.is(typeof validator, 'function', 'should be a function');
	t.is(typeof validator(), 'object', 'should return an object');
	t.is(validator({rules: [{}]}).isValid, true, 'should return an object containing an truthy isValid flag');

	let rules = [
		{test: value => value === 'bar', message: 'Value should not equal "bar"', severity: 'error'},
		{test: value => value === 'foo', message: 'Value should not equal "foo"', severity: 'error'}
	];
	let results = validator({rules, value: 'foo'});

	t.is(results.isValid, false, 'should iterate over the passed rules and return the first match that responds with a truthy test value');
	t.is(results.message, 'Value should not equal "foo"', 'should propagate any property of the truthy test as a property of the returned object');
	t.is(results.severity, 'error', 'should propagate the `severity` of the truthy test as a property of the returned object');

	rules = [
		{test: value => value === 'bar', message: 'Value should not equal "bar"', forced: true, severity: 'info'},
		{test: value => value === 'foo', message: 'Value should not equal "foo"'}
	];
	results = validator({rules, value: 'foo'});

	t.is(results.message, 'Value should not equal "bar"', 'should return the first test that has a truthy `forced` property by the owner');

	rules = [
		{test: /bar/g, message: 'Value should not include "bar"'},
		{test: value => value === 'foo', message: 'Value should not equal "foo"'}
	];
	results = validator({rules, value: 'baz bar qux'});

	t.is(results.message, 'Value should not include "bar"', 'should support RegExp tests');

	rules = [
		{test: /bar/g, message: 'Value should not include "bar"'},
		{test: value => value === 'foo', message: 'Value should not equal "foo"', severity: 'info'}
	];
	results = validator({rules, value: 'baz bar qux'});

	t.is(results.severity, 'error', 'should provide a default "severity" of type "error" if none was passed in the matching test');
});
