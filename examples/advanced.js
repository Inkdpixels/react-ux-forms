import React, {PureComponent} from 'react';
import ValidationMessage from './../_lib/inputValidator.js';
import TextInput from './../textInput/';
import Button from './../button/';
import Form from './index.js';

class ExampleForm extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			values: {
				'form-textinput-1': '',
				'form-textinput-2': ''
			}
		};
		this.handleChange = (id, value) =>
			this.setState({
				values: Object.assign(
					{},
					this.state.values,
					{
						[id]: value
					}
				)
			});
		this.handleSubmit = values => console.log('submit', values);
		this.handleSubmitFailed = validationResultsById => console.log('validation failed: ', validationResultsById);
		this.handleValidate = name => console.log(`${name} is successfully validated :)`);
		this.handleInValidate = name => console.log(`${name} is invalid :(`);
		this.actions = [{
			type: 'submit',
			children: 'My Submit label',
			isTiny: true
		}];

		this.rulesByName = {
			'form-textinput-1': [{
				test: val => val !== 'Bar',
				message: 'The message should equal "Bar"'
			}, {
				test: val => val === 'Bar',
				message: 'The message equals "Bar"',
				severity: 'success'
			}],
			'form-textinput-2': [{
				test: val => val.includes('@') === false,
				message: 'A valid E-Mail address needs at least an "@" character.'
			}, {
				test: val => val.includes('@'),
				message: 'This seems like a valid E-Mail address.',
				severity: 'success'
			}]
		};
	}

	render() {
		return (
			<Form
				ActionComponent={Button}
				ValidationMessageComponent={ValidationMessage}
				actions={this.actions}
				itemWrapperProps={{style: {marginBottom: '1.5rem'}}}

				rulesById={this.rulesByName}
				valuesById={this.state.values}

				onValidate={this.handleValidate}
				onInValidate={this.handleInValidate}
				onChange={this.handleChange}
				onSubmit={this.handleSubmit}
				onSubmitFailed={this.handleSubmitFailed}
				>
				<Form.Section>
					<Form.Item
						Component={TextInput}
						id="form-textinput-1"
						label="Name"
						value={this.state.values['form-textinput-1']}
						/>
					<Form.Item
						Component={TextInput}
						id="form-textinput-2"
						label="E-Mail"
						value={this.state.values['form-textinput-2']}
						/>
				</Form.Section>
			</Form>
		);
	}
}

export default ExampleForm;
