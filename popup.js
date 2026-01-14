
document.addEventListener('DOMContentLoaded', function () {
  const envButtonsContainer = document.getElementById('env-buttons');
  loadEnvironments(envButtonsContainer);
});

function loadEnvironments(envButtonsContainer) {
	chrome.storage.sync.get(['environments'], function (result) {
		const environments = result.environments || [];
		envButtonsContainer.innerHTML = '';
		environments.forEach(env => {
			const buttonWrapper = document.createElement('div');
      buttonWrapper.className = 'button-wrapper';
			const button = document.createElement('button');
      buttonWrapper.appendChild(button);
			button.className = 'button-30';
			// button.textContent = `${env.name} (${env.subdomain})`;
			button.textContent = `${env.name}`;
			button.setAttribute('data-env', env.name);
			button.addEventListener('click', switchEnvCallback(env));
			envButtonsContainer.appendChild(buttonWrapper);
		});
	});
}

function switchEnvCallback(env) {
	return function () {
		chrome.storage.sync.set({ currentEnv: env }, function () {
			console.log('Environment set to ' + env.name);
		});
		chrome.runtime.sendMessage({ action: 'switchEnv', env: env });
		window.close();
	};
}