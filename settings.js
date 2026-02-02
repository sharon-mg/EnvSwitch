const DEFAULT_COLOR = '#11CCCA';

document.addEventListener('DOMContentLoaded', function () {
	loadMarkerSettings();
	displayEnvironments();
	setupRegexAutoPopulate();
});

// ==================== REGEX VALIDATION ====================

function isValidRegex(pattern) {
	if (!pattern) return true; // Empty is valid (will use subdomain)
	try {
		new RegExp(pattern);
		return true;
	} catch (e) {
		return false;
	}
}

function showRegexError(show) {
	const errorEl = document.getElementById('regex-error');
	const regexInput = document.getElementById('new-env-regex');
	errorEl.style.display = show ? 'block' : 'none';
	regexInput.classList.toggle('invalid', show);
}

function setupRegexAutoPopulate() {
	const subdomainInput = document.getElementById('new-env-subdomain');
	const regexInput = document.getElementById('new-env-regex');
	
	// Auto-populate regex with subdomain value when subdomain changes
	subdomainInput.addEventListener('input', function() {
		// Only auto-populate if regex field is empty or matches previous subdomain
		if (!regexInput.value || regexInput.dataset.autoPopulated === 'true') {
			regexInput.value = this.value;
			regexInput.dataset.autoPopulated = 'true';
		}
	});
	
	// Mark as manually edited when user types in regex field
	regexInput.addEventListener('input', function() {
		this.dataset.autoPopulated = 'false';
		showRegexError(!isValidRegex(this.value));
	});
}

// ==================== MARKER SETTINGS ====================

function loadMarkerSettings() {
	chrome.storage.sync.get(['markerSettings'], function(result) {
		const settings = result.markerSettings || {
			enabled: false,
			shape: 'ribbon',
			position: 'top-right',
			hoverOpacity: 20
		};
		
		document.getElementById('marker-enabled').checked = settings.enabled;
		document.getElementById('marker-shape').value = settings.shape;
		document.getElementById('marker-position').value = settings.position;
		document.getElementById('marker-hover-opacity').value = settings.hoverOpacity ?? 20;
		
		updateToggleStatus(settings.enabled);
		updateOpacityDisplay(settings.hoverOpacity ?? 20);
	});
}

function updateToggleStatus(enabled) {
	const statusEl = document.getElementById('toggle-status');
	statusEl.textContent = enabled ? 'ON' : 'OFF';
	statusEl.classList.toggle('active', enabled);
}

function updateOpacityDisplay(value) {
	document.getElementById('opacity-value').textContent = value + '%';
}

function saveMarkerSettings() {
	const enabled = document.getElementById('marker-enabled').checked;
	const settings = {
		enabled: enabled,
		shape: document.getElementById('marker-shape').value,
		position: document.getElementById('marker-position').value,
		hoverOpacity: parseInt(document.getElementById('marker-hover-opacity').value, 10)
	};
	
	updateToggleStatus(enabled);
	
	chrome.storage.sync.set({ markerSettings: settings }, function() {
		console.log('Marker settings saved:', settings);
	});
}

// Add event listeners for marker settings
document.getElementById('marker-enabled').addEventListener('change', saveMarkerSettings);
document.getElementById('marker-shape').addEventListener('change', saveMarkerSettings);
document.getElementById('marker-position').addEventListener('change', saveMarkerSettings);
document.getElementById('marker-hover-opacity').addEventListener('input', function() {
	updateOpacityDisplay(this.value);
});
document.getElementById('marker-hover-opacity').addEventListener('change', saveMarkerSettings);

// ==================== ENVIRONMENTS ====================

document.getElementById('save-env').addEventListener('click', () => {
	const newNameText = document.getElementById('new-env-name');
	const newSubdomainText = document.getElementById('new-env-subdomain');
	const newRegexText = document.getElementById('new-env-regex');
	const newColorInput = document.getElementById('new-env-color');
	
	if (newNameText.value && newSubdomainText.value) {
		// Validate regex before saving
		const regexValue = newRegexText.value || newSubdomainText.value;
		if (!isValidRegex(regexValue)) {
			showRegexError(true);
			alert('Please enter a valid regex pattern.');
			return;
		}
		
		chrome.storage.sync.get({ environments: [] }, (result) => {
			const environments = result.environments;
			environments.push({ 
				name: newNameText.value, 
				subdomain: newSubdomainText.value,
				regex: newRegexText.value || newSubdomainText.value,
				color: newColorInput.value || DEFAULT_COLOR
			});
			chrome.storage.sync.set({ environments }, () => {
				newNameText.value = '';
				newSubdomainText.value = '';
				newRegexText.value = '';
				newRegexText.dataset.autoPopulated = 'true';
				newColorInput.value = DEFAULT_COLOR;
				showRegexError(false);
				alert('Environment saved!');
				displayEnvironments();
			});
		});
	} else {
		alert('Please fill in both name and subdomain fields.');
	}
});

