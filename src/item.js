import React, {PureComponent, PropTypes} from 'react';
import {fn as noopFn} from './_lib/stubs.js';

class FormItem extends PureComponent {
	static propTypes = {
		/**
		 * The React.Component that should be used to render the input.
		 */
		Component: PropTypes.func.isRequired,

		/**
		 * The ID of the input, used to reference the rules and it's value from the parent <Form/>.
		 */
		id: PropTypes.string.isRequired,

		/**
		 * Handlers that get passed from the <Form/> container.
		 */
		onChange: PropTypes.func.isRequired,
		onBlur: PropTypes.func.isRequired,

		/**
		 * A boolean that gets passed from the <Form/> container which indicates if the current validation is fatal / an error or not.
		 */
		isValidationResultFatal: PropTypes.bool.isRequired,
		invalidPropName: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.oneOf([false, null, undefined])
		])
	};

	static defaultProps = {
		isValidationResultFatal: false,
		invalidPropName: 'isInvalid',
		onChange: noopFn,
		onBlur: noopFn
	};

	constructor(props) {
		super(props);

		this.handleChange = val => this.props.onChange(this.props.id, val);
		this.handleBlur = () => this.props.onBlur(this.props.id);
	}

	render() {
		const {Component, isValidationResultFatal, invalidPropName, ...rest} = this.props;

		//
		// ToDo Not sure if that mutation is a good idea, well, we'll find out I guess.
		//
		if (invalidPropName && invalidPropName.length) {
			rest[invalidPropName] = isValidationResultFatal;
		}

		return (
			<Component
				{...rest}
				onChange={this.handleChange}
				onBlur={this.handleBlur}
				/>
		);
	}
}

export default FormItem;
