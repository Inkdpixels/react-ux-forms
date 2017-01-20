import test from 'ava';
import React from 'react';
import {shallow} from 'enzyme';
import Section from './section';

test('<Form.Section/>', t => {
	t.is(typeof Section, 'function');

	const Component = props => <div {...props}/>;
	const wrapper = shallow(
		<Section Component={Component}>
			Foo bar
		</Section>
	);

	t.is(wrapper.find(Component).length, 1, 'should render the passed Component.');
	t.true(wrapper.find(Component).html().includes('Foo bar'), 'should render the passed children.');
});
