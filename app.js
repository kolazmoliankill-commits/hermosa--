function extractChannel(input) {
    input = input.trim().toLowerCase();

    if (input.includes("kick.com")) {
        let clean = input.replace("https://", "")
                         .replace("http://", "")
                         .replace("kick.com/", "")
                         .replace("/", "");
        return clean;
    }

    return input;
}

async function analyze() {
    const input = document.getElementById("channelInput").value;
    const channel = extractChannel(input);

    if (!channel) return alert("Escribe un canal válido.");

    const url = `https://kick.com/api/v2/channels/${channel}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.livestream) {
            alert("El canal no está en vivo");
            return;
        }

        const total = data.livestream.viewer_count;

        // ALGORITMO AVANZADO 🧠
        let chatActivity = data.livestream.chatters ?? 0;
        let ratio = chatActivity / (total || 1);

        let realPercent = 0;

        if (ratio >= 0.12) realPercent = 80;
        else if (ratio >= 0.08) realPercent = 60;
        else if (ratio >= 0.05) realPercent = 40;
        else if (ratio >= 0.03) realPercent = 20;
        else if (ratio >= 0.015) realPercent = 10;
        else realPercent = 2;

        const real = Math.round(total * (realPercent / 100));
        const bots = total - real;
        const botPercent = 100 - realPercent;

        document.getElementById("results").classList.remove("hidden");
        document.getElementById("channelName").innerText = channel.toUpperCase();

        document.getElementById("totalViewers").innerText = total;
        document.getElementById("realPercent").innerText = realPercent + "%";
        document.getElementById("botPercent").innerText = botPercent + "%";

        document.getElementById("realBar").style.width = realPercent + "%";
        document.getElementById("botBar").style.width = botPercent + "%";

    } catch (e) {
        alert("Error analizando el canal.");
        console.log(e);
    }
}
