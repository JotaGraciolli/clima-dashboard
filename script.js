const API_KEY = "ac51ad59e2524f4ba9e161424261202";

const cidades = [
    { nome: "Santo Antônio da Patrulha - RS", lat: -29.8267, lon: -50.5178, id: "cidade1" },
    { nome: "Teixeira de Freitas - BA", lat: -17.5392, lon: -39.7361, id: "cidade2" },
    { nome: "Cariacica - ES", lat: -20.2637, lon: -40.4165, id: "cidade3" },
    { nome: "Teresina - PI", lat: -5.0919, lon: -42.8034, id: "cidade4" },
    { nome: "São Paulo - SP", lat: -23.5505, lon: -46.6333, id: "cidade5" },
    { nome: "Curitiba - PR", lat: -25.4284, lon: -49.2733, id: "cidade6" }
];

function classeTemp(t) {
    if (t >= 30) return "temp-quente";
    if (t <= 18) return "temp-frio";
    return "temp-normal";
}

function interpretarClima(condicao, precip, uv, umidade) {
    const c = condicao.toLowerCase();

    if (c.includes("thunder")) return { texto: "⚡ Tempestade com trovoadas", anim: "relampago chuva" };
    if (c.includes("heavy rain")) return { texto: "🌧 Chuva intensa", anim: "chuva" };
    if (c.includes("moderate rain")) return { texto: "🌧 Chuva moderada", anim: "chuva" };
    if (c.includes("light rain")) return { texto: "🌦 Chuva leve", anim: "chuva" };
    if (c.includes("overcast")) return { texto: `☁ Céu encoberto | Umidade ${umidade}%`, anim: "" };
    if (c.includes("cloudy")) return { texto: `☁ Muitas nuvens | Umidade ${umidade}%`, anim: "" };
    if (c.includes("partly")) return { texto: `⛅ Poucas nuvens | Umidade ${umidade}%`, anim: "" };
    if (c.includes("clear") || c.includes("sunny"))
        return { texto: `☀ Ensolarado | UV ${uv}`, anim: "sol" };

    if (precip > 0) return { texto: "🌧 Chuva", anim: "chuva" };

    return { texto: "🌡 Clima estável", anim: "" };
}

cidades.forEach(cidade => carregarClima(cidade));

async function carregarClima(cidade) {
    const resp = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cidade.lat},${cidade.lon}&hours=12&aqi=no&alerts=no`
    );
    const dados = await resp.json();

    const atual = dados.current;
    const dia = dados.forecast.forecastday[0].day;
    const agora = new Date().getHours();

    const forecastHoras = dados.forecast.forecastday[0].hour
        .filter(h => parseInt(h.time.split(" ")[1]) >= agora)
        .slice(0, 6);

    const card = document.getElementById(cidade.id);
    card.className = "card";

    const chanceChuva = dia.daily_chance_of_rain;
    const clima = interpretarClima(
        atual.condition.text,
        atual.precip_mm,
        atual.uv,
        atual.humidity
    );

    if (atual.is_day) card.classList.add("dia");
    else card.classList.add("noite", "estrelas");

    /*if (chanceChuva > 60) card.classList.add("alerta-chuva");
    if (atual.feelslike_c > 35) card.classList.add("alerta-calor");*/

    if (clima.anim) {
        clima.anim.split(" ").forEach(a => card.classList.add(a));
    }

    card.innerHTML = `
    <div>
      <h3>${cidade.nome}</h3>
      <div class="temperatura ${classeTemp(atual.temp_c)}">
        ${atual.temp_c}°C
      </div>
      <div>${clima.texto}</div>
      <div>Sensação: ${atual.feelslike_c}°C</div>
      <div>Chance de chuva: ${chanceChuva}%</div>
    </div>
    <canvas id="grafico-${cidade.id}"></canvas>
  `;

    new Chart(document.getElementById(`grafico-${cidade.id}`), {
        type: "line",
        data: {
            labels: forecastHoras.map(h => h.time.split(" ")[1]),
            datasets: [{
                data: forecastHoras.map(h => h.temp_c),
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: "white" } },
                y: { display: false }
            }
        }
    });
}
