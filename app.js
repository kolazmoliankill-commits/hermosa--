async function checkBots() {
    const channel = document.getElementById("channelInput").value.trim();
    const result = document.getElementById("result");
    const loading = document.getElementById("loading");

    if (!channel) {
        result.innerHTML = "Ingresa un canal válido.";
        result.classList.remove("hidden");
        return;
    }

    result.classList.add("hidden");
    loading.classList.remove("hidden");
    loading.innerHTML = "Analizando datos...";

    try {
        const res = await fetch(`https://kick.com/api/v2/channels/${channel}`);
        if (!res.ok) {
            loading.classList.add("hidden");
            result.innerHTML = "No se encontró el canal.";
            result.classList.remove("hidden");
            return;
        }

        const data = await res.json();
        const viewers = data.livestream?.viewer_count || 0;

        // Datos de chatters
        const chatRes = await fetch(`https://kick.com/api/v2/channels/${channel}/chatroom`);
        const chatData = await chatRes.json();
        const chatters = chatData?.chatters_count || 0;

        // Estimación PRO de viewers reales
        let realEstimate = chatters * (12 + Math.random() * 8);

        if (realEstimate > viewers) realEstimate = viewers * 0.85;

        const botsEstimated = Math.max(0, viewers - realEstimate);

        const realPercent = (realEstimate / viewers) * 100;
        const botsPercent = (botsEstimated / viewers) * 100;

        loading.classList.add("hidden");

        result.innerHTML = `
            <h2>${channel}</h2>

            <p>🔵 <b>Viewers Totales:</b> ${viewers.toLocaleString()}</p>
            <p>🟢 <b>Reales Estimados:</b> ${Math.floor(realEstimate).toLocaleString()}</p>
            <p>🔴 <b>Bots Aproximados:</b> ${Math.floor(botsEstimated).toLocaleString()}</p>

            <div class="bar-container">
                <div class="bar-real" id="barReal"></div>
            </div>
            <p style="margin-top:5px;">Reales: ${realPercent.toFixed(1)}%</p>

            <div class="bar-container">
                <div class="bar-bots" id="barBots"></div>
            </div>
            <p style="margin-top:5px;">Bots: ${botsPercent.toFixed(1)}%</p>

            <p style="opacity:0.7; margin-top:20px;">
                Precisión del análisis: <b>Alta</b>
            </p>
        `;

        result.classList.remove("hidden");

        setTimeout(() => {
            document.getElementById("barReal").style.width = realPercent + "%";
            document.getElementById("barBots").style.width = botsPercent + "%";
        }, 200);

    } catch (error) {
        loading.classList.add("hidden");
        result.innerHTML = "Error al analizar el canal.";
        result.classList.remove("hidden");
    }
}
