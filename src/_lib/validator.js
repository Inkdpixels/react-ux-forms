const severitiesByKey = {
	error: 'error',
	warning: 'warning',
	info: 'info',
	success: 'success'
};
const validator = function (opts = {}) {
	const {
		rules = [],
		value
	} = opts;
	const results = {
		isValid: true,
		message: null
	};

	if (rules && rules.length) {
		const failedRule = rules.find(obj => {
			const {test, forced} = obj;

			if (forced === true) {
				return true;
			}

			if (typeof test === 'function') {
				return test(value);
			} else if (test) {
				return test.test(value);
			}

			return false;
		});

		if (failedRule) {
			results.isValid = false;
			results.message = failedRule.message;
			results.severity = failedRule.severity || severitiesByKey.error;
		}
	}

	return results;
};

export {
	severitiesByKey,
	validator
};
