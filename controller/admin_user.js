'use strict';

var merge = require('utils-merge'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	logger,
	Contenttype,
	Collection,
	Compilation,
	Item,
	User,
	controllerOptions,
	adminPath,
	adminExtSettings;

/**
 * shows list of users page
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var users_index = function (req, res) {
	var viewtemplate = {
			viewname: 'p-admin/users/index',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = merge(req.controllerData, {
			pagedata: {
				title: 'Users',
				toplink: '&raquo; Users',
				extensions: CoreUtilities.getAdminMenu()
			},
			user: req.user
		});
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

/**
 * shows user profile page
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var users_show = function (req, res) {
	var allow_edit = false,
		username_display = req.controllerData.user.username || req.controllerData.user.email || req.controllerData.user._id,
		params = req.params;

	if (params.id === req.user.username) {
		logger.silly('asyncadmin - users_show: logged in user matches username');
		allow_edit = true;
	}
	else if (req.user.usertype === 'admin') {
		logger.silly('asyncadmin - users_show: user is admin');
		allow_edit = true;
	}
	else if (User.hasPrivilege(req.user, 750)) {
		logger.silly('asyncadmin - users_show: has edit user privilege');
		allow_edit = true;
	}
	else {
		logger.silly('asyncadmin - users_show: no access');
	}

	if (allow_edit) {
		var viewtemplate = {
				viewname: 'p-admin/users/show',
				themefileext: appSettings.templatefileextension,
				extname: 'periodicjs.ext.asyncadmin'
			},
			viewdata = {
				pagedata: {
					title: 'User profile (' + username_display + ')',
					toplink: '&raquo; <a href="/' + adminPath + '/users" class="async-admin-ajax-link">Users</a> &raquo; ' + username_display,
					// headerjs: ['/extensions/periodicjs.ext.admin/js/userprofile.min.js'],
					extensions: CoreUtilities.getAdminMenu()
				},
				userprofile: req.controllerData.user,
				allow_edit: allow_edit,
				user: req.user
			};
		CoreController.renderView(req, res, viewtemplate, viewdata);
	}
	else {
		res.status(401);
		CoreController.handleDocumentQueryErrorResponse({
			err: new Error('EXT-UAC760: You don\'t have access to modify content'),
			res: res,
			req: req
		});
	}

};

/**
 * create a new user page
 * @param  {object} req
 * @param  {object} res
 * @return {object} reponds with an error page or sends user to authenicated in resource
 */
var users_new = function (req, res) {

	var allow_edit = false,
		viewtemplate = {
			viewname: 'p-admin/users/new',
			themefileext: appSettings.templatefileextension,
			extname: 'periodicjs.ext.asyncadmin'
		},
		viewdata = {
			pagedata: {
				title: 'Create User Account',
				toplink: '&raquo; <a href="/' + adminPath + '/users" class="async-admin-ajax-link">Users</a> &raquo; Create a new user',
				// headerjs: ['/extensions/periodicjs.ext.admin/js/userprofile.min.js'],
				extensions: CoreUtilities.getAdminMenu()
			},
			userprofile: null,
			allow_edit: allow_edit,
			user: req.user
		};

	if (req.user.usertype === 'admin') {
		logger.silly('asyncadmin - users_show: user is admin');
		allow_edit = true;
	}
	else if (User.hasPrivilege(req.user, 750)) {
		logger.silly('asyncadmin - users_show: has edit user privilege');
		allow_edit = true;
	}
	else {
		logger.silly('asyncadmin - users_show: no access');
	}

	if (allow_edit) {
		CoreController.renderView(req, res, viewtemplate, viewdata);
	}
	else {
		res.status(401);
		CoreController.handleDocumentQueryErrorResponse({
			err: new Error('EXT-UAC750: You don\'t have access to create content'),
			res: res,
			req: req
		});
	}
};

/**
 * make sure a user is authenticated, if not logged in, send them to login page and return them to original resource after login
 * @param  {object} req
 * @param  {object} res
 * @return {Function} next() callback
 */
var users_edit = function (req, res) {
	var allow_edit = false,
		username_display = req.controllerData.user.username || req.controllerData.user.email || req.controllerData.user._id,
		params = req.params;

	if (params.id === req.user.username) {
		logger.silly('asyncadmin - users_show: logged in user matches username');
		allow_edit = true;
	}
	else if (req.user.usertype === 'admin') {
		logger.silly('asyncadmin - users_show: user is admin');
		allow_edit = true;
	}
	else if (User.hasPrivilege(req.user, 750)) {
		logger.silly('asyncadmin - users_show: has edit user privilege');
		allow_edit = true;
	}
	else {
		logger.silly('asyncadmin - users_show: no access');
	}

	if (allow_edit) {
		var viewtemplate = {
				viewname: 'p-admin/users/edit',
				themefileext: appSettings.templatefileextension,
				extname: 'periodicjs.ext.asyncadmin'
			},
			viewdata = {
				pagedata: {
					title: 'Edit ' + username_display,
					toplink: '&raquo; <a href="/' + adminPath + '/users" class="async-admin-ajax-link">Users</a> &raquo; ' + username_display,
					// headerjs: ['/extensions/periodicjs.ext.admin/js/userprofile.min.js'],
					extensions: CoreUtilities.getAdminMenu()
				},
				userprofile: req.controllerData.user,
				allow_edit: allow_edit,
				user: req.user
			};
		CoreController.renderView(req, res, viewtemplate, viewdata);
	}
	else {
		res.status(401);
		CoreController.handleDocumentQueryErrorResponse({
			err: new Error('EXT-UAC760: You don\'t have access to modify content'),
			res: res,
			req: req
		});
	}

};

// 
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
	Collection = mongoose.model('Collection');
	Compilation = mongoose.model('Compilation');
	Contenttype = mongoose.model('Contenttype');
	Item = mongoose.model('Item');
	User = mongoose.model('User');
	controllerOptions = resources.app.controller.native.ControllerSettings;
	// AppDBSetting = mongoose.model('Setting');
	// var appenvironment = appSettings.application.environment;
	adminExtSettings = resources.app.controller.extension.asyncadmin.adminExtSettings;
	adminPath = resources.app.locals.adminPath;

	return {
		users_index: users_index,
		users_edit: users_edit,
		users_show: users_show,
		users_new: users_new,
		// usersearch: usersearch
	};
};

module.exports = controller;
