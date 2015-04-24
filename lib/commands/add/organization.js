#!/usr/bin/env node

var _ = require('lodash');
var async = require('async');

var utils = require('../../utils');

var actions = utils.getActions();

function registerCommand(program) {
	program
		.command('organization [quantity]')
		.alias('o')
		.option('-p, --parentOrganizationId <integer>', 'The parent organization ID to add the organization to. Defaults to 0.', Number, 0)
		.description('Adds one or more organizations to the database.')
		.action(function(number) {
			number = !_.isNaN(Number(number)) ? Number(number) : 1;
			commands.addOrganization(number, this.parentOrganizationId);
		});

	return program;
}

function addOrganization(numberOfOrganizations, parentOrganizationId, callback) {
	var bar = utils.getProgressBar(numberOfOrganizations);
	var organizations = [];

	utils.statusMessage(numberOfOrganizations, 'organization');

	async.timesSeries(
		numberOfOrganizations,
		function(n, asyncCallback) {
			var organizationName = utils.generateOrganizationName();

			actions.addOrganization(
				organizationName,
				function(error, response) {
					if (!error) {
						bar.tick();
						asyncCallback(null, response);
					}
				}
			);
		},
		function(error, results) {
			if (!error) {
				for (var i = 0, length = results.length; i < length; i++) {
					console.log('');
					console.log('New Organization:');
					utils.printJSON(JSON.parse(results[i]));
					console.log('');
				}

				console.log('Successfully added', + results.length + ' new organizations.');

				if (callback) {
					callback(null, results);
				}
			}
		}
	);

	return organizations;
}

module.exports.registerCommand = registerCommand;
module.exports.command = addOrganization;