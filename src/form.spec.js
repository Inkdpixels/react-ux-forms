import test from 'ava';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import Form from './form';
import Section from './section';
import Item from './item';

const Component = props => <div {...props}/>;
const Input = props => <input type="text" {...props}/>;
const Button = props => <button {...props}/>;
const ValidationMessage = props => <button {...props}/>;
const actions = [{type: 'submit', children: 'Foo button label'}, {type: 'reset', children: 'Foo button label'}];
const createWrapper = (props = {}) => shallow(
	<Form
		ActionComponent={Button}
		ValidationMessageComponent={ValidationMessage}
		actions={actions}
		itemWrapperProps={{style: {marginBottom: '1.5rem'}}}
		{...props}
		>
		<Section Component={Component}>
			Foo bar
			<Item
				Component={Input}
				id="form-textinput-1"
				value={0}
				/>
			<Section Component={Component}>
				<Item
					Component={Input}
					id="form-textinput-2"
					value={4}
					/>
			</Section>
			<Item
				Component={Input}
				id="form-textinput-3"
				value={2}
				/>
		</Section>
	</Form>
);

test('<Form/>', t => {
	t.is(typeof Form, 'function');

	const wrapper = createWrapper({
		id: 'form-id-that-should-get-propagated'
	});

	t.is(wrapper.prop('id'), 'form-id-that-should-get-propagated', 'should propagate unknown props to the <form/> wrapper.');
	t.is(wrapper.find(Component).length, 2, 'should recursively search for <Form.Section/> components and render them with their associated `Component` prop.');
	t.true(wrapper.html().includes('Foo bar'), 'should be able to render raw contents.');

	t.is(wrapper.find(Item).length, 3, 'should recursively search for <Form.Item/> components and render wrap them in a `<div/>`.');
	t.is(wrapper.find(Item).at(0).prop('onChange'), wrapper.instance().handleChange, 'should override the `onChange` prop with the Forms handleChange() method for each rendered <Form.Item/> component.');
	t.is(wrapper.find(Item).at(0).prop('onBlur'), wrapper.instance().handleBlur, 'should override the `onBlur` prop with the Forms handleBlur() method for each rendered <Form.Item/> component.');
	t.is(wrapper.find(Item).at(0).prop('value'), 0, 'should propagate unknown props of each <Form.Item/> component to it.');
	t.is(wrapper.find(Item).at(1).prop('value'), 4, 'should propagate unknown props of each <Form.Item/> component to it.');

	t.is(wrapper.find(ValidationMessage).length, 3, 'should render a <ValidationMessageComponent/> for besides each <Form.Item/> component in its wrapping `<div/>`.');

	wrapper.setState({
		validationResultsById: {
			'form-textinput-1': {isValid: false, foo: 'bar', severity: 'error'},
			'form-textinput-2': {isValid: false, foo: 'baz', severity: 'info'}
		}
	});

	t.is(wrapper.find(Item).at(0).prop('isValidationResultFatal'), true, 'should propagate a truthy `isValidationResultFatal` prop to the <Form.Item/> if the validation result is fatal.');
	t.is(wrapper.find(Item).at(1).prop('isValidationResultFatal'), false, 'should propagate a falsy `isValidationResultFatal` prop to the <Form.Item/> if the validation result is not fatal.');

	t.is(wrapper.find(ValidationMessage).at(0).prop('foo'), 'bar', 'should propagate the validationResultsById object for the current <Form.Item/> component to its <ValidationMessageComponent/> component.');
	t.is(wrapper.find(ValidationMessage).at(1).prop('foo'), 'baz', 'should propagate the validationResultsById object for the current <Form.Item/> component to its <ValidationMessageComponent/> component.');

	t.is(wrapper.find(Button).length, 2, 'should render all passed actions with the props `ActionComponent`');
	t.is(wrapper.find(Button).at(0).prop('onClick'), wrapper.instance().handleSubmit, 'should override the onClick prop with the instances handleSubmit() method if it is of type `submit`');
	t.is(wrapper.find(Button).at(1).prop('onClick'), wrapper.instance().handleReset, 'should override the onClick prop with the instances handleSubmit() method if it is of type `reset`');
});

test('<Form/>().isIdValidatable()', t => {
	let wrapper = createWrapper();

	t.is(typeof wrapper.instance().isIdValidatable, 'function');
	t.false(wrapper.instance().isIdValidatable('foo'), 'should return `false` if the given id isnt in the states `validatableIds` array');

	wrapper.setState({
		validatableIds: ['foo', 'bar']
	});

	t.true(wrapper.instance().isIdValidatable('foo'), 'should return `true` if the given id is in the states `validatableIds` array');

	wrapper = createWrapper({onChangeValidationIds: ['bar']});

	t.true(wrapper.instance().isIdValidatable('bar'), 'should return `true` if the given id is in the props `onChangeValidationIds` array');
});

