/**
 * This example which will render a simple one-column form.
 */
import React from 'react';
import Form from 'react-ux-forms';
import ValidationMessage from './../validationMessage/';
import TextInput from './../textInput/';
import Button from './../button/';

const actions = [{
	type: 'submit',
	children: 'My Submit label'
}];
const rulesByPropertyId = {
	foo: [{
		test: val => val !== 'Foo',
		message: 'The message should equal "Foo"'
	}, {
		test: val => val === 'Foo',
		message: 'Awesome! The message equals "Foo"',
		severity: 'success'
	}],
	bar: [{
		test: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		message: 'Awesome, you have entered a valid email address.',
		severity: 'success'
	}]
};
const properties = [
	{id: 'foo', label: 'Foo', Component: TextInput},
	{id: 'bar', label: 'Bar', Component: TextInput}
];

export default props => {
	const {values, onSubmit, onChange} = props;

	return (
		<Form
			ActionComponent={Button}
			ValidationMessageComponent={ValidationMessage}

			actions={actions}
			rulesById={rulesByPropertyId}
			valuesById={values}

			onChange={onChange}
			onSubmit={onSubmit}
			>
			{properties.map((property, i) => (
				<Form.Item
					{...props}
					key={i}
					value={values[property.id]}
					/>
			))}
		</Form>
	);
};
