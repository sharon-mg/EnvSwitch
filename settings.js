const DEFAULT_COLOR = '#11CCCA';

document.addEventListener('DOMContentLoaded', function () {
	loadMarkerSettings();
	displayEnvironments();
});

// ==================== MARKER SETTINGS ====================

function loadMarkerSettings() {
	chrome.storage.sync.get(['markerSettings'], function(result) {
		const settings = result.markerSettings || {
			enabled: false,
			shape: 'ribbon',
			position: 'top-right'
		};
		
		document.getElementById('marker-enabled').checked = settings.enabled;
		document.getElementById('marker-shape').value = settings.shape;
		document.getElementById('marker-position').value = settings.position;
	});
}

function saveMarkerSettings() {
	const settings = {
		enabled: document.getElementById('marker-enabled').checked,
		shape: document.getElementById('marker-shape').value,
		position: document.getElementById('marker-position').value
	};
	
	chrome.storage.sync.set({ markerSettings: settings }, function() {
		console.log('Marker settings saved:', settings);
	});
}

// Add event listeners for marker settings
document.getElementById('marker-enabled').addEventListener('change', saveMarkerSettings);
document.getElementById('marker-shape').addEventListener('change', saveMarkerSettings);
document.getElementById('marker-position').addEventListener('change', saveMarkerSettings);

// ==================== ENVIRONMENTS ====================

document.getElementById('save-env').addEventListener('click', () => {
	const newNameText = document.getElementById('new-env-name');
	const newSubdomainText = document.getElementById('new-env-subdomain');
	const newColorInput = document.getElementById('new-env-color');
	
	if (newNameText.value && newSubdomainText.value) {
		chrome.storage.sync.get({ environments: [] }, (result) => {
			const environments = result.environments;
			environments.push({ 
				name: newNameText.value, 
				subdomain: newSubdomainText.value,
				color: newColorInput.value || DEFAULT_COLOR
			});
			chrome.storage.sync.set({ environments }, () => {
				newNameText.value = '';
				newSubdomainText.value = '';
				newColorInput.value = DEFAULT_COLOR;
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
			
			// Environment info
			const envInfo = document.createElement('span');
			envInfo.className = 'env-info';
			envInfo.textContent = `${env.name}: ${env.subdomain}`;
			
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
