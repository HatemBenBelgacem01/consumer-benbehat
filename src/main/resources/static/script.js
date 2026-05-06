function checkFiles(files) {
    const file = files[0];
    if (!file) return;

    const preview = document.getElementById("preview");
    const answer = document.getElementById("answer");
    const answerPart = document.getElementById("answerPart");

    // UI vorbereiten (Lade-Status)
    preview.src = URL.createObjectURL(file);
    answerPart.classList.remove("hidden");
    // Kurzer Timeout für den Fade-In Effekt
    setTimeout(() => answerPart.classList.remove("opacity-0"), 50);
    
    answer.innerHTML = `
        <div class="flex items-center space-x-2 text-indigo-600 font-semibold">
            <svg class="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>Analysiere Bild...</span>
        </div>
    `;

    const formData = new FormData();
    formData.append("image", file);

    fetch('/analyze', { 
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) throw new Error("Server Error");
        return response.json(); // Wir parsen die Antwort direkt als JSON!
    })
    .then(data => {
        // Altes HTML löschen
        answer.innerHTML = "";

        // Für jedes Ergebnis im JSON einen schicken Balken bauen
        data.forEach((item, index) => {
            // Wahrscheinlichkeit in Prozent umrechnen (z.B. 0.44 -> 44.1%)
            const percent = (item.probability * 100).toFixed(1);
            
            // Name säubern (Oft sind IDs wie "n02123045" vor dem Klassennamen)
            let cleanName = item.className.split(' ').slice(1).join(' ');
            if(!cleanName) cleanName = item.className; // Fallback
            // Ersten Buchstaben groß machen
            cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

            // Den coolsten Balken für den Top-Hit machen (Index 0)
            const barColor = index === 0 ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-indigo-200';
            const textColor = index === 0 ? 'text-gray-800 font-bold' : 'text-gray-600 font-medium';

            // HTML für einen Balken generieren
            const barHtml = `
                <div class="mb-3">
                    <div class="flex justify-between mb-1">
                        <span class="${textColor} text-sm">${cleanName}</span>
                        <span class="${textColor} text-sm">${percent}%</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2.5 shadow-inner">
                        <div class="${barColor} h-2.5 rounded-full transition-all duration-1000 ease-out" style="width: 0%" data-target-width="${percent}%"></div>
                    </div>
                </div>
            `;
            answer.innerHTML += barHtml;
        });

        // Animation für die Balken triggern (damit sie von 0 auf X% wachsen)
        setTimeout(() => {
            const bars = answer.querySelectorAll('.bg-gradient-to-r, .bg-indigo-200');
            bars.forEach(bar => {
                bar.style.width = bar.getAttribute('data-target-width');
            });
        }, 100);

    })
    .catch(error => {
        console.error('Fehler:', error);
        answer.innerHTML = `
            <div class="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">
                Ups, bei der Analyse ist etwas schiefgelaufen! Prüfe, ob der DJL Container läuft.
            </div>
        `;
    });
}