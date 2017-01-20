import React, {PropTypes} from 'react';
import {Component as NoopComponent} from './_lib/stubs.js';

const FormSection = ({Component, ...rest}) => <Component {...rest}/>;
FormSection.propTypes = {
	Component: PropTypes.func.isRequired,
	children: PropTypes.node.isRequired
};
FormSection.defaultProps = {
	Component: NoopComponent
};

export default FormSection;
