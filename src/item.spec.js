import test from 'ava';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import Item from './item';

test('<Form.Item/>', t => {
	t.is(typeof Item, 'function');

	let Component = props => <div {...props}/>;
	let wrapper = shallow(
		<Item
			id="foo-id"
			title="bar"
			Component={Component}
			invalidPropName={null}
			>
			Foo bar
		</Item>
	);

	t.is(wrapper.find(Component).length, 1, 'should render the passed Component.');
	t.true(wrapper.html().includes('Foo bar'), 'should render the passed children.');
	t.is(wrapper.prop('id'), 'foo-id', 'should propagate the `id` prop to the Component.');
	t.is(wrapper.prop('title'), 'bar', 'should propagate the unknown props to the Component.');
	t.is(wrapper.prop('onChange'), wrapper.instance().handleChange, 'should propagate the instances handleChange() method to the Component.');
	t.is(wrapper.prop('onBlur'), wrapper.instance().handleBlur, 'should propagate the instances handleBlur() method to the Component.');

	Component = props => <input {...props}/>;
	wrapper = shallow(
		<Item
			id="foo-id"
			Component={Component}
			invalidPropName="invalid"
			isValidationResultFatal={true}
			/>
	);

	t.is(wrapper.find(Component).prop('invalid'), true, 'should propagate the `isValidationResultFatal` prop under the given `invalidPropName` name to the component');
});

test('<Form.Item/>().handleChange()', t => {
	const Component = props => <div {...props}/>;
	const onChange = sinon.spy();
	const onBlur = sinon.spy();
	const wrapper = shallow(
		<Item
			id="foo-id"
			Component={Component}
			onChange={onChange}
			onBlur={onBlur}
			invalidPropName={null}
			/>
	);

	t.is(onChange.callCount, 0, 'should initially not touch the `onChange` prop');

	wrapper.instance().handleChange('Foo Value');

	t.is(onChange.callCount, 1, 'should call the `onChange` prop when executing the instances handleChange() method');
	t.is(onChange.args[0][0], 'foo-id', 'should call the `onChange` prop with the passed `id` prop as its first argument');
	t.is(onChange.args[0][1], 'Foo Value', 'should call the `onChange` prop with the incomming value as its second argument');
});

test('<Form.Item/>().handleBlur()', t => {
	const Component = props => <div {...props}/>;
	const onChange = sinon.spy();
	const onBlur = sinon.spy();
	const wrapper = shallow(
		<Item
			id="foo-id"
			Component={Component}
			onChange={onChange}
			onBlur={onBlur}
			invalidPropName={null}
			/>
	);

	t.is(onBlur.callCount, 0, 'should initially not touch the `onBlur` prop');

	wrapper.instance().handleBlur();

	t.is(onBlur.callCount, 1, 'should call the `onBlur` prop when executing the instances handleBlur() method');
	t.is(onBlur.args[0][0], 'foo-id', 'should call the `onBlur` prop with the passed `id` prop as its first argument');
});
