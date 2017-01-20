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

		onChange: PropTypes.func.isRequired,
		onBlur: PropTypes.func.isRequired
	};

	static defaultProps = {
		onChange: noopFn,
		onBlur: noopFn
	};

	constructor(props) {
		super(props);

		this.handleChange = val => this.props.onChange(this.props.id, val);
		this.handleBlur = () => this.props.onBlur(this.props.id);
	}

	render() {
		const {Component, ...rest} = this.props;

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
