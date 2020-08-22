class Location {
	constructor(timezone, weatherIcon) {
		this._timezone = timezone;
		this._weatherIcon = weatherIcon;
	}

	set timezone(t) {
		this._timezone = t;
	}

	get timezone() {
		return this._timezone;
	}

	set weatherIcon(i) {
		this._weatherIcon = i;
	}

	get weatherIcon() {
		return this._weatherIcon;
	}
}

class Temperature {
	constructor(amount, degree) {
		this._amount = amount;
		this._degree = degree;
	}

	set amount(a) {
		this._amount = a;
	}

	get amount() {
		return this._amount;
	}

	set degree(d) {
		if (d === this._degree) {
			return;
		} else if (d === 'C') {
			this._degree = d;
			this._amount = Math.round((this._amount - 32) * (5 / 9)).toFixed(2);
		} else if (d === 'F') {
			this._degree = d;
			this._amount = Math.round(this._amount * (9 / 5) + 32).toFixed(2);
		} else {
			throw new Error(`Unsupported degree of ${d}`);
		}
	}

	get degree() {
		return this._degree;
	}
}

class UI {
	static setWeatherIcon(icon, iconId) {
		const skycons = new Skycons({ color: 'white' });
		const currentIcon = icon.replace(/-/g, '_').toUpperCase();
		skycons.play();
		skycons.set(iconId, Skycons[currentIcon]);
	}

	static setTemperature(a, d) {
		document.querySelector('.amount').textContent = a;
		document.querySelector('.degree').textContent = d;
	}

	static setSummary(s) {
		document.querySelector('.summary').textContent = s;
	}

	static setTimezone(t) {
		document.querySelector('.timezone').textContent = t;
	}
}

window.addEventListener('load', () => {
	if (navigator.geolocation) {
		let location, temperature;

		navigator.geolocation.getCurrentPosition((position) => {
			const { longitude, latitude } = position.coords;

			const proxy = 'https://cors-anywhere.herokuapp.com/';
			const api = `${proxy}https://api.darksky.net/forecast/fd9d9c6418c23d94745b836767721ad1/${latitude},${longitude}`;

			fetch(api)
				.then((res) => res.json())
				.then((data) => {
					location = new Location(data.timezone, data.currently.icon);
					temperature = new Temperature(data.currently.temperature, 'F');

					UI.setTimezone(location.timezone);
					UI.setWeatherIcon(
						location.weatherIcon,
						document.getElementById('weather-icon')
					);
					UI.setTemperature(temperature.amount, temperature.degree);
					UI.setSummary(data.currently.summary);
				});
		});

		document.querySelector('.temperature').addEventListener('click', () => {
			const { degree } = temperature;

			if (degree === 'F') {
				temperature.degree = 'C';
			} else {
				temperature.degree = 'F';
			}

			UI.setTemperature(temperature.amount, temperature.degree);
		});
	}
});