function displayEnvironments() {
	chrome.storage.sync.get(['environments'], function (result) {
		const environments = result.environments || [];
		const envList = document.getElementById('env-list');
		envList.innerHTML = '';
		
		environments.forEach((env, index) => {
			const envItem = document.createElement('div');
			envItem.className = 'env-item';
			
			// Color indicator
			const colorDot = document.createElement('div');
			colorDot.className = 'env-color';
			colorDot.style.backgroundColor = env.color || DEFAULT_COLOR;
			
			// Environment info container
			const envInfo = document.createElement('div');
			envInfo.className = 'env-info';
			
			// Name and subdomain line
			const nameSubdomain = document.createElement('span');
			nameSubdomain.className = 'env-name-subdomain';
			nameSubdomain.textContent = `${env.name}: ${env.subdomain}`;
			
			// Regex pattern display/edit
			const regexContainer = document.createElement('div');
			regexContainer.style.display = 'flex';
			regexContainer.style.alignItems = 'center';
			regexContainer.style.gap = '5px';
			
			const regexLabel = document.createElement('span');
			regexLabel.textContent = 'Pattern: ';
			regexLabel.style.fontSize = '12px';
			regexLabel.style.color = '#666';
			
			const regexInput = newRegexInput(index, env);
			
			regexContainer.appendChild(regexLabel);
			regexContainer.appendChild(regexInput);
			
			envInfo.appendChild(nameSubdomain);
			envInfo.appendChild(regexContainer);
			
			// Edit color button
			const editColorBtn = newEditColorButton(index, env);
			
			// Delete button
			const deleteButton = newDeleteButton(index);

			envItem.appendChild(colorDot);
			envItem.appendChild(envInfo);
			envItem.appendChild(editColorBtn);
			envItem.appendChild(deleteButton);
			envList.appendChild(envItem);
		});
	});
}

function newRegexInput(index, env) {
	const regexInput = document.createElement('input');
	regexInput.type = 'text';
	regexInput.value = env.regex || env.subdomain;
	regexInput.className = 'env-regex-input';
	regexInput.title = 'Regex pattern to match against hostname';
	regexInput.placeholder = env.subdomain;
	
	// Validate on input
	regexInput.addEventListener('input', function() {
		const isValid = isValidRegex(this.value);
		this.classList.toggle('invalid', !isValid);
	});
	
	// Save on change (blur)
	regexInput.addEventListener('change', function() {
		if (isValidRegex(this.value)) {
			updateEnvironmentRegex(index, this.value || env.subdomain);
		} else {
			alert('Invalid regex pattern. Please correct it.');
			this.focus();
		}
	});
	
	return regexInput;
}

function updateEnvironmentRegex(index, newRegex) {
	chrome.storage.sync.get(['environments'], function(result) {
		const environments = result.environments || [];
		if (environments[index]) {
			environments[index].regex = newRegex;
			chrome.storage.sync.set({ environments }, () => {
				console.log('Regex updated for environment:', environments[index].name);
			});
		}
	});
}

function newEditColorButton(index, env) {
	const colorInput = document.createElement('input');
	colorInput.type = 'color';
	colorInput.value = env.color || DEFAULT_COLOR;
	colorInput.className = 'color-input';
	colorInput.title = 'Change marker color';
	colorInput.style.width = '40px';
	colorInput.style.height = '30px';
	colorInput.addEventListener('change', () => {
		updateEnvironmentColor(index, colorInput.value);
	});
	return colorInput;
}

function updateEnvironmentColor(index, newColor) {
	chrome.storage.sync.get(['environments'], function(result) {
		const environments = result.environments || [];
		if (environments[index]) {
			environments[index].color = newColor;
			chrome.storage.sync.set({ environments }, () => {
				displayEnvironments();
			});
		}
	});
}

function newDeleteButton(index) {
	const deleteButton = document.createElement('button');
	deleteButton.textContent = 'Delete';
	deleteButton.id = 'delete-env';
	deleteButton.className = 'env-button';
	deleteButton.addEventListener('click', () => {
		deleteEnvironment(index);
	});
	return deleteButton;
}

function deleteEnvironment(index) {
	chrome.storage.sync.get(['environments'], function (result) {
		const environments = result.environments || [];
		environments.splice(index, 1);
		chrome.storage.sync.set({ environments }, () => {
			alert('Environment deleted!');
			displayEnvironments();
		});
	});
}
