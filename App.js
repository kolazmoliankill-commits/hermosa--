async function scanChannel() {
    const channel = document.getElementById("channelInput").value.trim();
    const result = document.getElementById("result");

    if (!channel) {
        result.innerHTML = "❌ Ingresa un nombre de canal.";
        return;
    }

    result.innerHTML = "⏳ Analizando datos del canal...";

    try {
        // API no oficial de Kick
        const res = await fetch(`https://kick.com/api/v2/channels/${channel}`);
        const data = await res.json();

        if (!data || !data.livestream) {
            result.innerHTML = "⚠️ El canal no está en vivo o no existe.";
            return;
        }

        const viewers = data.livestream.viewers;

        // -------- ANALISIS DEL CHAT --------

        let chatMessages = 0;
        let usersTalking = 0;
        let repetitivePatterns = 0;

        try {
            const chatRes = await fetch(`https://kick.com/api/v2/channels/${channel}/messages`);
            const chatData = await chatRes.json();

            const messages = chatData?.data ?? [];

            chatMessages = messages.length;

            // Usuarios únicos hablando
            const users = new Set();
            const patternWords = ["hi", "lol", "???", "gg", "hi hi", "lol lol"];

            messages.forEach(msg => {
                users.add(msg.sender.username);

                // Buscar patrones repetitivos (bots simples)
                const lower = msg.content.toLowerCase();
                patternWords.forEach(p => {
                    if (lower.includes(p)) repetitivePatterns++;
                });
            });

            usersTalking = users.size;

        } catch {
            chatMessages = 0;
            usersTalking = 0;
        }

        // -------- ESTIMACIÓN ALGORÍTMICA --------

        // 1. Relación mensajes/minuto vs viewers
        const chatActivity = (usersTalking / viewers) * 100;

        // 2. Picos anormales (si el chat está muerto con muchos viewers)
        let suspicious = chatActivity < 3 ? 1 : 0;

        // 3. Repetición de mensajes (bots básicos)
        let repetitionScore = repetitivePatterns > 20 ? 1 : 0;

        // 4. Baja densidad de usuarios reales
        let densityScore = viewers > 500 && usersTalking < 20 ? 1 : 0;

        // Score total (0–3)
        const score = suspicious + repetitionScore + densityScore;

        let botPercent = 0;

        if (score === 0) botPercent = viewers * 0.10;
        if (score === 1) botPercent = viewers * 0.30;
        if (score === 2) botPercent = viewers * 0.55;
        if (score === 3) botPercent = viewers * 0.75;

        botPercent = Math.round(botPercent);

        const status = score === 0 ? "Normal" :
                       score === 1 ? "Posible" :
                       score === 2 ? "Sospechoso" :
                                     "Muy Sospechoso";

        // ---------- RESULTADO FINAL ----------
        result.innerHTML = `
            <h2>🔍 Resultado para <strong>${channel}</strong></h2>
            👥 Viewers totales: <strong>${viewers}</strong><br>
            💬 Usuarios hablando: <strong>${usersTalking}</strong><br>
            📝 Mensajes recientes: <strong>${chatMessages}</strong><br><br>

            <strong>Estado del Stream: ${status}</strong><br>
            🤖 Bots estimados: <strong>${botPercent}</strong> (${Math.round((botPercent / viewers) * 100)}%)<br><br>

            🧠 <strong>Factores detectados:</strong><br>
            - Actividad real: ${chatActivity.toFixed(2)}%<br>
            - Mensajes repetitivos: ${repetitivePatterns}<br>
            - Densidad real baja: ${densityScore ? "Sí" : "No"}<br><br>

            ⚠ Este análisis es aproximado y combina 5 métricas avanzadas.<br>
        `;
    } catch (error) {
        result.innerHTML = "❌ Error procesando los datos del canal.";
    }
}
