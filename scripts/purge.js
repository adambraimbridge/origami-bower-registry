#!/usr/bin/env node

'use strict';

require('dotenv').config({
	silent: true
});

const FASTLY_API_KEY = process.env.FASTLY_API_KEY;
const DRY_RUN = process.env.DRY_RUN;

if (!FASTLY_API_KEY) {
	console.error('In order to purge assets from Fastly, you need to have set the environment variable "FASTLY_API_KEY". This can be done by creating a file named ".env" in the root of this repository with the contents "FASTLY_API_KEY=XXXXXX", where XXXXXX is your Fastly API key.');
	process.exit(1);
}

const hostname = 'https://origami-bower-registry.ft.com';

const paths = [
	'/',
	'/__about'
];

const endpoints = paths.map(path => hostname + path);

if (!DRY_RUN) {
	const request = require('request-promise-native');
	Promise.all(endpoints.map(endpoint => {
		return request({
			uri: endpoint,
			method: 'PURGE',
			headers: {
				'Fastly-Key': process.env.FASTLY_API_KEY,
				'Fastly-Soft-Purge': 1
			},
			simple: false,
			resolveWithFullResponse: true
		})
		.then(function(response) {
			if (response.statusCode <= 400) {
				console.log(`Purged ${endpoint}`);
			} else if (response.statusCode === 401) {
				throw Error('It seems you may not be authorised to purge the resources. Have you set the environment variable "FASTLY_API_KEY"?');
			}
		});
	}))
	.then(() => console.log('\nPurged all endpoints successfully.'))
	.catch((e) => console.error(`Failed to purge endpoints. ${e}`));
} else {
	console.log('\nThis is a dry run. No assets were purged from the cache.\n');
	console.log('If this were not a dry run, these are the assets which would have been purged from the cache:\n');
	endpoints.forEach(console.log);
}
