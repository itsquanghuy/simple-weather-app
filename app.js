class UI {
	static render(func) {
		func();
	}
}

const data = {
	timezone: '',
	weatherIcon: '',
	temperature: {
		amount: 0,
		degree: 'F',
	},
	summary: '',
};

let target = null;

class Dep {
	constructor() {
		this._subscribers = [];
	}

	depend() {
		if (target && !this._subscribers.includes(target)) {
			this._subscribers.push(target);
		}
	}

	notify() {
		this._subscribers.forEach((sub) => sub());
	}
}

Object.keys(data).forEach((key) => {
	let internalValue = data[key];

	const dep = new Dep();

	Object.defineProperty(data, key, {
		get() {
			dep.depend();
			return internalValue;
		},
		set(newVal) {
			internalValue = newVal;
			dep.notify();
		},
	});
});

function watcher(myFunc) {
	target = myFunc;
	target();
	target = null;
}

window.addEventListener('load', () => {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition((position) => {
			const { longitude, latitude } = position.coords;

			const proxy = 'https://cors-anywhere.herokuapp.com/';
			const api = `${proxy}https://api.darksky.net/forecast/fd9d9c6418c23d94745b836767721ad1/${latitude},${longitude}`;

			fetch(api)
				.then((res) => res.json())
				.then((json) => {
					const { timezone } = json;
					const { temperature, summary, icon } = json.currently;

					data.timezone = timezone;
					data.temperature = { ...data.temperature, amount: temperature };
					data.summary = summary;
					data.weatherIcon = icon;

					watcher(() => {
						UI.render(() => {
							document.querySelector('.timezone').textContent = data.timezone;
						});
					});
					watcher(() => {
						UI.render(() => {
							const skycons = new Skycons({ color: 'white' });
							const currentIcon = data.weatherIcon
								.replace(/-/g, '_')
								.toUpperCase();
							skycons.play();
							skycons.set(
								document.querySelector('#weather-icon'),
								Skycons[currentIcon]
							);
						});
					});
					watcher(() => {
						UI.render(() => {
							document.querySelector('.amount').textContent =
								data.temperature.amount;
							document.querySelector('.degree').textContent =
								data.temperature.degree;
						});
					});
					watcher(() => {
						UI.render(() => {
							document.querySelector('.summary').textContent = data.summary;
						});
					});
				});
		});

		document.querySelector('.temperature').addEventListener('click', () => {
			data.temperature =
				data.temperature.degree === 'F'
					? {
							amount: Math.round(
								(data.temperature.amount - 32) * (5 / 9)
							).toFixed(2),
							degree: 'C',
					  }
					: {
							amount: Math.round(
								data.temperature.amount * (9 / 5) + 32
							).toFixed(2),
							degree: 'F',
					  };
		});
	}
});
