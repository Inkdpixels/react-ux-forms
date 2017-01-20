import test from 'ava';
import React from 'react';
import {shallow} from 'enzyme';
import {fn, Component} from './stubs';

test('stubs.fn', t => {
	t.is(typeof fn, 'function', 'should be a function');
	t.is(fn(), null, 'should return `null`');
});

test('stubs.Component', t => {
	t.is(typeof Component, 'function');
	t.is(shallow(<Component/>).type(), 'div', 'should render a div node');
	t.true(shallow(<Component id="foo"/>).html().includes('id="foo"'), 'should propagate all props to the div node');
});