test('<Form/>().isValidationResultFatal()', t => {
	let wrapper = createWrapper();

	t.is(typeof wrapper.instance().isValidationResultFatal, 'function');
	t.false(wrapper.instance().isValidationResultFatal({isValid: true}), 'should return `false` if the given result.isValid property is truthy');
	t.false(wrapper.instance().isValidationResultFatal({isValid: false}), 'should return `false` if the given result.isValid property equals false but the severity does not equal "error"');
	t.true(wrapper.instance().isValidationResultFatal({isValid: false, severity: 'error'}), 'should return `true` if the given result.isValid property equals and the severity does equal "error"');
});

test('<Form/>().validateIdAndValuePair()', t => {
	let wrapper = createWrapper({
		rulesById: {
			foo: []
		},
		valuesById: {
			foo: 'bar'
		}
	});

	t.is(typeof wrapper.instance().validateIdAndValuePair, 'function');
	t.true(wrapper.instance().validateIdAndValuePair('foo', 'bar') instanceof Promise, 'should return a new Promise instance');
	t.deepEqual(wrapper.state('validationResultsById'), {foo: {isValid: true, message: null}}, 'should add the results to the states `validationResultsById`');

	wrapper = createWrapper({
		rulesById: {
			foo: [{
				test: val => val !== 'baz',
				severity: Form.severitiesByKey.error
			}]
		},
		valuesById: {
			foo: 'bar'
		}
	});

	t.throws(wrapper.instance().validateIdAndValuePair('foo', 'bar'), undefined, 'should reject if a rule validation has failed and the severity is of type `error`');

	wrapper = createWrapper({
		rulesById: {
			foo: [{
				test: val => val !== 'baz',
				severity: 'warning'
			}]
		},
		valuesById: {
			foo: 'bar'
		}
	});

	t.notThrows(wrapper.instance().validateIdAndValuePair('foo', 'bar'), 'should resolve if a rule validation has failed and but the severity is not of type `error`');
});

test('<Form/>().validateAll()', t => {
	let wrapper = createWrapper();

	t.is(typeof wrapper.instance().validateAll, 'function');
	t.true(wrapper.instance().validateAll() instanceof Promise, 'should return a new Promise instance');

	wrapper = createWrapper({
		rulesById: {
			foo: [{
				test: val => val !== 'baz',
				severity: 'warning'
			}]
		},
		valuesById: {
			foo: 'baz'
		}
	});

	return wrapper.instance().validateAll().then(() => {
		t.deepEqual(wrapper.state('validationResultsById'), {foo: {isValid: true, message: null}}, 'should resolve after all rules have been validated.');

		wrapper = createWrapper({
			rulesById: {
				foo: [{
					test: val => val !== 'baz',
					severity: 'warning'
				}],
				bar: [{
					test: val => val !== 'baz',
					severity: Form.severitiesByKey.error
				}]
			},
			valuesById: {
				foo: 'baz'
			}
		});

		t.throws(wrapper.instance().validateAll(), undefined, 'should reject if one of the rules has failed with an error');
	});
});

