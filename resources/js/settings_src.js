'use strict';

var jsonFormElements = require('./jsonformelements'),
	tabMap = {
		'0': 'application-settings',
		'1': 'theme-settings',
		'2': 'restart',
		'3': 'help'
	},
	themesettingsConfiguration,
	themesettingsReadOnly,
	appsettingsConfiguration,
	appsettingsReadOnly;

var handleSettingsTabChange = function (currentTab) {
	// console.log('currentTab', currentTab);
	window.location.hash = tabMap[currentTab];
	styleWindowResizeEventHandler();
};

var elementSelectors = function () {
	themesettingsConfiguration = document.getElementById('themesettings-config');
	themesettingsReadOnly = document.getElementById('themesettings-readonly');
	appsettingsConfiguration = document.getElementById('appsettings-config');
	appsettingsReadOnly = document.getElementById('appsettings-readonly');
};

var eventHandlers = function () {
	window.StylieTab['periodic-settings-tabs'].on('tabsShowIndex', handleSettingsTabChange);
	if (window.location.hash) {
		for (var x in tabMap) {
			if (window.location.hash.replace('#', '') === tabMap[x]) {
				window.StylieTab['periodic-settings-tabs'].showTab(x);
			}
		}
	}
};

/**
 * resize codemirror on window resize
 */
var styleWindowResizeEventHandler = function () {
	if (window.codeMirrors) {
		for (var y in window.codeMirrors) {
			window.codeMirrors[y].refresh();
			window.codeMirrors[y].setSize('auto', '80%');
		}
	}
};
// window.backupcompleted = function () {
// 	window.endPreloader();
// 	window.showStylieNotification({
// 		message: 'downloaded back up file'
// 	});
// };


var initAdvancedCodemirror = function () {
	if (window.StylieTab && window.StylieTab['periodic-settings-tabs-config']) {
		window.StylieTab['periodic-settings-tabs-config'].on('tabsShowIndex', function (idex) {
			if (idex === 0 && window.codeMirrors && window.codeMirrors['themesettings-codemirror']) {
				window.codeMirrors['themesettings-codemirror'].refresh();
			}
			else if (idex === 1 && window.codeMirrors && window.codeMirrors['globalconfig-codemirror']) {
				window.codeMirrors['globalconfig-codemirror'].refresh();
			}
			else if (idex === 2 && window.codeMirrors && window.codeMirrors['envconfig-codemirror']) {
				window.codeMirrors['envconfig-codemirror'].refresh();
			}
			else if (idex === 3 && window.codeMirrors && window.codeMirrors['defaultconfig-codemirror']) {
				window.codeMirrors['defaultconfig-codemirror'].refresh();
			}
		});
	}
};

var init = function () {
	elementSelectors();
	eventHandlers();

	if (window.appsettings) {
		appsettingsConfiguration.innerHTML = jsonFormElements({
			jsonobject: window.appsettings.configuration,
			idnameprepend: 'asc'
		});
		// appsettingsReadOnly.innerHTML = jsonFormElements({
		// 	jsonobject: window.appsettings.readonly,
		// 	readonly: true,
		// 	idnameprepend: 'asro'
		// });
	}
	if (window.themesettings) {

		// themesettingsConfiguration.innerHTML = jsonFormElements({
		// 	jsonobject: window.themesettings.configuration,
		// 	idnameprepend: 'tsc'
		// });
		themesettingsReadOnly.innerHTML = jsonFormElements({
			jsonobject: window.themesettings.readonly,
			readonly: true,
			idnameprepend: 'tsro'
		});
	}
	initAdvancedCodemirror();
	styleWindowResizeEventHandler();

};

if (typeof window.domLoadEventFired !== 'undefined') {
	init();
}
else {
	window.addEventListener('load', init, false);
}
