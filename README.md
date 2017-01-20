# react-ux-forms
[![Build Status](https://travis-ci.org/Inkdpixels/react-ux-forms.svg?branch=master)](https://travis-ci.org/Inkdpixels/react-ux-forms)
[![Dependency Status](https://dependencyci.com/github/Inkdpixels/react-ux-forms/badge)](https://dependencyci.com/github/Inkdpixels/react-ux-forms)

> react-ux-forms is a style and component agnostic <Form/> React.Component which handles the user feedback and validation in a UX oriented, less disturbing way.

## Why would you even bother reading this `README.md` further?
#### react-ux-forms starts with the basic features you need:
* It's style agnostic from the ground up, meaning that you can use your own components for inputs, buttons and sections of the Form.
* It's validation approach is tested in many projects and turned out the be the less frustrating one for users.
* Validators are configured in the same structure as you might know it from the webpack@2 `rules` config property.
* Form actions (buttons) are simple to configure and come with predefined behavior to avoid form submissions with fatal validation errors.
* Basic feedback props like `onChange` and `onSubmit`.

#### it also supports many advanced features:
* Smooth integration with state containers such as `redux`.
* Advanced callback props for several internal events such as `onValidate`, `onInValidate` and `onSubmitFailed`.
* You can add `n` rules to each property of the Form and even introduce your own `types` / `severity`.
* You decide the priority of each rule based on the index in the `rules` array.
* Each rule can be triggered by either a `Function` or a `RegExp`.
* Extendable in every way - Props on React elements and properties of each rule get propagated to the Components you specify via the `props` of the `<Form/>` Component.



## Installation
```
# fancy-pantsy yarn
yarn add react-ux-forms

# or npm
npm i -S react-ux-forms
```



## Examples
The following example is a simple single-column form with a custom `TextInput`, `Button` and `ValidationMessage` component.
For the full example and even more advanced ones, checkout the `examples/` folder.

Don't miss out on the API description further down below!

```js
import React from 'react';
import Form from 'react-ux-forms';

export default props => {
	const {values, properties, onSubmit, onChange} = this.props;

	return (
		<Form
			ActionComponent={MyButton}
			ValidationMessageComponent={MyValidationMessage}

			actions={myActions}
			rulesById={myRulesByPropertyId}
			valuesById={values}

			onChange={onChange}
			onSubmit={onSubmit}
			>
			{properties.map((props, i) => (
				<Form.Item
					{...props}
					key={i}
					value={values[props.id]}
					/>
			))}
		</Form>
	);
};
```



## API
#### `<Form/>`
##### `props.ActionComponent`
The Component that gets rendered for each `action` below the `<form/>`. The component recieves the full action object as it's props, so you are free to extend it at any point.
The only restriction is that you have to provide a `type` which equals either `submit`, `reset` or `button`, this is not only reasonable for semantics, but is also a pointer for the `<Form/>`
to attach a predefined `onClick` handler to it.

Actions of type `submit` will trigger the `onSubmit` prop of the `<Form/>` only after a full validation for all `rules` was executed and if no `rule` with the `severity` `error` is passing its `test`.
Actions of type `reset` will trigger the `onChange` prop of the `<Form/>` for each key of the `valuesById` prop with an second argument of `undefined`.

##### `props.ValidationMessageComponent`
The React.Component that gets rendered for each validation message. The component recieves the full object of the passing rule, except for the `test`, since we haven't found a usecase for it in the `ValidationMessageComponent` as of now - Wanna change that? Open a issue and lets talk about it :)

The `ValidationMessageComponent` also recieves an `isValid` prop, on which you can decide to render it if it equals `false` or hide it / return null if it equals `true`.

##### `props.actions`
You can define `n` actions, as described on top, all properties get forwarded to the `ActionComponent`.
An example would be:

```js
const actions = [{
	type: 'submit',
	children: 'You better submit dat form'
}];
```

##### `props.rulesById`
The rules for each property of your form referenced by it's `id`. The structure is inspired by the webpack@2 configuration, since most React developers should be familiar with it.
A rule gets triggered/activated if either it's `test` property that can be a `Function` or `RegExp` returns a truthy value, or if the rule object contains a truthy `forced` property.
An example would be:

```js
const rulesByPropertyId = {
	email: [{
		test: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		message: 'Awesome, you have entered a valid email address.',
		severity: 'success'
	}]
};
```

##### `props.valuesById`
The values for each property of your form referenced by it's `id`.
An example would be:

```js
const valuesById = {
	email: 'foo@bar.com'
};
```

##### `props.onValidate`
A handler that gets called once a property got succcessfully validated (Meaning that no rule with the `severity` of `error` is triggered). It's getting called with the `id` of the validated property.

##### `props.onInValidate`
A handler that gets called once a property failed the validation (Meaning that at least one rule with the `severity` of `error` is triggered). It's getting called with the `id` of the invalid property.

##### `props.onChange`
A handler that gets called after your target component triggers the `onChange` prop and the validation was executed.

##### `props.onSubmit`
A handler that gets called after the user clicked on an action component with a type of `submit` and the validation succeeded.

##### `props.onSubmitFailed`
A handler that gets called after the user clicked on an action component with a type of `submit` and the validation failed. It's only argument is the internal `validationResultsById` object, on which you can render additional warnings if you want to.

##### `props.itemWrapperProps`
An optional props object that gets forwarded to each wrapping `<div/>` of a `<Form.Item/>`.

##### `props.actionsWrapperProps`
An optional props object that gets forwarded to the wrapping `<div/>` of all form actions. Defaults to `{style: {textAlign: 'right'}}`.

##### `props.onChangeValidationIds`
If your `<Form.Item/>` target component does not support the `onBlur` prop (e.g. CheckBoxes), or if you want to display the validations as soon as the user changes a value even initially,
pass in an array of ID's as this prop.

##### `props.children`
The React elements that get recursively traversed and rendered. Note that you should keep the depth as small as possible to avoid performance problems, we do NOT use the `cloneElement()` API of React but we still want you to keep it in mind that there might be performance implications for really large forms. If you expirience such issues, please submit an issue or PR so that we can work on it and improve this world for the better.


#### `<Form.Item/>`
The `<Form.Item/>` component is the second pillar of this package. Use it to express your form items, note that props like `onChange` and `onBlur` are overridden internally, use the `onChange` on the `<Form/>` instead.

##### `props.Component`
The component that gets rendered, add any additional prop to the `<Form.Item/>` gets propagated to the specified component.

##### `props.id`
The identifier under which the `<Form/>` will lookup the `value` and `rules`.


#### `<Form.Section/>`
Use the `<Form.Section/>` component if you want to structure your Form using grids or boxes, note that this component will just render your specified Component, no additional HTML.
We introduced this component to keep the recursive lookup for `<Form.Item/>`'s as small as possible.

##### `props.Component`
The component that gets rendered, add any additional prop to the `<Form.Item/>` gets propagated to the specified component.



## Contributing
#### Releases
Releases are automatically triggered by each CI build depending on the commit message. Take a look at https://github.com/Inkdpixels/commit-analyzer for a full list of commit tags and the corresponding release type.

## License
MIT - See the current `LICENSE.md`.
