import React, {Component, PropTypes} from 'react';
import omit from 'lodash/omit';
import {validator, severitiesByKey} from './_lib/validator.js';
import {fn as noopFn} from './_lib/stubs.js';
import Item from './item';
import Section from './section';

/**
* A UX oriented <Form/> API Component for React with no restrictions to stylings or custom components.
*/
class Form extends Component {
	static severitiesByKey = severitiesByKey;
	static validator = validator;

	static propTypes = {
		/**
		 * The React.Component to use when rendering the actions array.
		 */
		ActionComponent: PropTypes.func.isRequired,

		/**
		 * The React.Component to use when rendering an active validation message.
		 */
		ValidationMessageComponent: PropTypes.func.isRequired,

		/**
		 * An array containing objects which represent the action buttons to be
		 * displayed on the bottom right corner of the `Form`.
		 *
		 * An action object is required to have a valid HTML5 type, and the
		 * remaining key/values will be propagated to the `Button` component as props.
		 */
		actions: PropTypes.arrayOf(PropTypes.shape({
			type: PropTypes.oneOf(['submit', 'reset', 'button']).isRequired
		})),

		/**
		 * If you want to render additional messages for each Form.Input based on it's current
		 * value, pass in an object with the ID of the target input as a key and a the array of rules.
		 */
		rulesById: PropTypes.shape({
			exampleRules: PropTypes.arrayOf(
				PropTypes.shape({
					/**
					 * The validation test, if its result or itself is `true`, the validation will not pass.
					 * It can be either a function, that gets passed the to be validated value, a boolean to
					 * force a validation to fail from the outside, or a RegExp which will be used to test the value.
					 */
					test: PropTypes.oneOfType([
						PropTypes.func,
						PropTypes.bool,
						PropTypes.instanceOf(RegExp)
					]).isRequired,

					/**
					 * The severity / significance of the validation, falls back to `error` if it was not passed.
					 */
					severity: PropTypes.oneOf(Object.values(severitiesByKey))
				})
			)
		}),

		/**
		 * The values of all inputs referenced by their id's.
		 */
		valuesById: PropTypes.object,

		/**
		 * An optional handler that gets called once all inputs value does not
		 * trigger any rules with the severity of `error`.
		 */
		onValidate: PropTypes.func,

		/**
		 * An optional handler that gets called once an inputs value triggers the
		 * rendering of an rule with the severity of `error`.
		 */
		onInValidate: PropTypes.func,

		/**
		 * An handler that gets called once an inputs value changes.
		 */
		onChange: PropTypes.func,

		/**
		 * An handler that gets called once the user clicks on the first action with the type `submit`,
		 * it will only execute if the validation of all inputs succeeds.
		 */
		onSubmit: PropTypes.func,

		/**
		 * An handler that gets called once the user clicks on the first action with the type `submit`,
		 * it will only execute if one of the validations throwed an error with the severity `error`.
		 */
		onSubmitFailed: PropTypes.func,

		/**
		 * If you want to attach additional props to the wrapping <div/> of an Form.Item, pass in this prop.
		 */
		itemWrapperProps: PropTypes.object,

		/**
		 * If you want to attach additional props to the wrapping <div/> of all rendered actions, pass in this prop.
		 */
		actionsWrapperProps: PropTypes.object,

		/**
		 * If your editor does not support the onBlur prop, and you want to validate every time the `onChange` handler fires,
		 * add the associated id to this array.
		 */
		onChangeValidationIds: PropTypes.array,

		children: PropTypes.node.isRequired
	};

	static defaultProps = {
		actions: [],
		rulesById: {},
		valuesById: {},
		itemWrapperProps: {},
		onChangeValidationIds: [],
		actionsWrapperProps: {style: {textAlign: 'right'}},
		onValidate: noopFn,
		onInValidate: noopFn,
		onChange: noopFn,
		onSubmit: noopFn,
		onSubmitFailed: noopFn
	};

