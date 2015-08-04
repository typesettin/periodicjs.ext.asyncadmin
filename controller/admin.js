'use strict';

var async = require('async'),
	path = require('path'),
	marked = require('marked'),
	fs = require('fs-extra'),
	CoreExtension,
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	logger,
	// configError,
	Contenttype,
	Collection,
	Compilation,
	Item,
	User,
	adminExtSettings,
	loginSettings;

var admin_index = function (req, res) {
	// console.log('req._parsedUrl.pathname === \'/\'',)
	// console.log('adminExtSettings',adminExtSettings);
	if (adminExtSettings.settings.adminIndexRedirectPath && adminExtSettings.settings.adminIndexRedirectPath !== 'dashboard' && req._parsedUrl.pathname === '/') {
		res.redirect(path.join(adminExtSettings.settings.adminPath, adminExtSettings.settings.adminIndexRedirectPath));
	}
	else {
		var viewtemplate = {
				viewname: 'p-admin/home/index',
				themefileext: appSettings.templatefileextension,
				extname: 'periodicjs.ext.asyncadmin'
			},
			viewdata = {
				pagedata: {
					title: 'Admin',
					toplink: '&raquo; Home',
					extensions: CoreUtilities.getAdminMenu()
				},
				markdownpages: req.controllerData.markdownpages,
				contentcounts: req.controllerData.contentcounts,
				user: req.user
			};
		CoreController.renderView(req, res, viewtemplate, viewdata);
	}
};

/**
 * load the markdown release data
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var getMarkdownReleases = function (req, res, next) {
	var markdownpages = [],
		markdownfiles = [];
	req.controllerData = (req.controllerData) ? req.controllerData : {};

	fs.readdir(path.join(process.cwd(), 'releases'), function (err, files) {
		if (err) {
			logger.error(err);
			req.controllerData.markdownpages = markdownpages;
			next();
		}
		else {
			if (files.length > 0) {
				files.reverse();
				// console.log('files', files);
				markdownfiles = files.slice(0, 9);
			}
			async.eachSeries(
				markdownfiles,
				function (file, cb) {
					fs.readFile(path.join(process.cwd(), 'releases', file), 'utf8', function (err, data) {
						markdownpages.push(marked(data));
						cb(err);
						// console.log(data); //hello!
					});
				},
				function (err) {
					if (err) {
						logger.error(err);
					}
					req.controllerData.markdownpages = markdownpages;
					next();
				});
		}
	});
};

/**
 * does a query to get content counts for all content types
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var getHomepageStats = function (req, res, next) {
	req.controllerData = (req.controllerData) ? req.controllerData : {};

	async.parallel({
		extensionsCount: function (cb) {
			CoreExtension.getExtensions({
					periodicsettings: appSettings
				},
				function (err, extensions) {
					if (err) {
						cb(err, null);
					}
					else {
						cb(null, extensions.length);
					}
				});

		},
		themesCount: function (cb) {
			var themedir = path.resolve(process.cwd(), 'content/themes/'),
				returnFiles = [];
			fs.readdir(themedir, function (err, files) {
				if (err) {
					cb(err, null);
				}
				else {
					if (files) {
						for (var x = 0; x < files.length; x++) {
							if (files[x].match('periodicjs.theme')) {
								returnFiles.push(files[x]);
							}
						}
					}
					cb(null, returnFiles.length);
				}
			});
		},
		itemsCount: function (cb) {
			Item.count({}, function (err, count) {
				cb(err, count);
			});
		},
		collectionsCount: function (cb) {
			Collection.count({}, function (err, count) {
				cb(err, count);
			});
		},
		assetsCount: function (cb) {
			mongoose.model('Asset').count({}, function (err, count) {
				cb(err, count);
			});
		},
		contenttypesCount: function (cb) {
			Contenttype.count({}, function (err, count) {
				cb(err, count);
			});
		},
		tagsCount: function (cb) {
			mongoose.model('Tag').count({}, function (err, count) {
				cb(err, count);
			});
		},
		categoriesCount: function (cb) {
			mongoose.model('Category').count({}, function (err, count) {
				cb(err, count);
			});
		},
		usersCount: function (cb) {
			User.count({}, function (err, count) {
				cb(err, count);
			});
		}
	}, function (err, results) {
		if (err) {
			logger.error(err);
		}
		// console.log('results', results);
		req.controllerData.contentcounts = results;
		next();
	});
};

var checkDeleteUser = function (req, res, next) {
	if ((req.user.activated || req.user.accounttype || req.user.userroles) && !User.hasPrivilege(req.user, 760)) {
		var err = new Error('EXT-UAC760: You don\'t have access to modify user access');
		next(err);
	}
	else {
		next();
	}
};

var checkUserValidation = function (req, res, next) {
	req.controllerData = (req.controllerData) ? req.controllerData : {};
	// console.log('loginSettings', loginSettings);
	req.controllerData.checkuservalidation = loginSettings.new_user_validation;
	req.controllerData.checkuservalidation.useComplexity = loginSettings.complexitySettings.useComplexity;
	req.controllerData.checkuservalidation.complexity = loginSettings.complexitySettings.settings.weak;
	next();
};

/**
 * application settings and theme settings page
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var settings_index = function (req, res) {
	var viewtemplate = {
			viewname: 'p-admin/settings/index',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = {
			pagedata: {
				title: 'Application Settings',
				toplink: '&raquo; Application Settings',
				// headerjs: ['/extensions/periodicjs.ext.admin/js/settings.min.js'],
				extensions: CoreUtilities.getAdminMenu()
			},
			themesettings: req.controllerData.themesettings,
			appsettings: req.controllerData.appsettings,
			config: req.controllerData.config,
			user: req.user
		};
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

/**
 * settings faq page
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var settings_faq = function (req, res) {
	var viewtemplate = {
			viewname: 'p-admin/settings/faq',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = {
			pagedata: {
				title: 'Application Quick Help',
				toplink: '&raquo; FAQ',
				// headerjs: ['/extensions/periodicjs.ext.admin/js/settings.min.js'],
				extensions: CoreUtilities.getAdminMenu()
			},
			user: req.user
		};
	CoreController.renderView(req, res, viewtemplate, viewdata);
};
/**
 * admin controller
 * @module authController
 * @{@link https://github.com/typesettin/periodic}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @requires module:periodicjs.core.utilities
 * @requires module:periodicjs.core.controller
 * @requires module:periodicjs.core.extensions
 * @param  {object} resources variable injection from current periodic instance with references to the active logger and mongo session
 * @return {object}          
 */
var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = resources.core.controller;
	CoreUtilities = resources.core.utilities;
	CoreExtension = resources.core.extension;
	Collection = mongoose.model('Collection');
	Compilation = mongoose.model('Compilation');
	Contenttype = mongoose.model('Contenttype');
	Item = mongoose.model('Item');
	User = mongoose.model('User');
	// AppDBSetting = mongoose.model('Setting');
	// var appenvironment = appSettings.application.environment;
	adminExtSettings = resources.app.controller.extension.asyncadmin.adminExtSettings;
	loginSettings = resources.app.controller.extension.login.loginExtSettings;

	return {
		admin_index: admin_index,
		settings_index: settings_index,
		settings_faq: settings_faq,
		getMarkdownReleases: getMarkdownReleases,
		getHomepageStats: getHomepageStats,
		adminExtSettings: adminExtSettings,
		checkDeleteUser: checkDeleteUser,
		checkUserValidation: checkUserValidation
	};
};

module.exports = controller;