test('<Form/>().handleChange()', t => {
	let onChange = sinon.spy();
	let onValidate = sinon.spy();
	let onInValidate = sinon.spy();
	let wrapper = createWrapper({onChange, onValidate, onInValidate});

	t.is(typeof wrapper.instance().handleChange, 'function');

	wrapper.instance().handleChange('foo', 'bar');

	t.is(onChange.callCount, 1, 'should call the `onChange`');
	t.deepEqual(onChange.args[0], ['foo', 'bar'], 'should call the `onChange` and propagate the arguments.');
	t.is(onValidate.callCount, 0, 'should not call the `onValidate` if the given id is not within the states `validatableIds` array');
	t.is(onInValidate.callCount, 0, 'should not call the `onInValidate` if the given id is not within the states `validatableIds` array');

	onChange = sinon.spy();
	onValidate = sinon.spy();
	onInValidate = sinon.spy();
	wrapper = createWrapper({onChange, onValidate, onInValidate});
	wrapper.setState({validatableIds: ['foo']});

	return wrapper.instance().handleChange('foo', 'bar').then(() => {
		t.is(onChange.callCount, 1, 'should call the `onChange`');
		t.deepEqual(onChange.args[0], ['foo', 'bar'], 'should call the `onChange` and propagate the arguments.');
		t.is(onValidate.callCount, 1, 'should call the `onValidate` if the given id is within the states `validatableIds` array and the validation has succeeded');
		t.is(onValidate.args[0][0], 'foo', 'should call the `onValidate` with the validated id as its only argument');
		t.is(onInValidate.callCount, 0, 'should not call the `onInValidate` if the given id is within the states `validatableIds` array but the validation has succeeded');

		onChange = sinon.spy();
		onValidate = sinon.spy();
		onInValidate = sinon.spy();
		wrapper = createWrapper({
			onChange,
			onValidate,
			onInValidate,
			rulesById: {
				foo: [{
					test: val => val !== 'baz'
				}]
			}
		});
		wrapper.setState({validatableIds: ['foo']});

		return wrapper.instance().handleChange('foo', 'bar').then(() => {
			t.is(onChange.callCount, 1, 'should call the `onChange`');
			t.deepEqual(onChange.args[0], ['foo', 'bar'], 'should call the `onChange` and propagate the arguments.');
			t.is(onValidate.callCount, 0, 'should not call the `onValidate` if the given id is within the states `validatableIds` array and the validation has failed');
			t.is(onInValidate.callCount, 1, 'should call the `onInValidate` if the given id is within the states `validatableIds` array but the validation has failed');
			t.is(onInValidate.args[0][0], 'foo', 'should call the `onValidate` with the validated id as its only argument');
		});
	});
});

test('<Form/>().handleBlur()', t => {
	let wrapper = createWrapper();

	t.is(typeof wrapper.instance().validateAll, 'function');

	wrapper.setState({
		validatableIds: ['foo']
	});
	let state = wrapper.state();
	wrapper.instance().handleBlur('foo');

	t.is(wrapper.state(), state, 'should not mutate the state if the given id is already within the states `validatableIds` array');

	wrapper = createWrapper();
	const handleChange = sinon.stub(wrapper.instance(), 'handleChange');

	wrapper.setState({
		validatableIds: ['foo']
	});
	wrapper.instance().handleBlur('bar');

	t.true(wrapper.state().validatableIds.includes('bar'), 'should add the given id to the states `validatableIds` array if it is not already included');
	t.is(handleChange.callCount, 1, 'should call the instances handleChange() method if the given id is not already included in the states `validatableIds` array');
});

test('<Form/>().handleSubmit()', t => {
	let wrapper = createWrapper();

	t.is(typeof wrapper.instance().handleSubmit, 'function');
	t.true(wrapper.instance().handleSubmit({preventDefault: sinon.spy()}) instanceof Promise,
		'should return a new Promise instance'
	);

	let onSubmit = sinon.spy();
	let preventDefault = sinon.spy();
	wrapper = createWrapper({onSubmit});
	let validateAll = sinon.stub(wrapper.instance(), 'validateAll').returns(Promise.resolve());

	return wrapper.instance().handleSubmit({preventDefault}).then(() => {
		t.is(preventDefault.callCount, 1, 'should prevent the default behavior of the event.');
		t.is(validateAll.callCount, 1, 'should call the instances validateAll() method');
		t.is(onSubmit.callCount, 1, 'should execute the `onSubmit` prop if the validateAll() method resolves properly');

		let onSubmitFailed = sinon.spy();
		onSubmit = sinon.spy();
		wrapper = createWrapper({onSubmit, onSubmitFailed});
		validateAll.restore();
		validateAll = sinon.stub(wrapper.instance(), 'validateAll').returns(Promise.reject());

		return wrapper.instance().handleSubmit({preventDefault})
			.catch(() => {
				t.is(onSubmit.callCount, 0, 'should not execute the `onSubmit` prop if the validateAll() method rejects');
				t.is(onSubmitFailed.callCount, 1, 'should execute the `onSubmitFailed` prop if the validateAll() method rejects');
			});
	});
});

test('<Form/>().handleReset()', t => {
	let wrapper = createWrapper({
		valuesById: {
			foo: 'bar',
			bar: 'baz',
			qux: 'quax'
		}
	});
	let handleChange = sinon.stub(wrapper.instance(), 'handleChange');
	let preventDefault = sinon.spy();

	t.is(typeof wrapper.instance().handleReset, 'function');

	wrapper.instance().handleReset({preventDefault});

	t.is(preventDefault.callCount, 1, 'should prevent the default behavior for the passed event');
	t.is(handleChange.callCount, 3, 'should execute the instances handleChange() method for every property of the props `valuesById` object');
	t.deepEqual(handleChange.args, [['foo'], ['bar'], ['qux']], 'should execute the instances handleChange() method with the ids as the only argument');
});