	constructor(props) {
		super(props);

		this.state = {
			validatableIds: [],
			validationResultsById: {}
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleReset = this.handleReset.bind(this);
	}

	render() {
		const {children, actions, actionsWrapperProps, ...restProps} = this.props;
		const rest = omit(restProps, [
			'ActionComponent',
			'ValidationMessageComponent',
			'rulesById',
			'valuesById',
			'itemWrapperProps',
			'onChangeValidationIds',
			'onValidate',
			'onInValidate',
			'onChange',
			'onSubmitFailed',
			'onSubmit'
		]);

		return (
			<form {...rest}>
				{this.renderChildren(children)}

				<div {...actionsWrapperProps}>
					{this.renderActions(actions)}
				</div>
			</form>
		);
	}

	renderChildren(children) {
		return React.Children.map(children, (child, index) => {
			if (!child) {
				return child;
			}

			switch (child.type) {
				case Section: {
					const {children, Component, ...rest} = child.props;

					return (
						<Component {...rest}>
							{this.renderChildren(children)}
						</Component>
					);
				}
				case Item:
					return this.renderFormItem(child, index);
				default:
					return child;
			}
		});
	}

	renderFormItem(child, index) {
		const {id} = child.props;
		const {ValidationMessageComponent, itemWrapperProps} = this.props;
		const validationResult = this.state.validationResultsById[id] || {};
		const isValidationResultFatal = this.isValidationResultFatal(validationResult);

		return (
			<div {...itemWrapperProps}>
				<Item
					{...child.props}
					key={index}
					isValidationResultFatal={isValidationResultFatal}
					onChange={this.handleChange}
					onBlur={this.handleBlur}
					/>
				<ValidationMessageComponent {...validationResult}/>
			</div>
		);
	}

	renderActions(actions) {
		const {ActionComponent} = this.props;

		return actions.map((action, index) => {
			const {type, children, ...rest} = action;
			let onClick = rest.onClick;

			if (type === 'submit') {
				onClick = this.handleSubmit;
			}
			if (type === 'reset') {
				onClick = this.handleReset;
			}

			return (
				<ActionComponent
					{...rest}
					key={index}
					type={type}
					onClick={onClick}
					>
					{children}
				</ActionComponent>
			);
		});
	}

	isIdValidatable(id) {
		return this.state.validatableIds.includes(id) || this.props.onChangeValidationIds.includes(id);
	}

	isValidationResultFatal(result) {
		const {isValid, severity} = result;

		return isValid === false && severity === severitiesByKey.error;
	}

	validateIdAndValuePair(id, value) {
		const validationResult = validator({
			rules: this.props.rulesById[id],
			value
		});
		const isValidationResultFatal = this.isValidationResultFatal(validationResult);

		return new Promise((resolve, reject) => {
			this.setState(prevState => ({
				validationResultsById: Object.assign(
					{},
					prevState.validationResultsById,
					{
						[id]: validationResult
					}
				)
			}), () => {
				if (isValidationResultFatal) {
					reject(validationResult);
				} else {
					resolve();
				}
			});
		});
	}

	validateAll() {
		const {rulesById, valuesById} = this.props;
		const ids = Object.keys(rulesById);

		return Promise.all(
			ids.map(id => this.validateIdAndValuePair(id, valuesById[id]))
		);
	}

	handleChange(id, value) {
		const {
			onChange,
			onValidate,
			onInValidate
		} = this.props;

		//
		// If the `id` is validatable (blurred once), we need to cater the `onInValidate` and
		// `onValidate` props before firing the `onChange` handler.
		//
		if (this.isIdValidatable(id)) {
			return this.validateIdAndValuePair(id, value)
				.then(() => {
					onValidate(id);
					onChange(id, value);
				})
				.catch(() => {
					onInValidate(id);
					onChange(id, value);
				});
		}

		onChange(id, value);

		return Promise.resolve();
	}

	handleBlur(id) {
		//
		// Prevent duplicate id's in the `validatableIds` array.
		//
		if (this.isIdValidatable(id)) {
			return;
		}

		//
		// If the `id` is getting blurred for the first time, add id to
		// the `validatableIds` array and afterwards validate it initially.
		//
		this.setState({
			validatableIds: this.state.validatableIds.concat([id])
		}, () => {
			this.handleChange(id, this.props.valuesById[id]);
		});
	}

	handleSubmit(e) {
		const {onSubmit, onSubmitFailed, valuesById} = this.props;

		e.preventDefault();

		return this.validateAll().then(() => {
			onSubmit(valuesById);
		}).catch(() => {
			onSubmitFailed(this.state.validationResultsById);
		});
	}

	handleReset(e) {
		const {valuesById} = this.props;
		e.preventDefault();

		Object.keys(valuesById).forEach(id => this.handleChange(id));
	}
}

export default Form;
