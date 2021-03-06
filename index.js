'use strict';

const dotenv = require('dotenv');
const service = require('./lib/service');
const throng = require('throng');

dotenv.config();

const options = {
	awsAccessKey: process.env.AWS_ACCESS_KEY,
	awsSecretKey: process.env.AWS_SECRET_KEY,
	defaultLayout: 'main',
	githubSecret: process.env.GITHUB_SECRET,
	githubToken: process.env.GITHUB_TOKEN,
	githubOrganisations: [
		'financial-times',
		'ftlabs'
	],
	privateRepoWhitelist: [
		'o-fonts-assets'
	],
	log: console,
	name: 'Origami Bower Registry',
	packageDataStore: process.env.PACKAGE_DATA_STORE || 'https://origami-bower-registry-data.ft.com/',
	s3Buckets: (process.env.S3_BUCKETS ? process.env.S3_BUCKETS.split(',') : []),
	workers: process.env.WEB_CONCURRENCY || 1
};

throng({
	workers: options.workers,
	start: startWorker
});

function startWorker(id) {
	console.log(`Started worker ${id}`);
	service(options).listen().catch(() => {
		process.exit(1);
	});
}
