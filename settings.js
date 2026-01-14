document.addEventListener('DOMContentLoaded', function () {
	displayEnvironments();
});

document.getElementById('save-env').addEventListener('click', () => {
	const newNameText = document.getElementById('new-env-name');
	const newSubdomainText = document.getElementById('new-env-subdomain');
	if (newNameText.value && newSubdomainText.value) {
		chrome.storage.sync.get({ environments: [] }, (result) => {
			const environments = result.environments;
			environments.push({ name: newNameText.value, subdomain: newSubdomainText.value });
			chrome.storage.sync.set({ environments }, () => {
				newNameText.value = '';
				newSubdomainText.value = '';
				alert('Environment saved!');
				displayEnvironments();
			});
		});
	} else {
		alert('Please fill in both fields.');
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
            envItem.textContent = `${env.name}: ${env.subdomain}`;

            const deleteButton = newDeleteButton(index);

            envItem.appendChild(deleteButton);
            envList.appendChild(envItem);
        });
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


// Initial load of environments
// displayEnvironments();

