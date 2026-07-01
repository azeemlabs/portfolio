document.addEventListener("DOMContentLoaded", function () {
    const namespace = "azeemlabs_portfolio";
    const key = "visits";

    const existingUserId = localStorage.getItem("site_user_id");

    if (!existingUserId) {
        // --- NAYA USER --- (+1 barhega)
        const uniqueId = "usr_" + Date.now();
        localStorage.setItem("site_user_id", uniqueId);

        fetch(`https://api.counterapi.dev/v1/${namespace}/${key}/up`)
            .then(res => res.json())
            .then(data => {
                if (data && data.count) {
                    updateCounterUI(data.count);
                }
            })
            .catch(err => {
                console.error("Up Error:", err);
                updateCounterUI("N/A");
            });
    } else {
        // --- PURANA USER --- (Sirf Read)
        // CounterAPI ka get endpoint agar error de, to hum safe request bhejte hain
        fetch(`https://api.counterapi.dev/v1/${namespace}/${key}`)
            .then(res => res.json())
            .then(data => {
                // Kuch servers par response data direct object hota hai, kuch par array
                let total = data.count || data.value;
                if (total) {
                    updateCounterUI(total);
                } else {
                    // Agar direct read nahi ho raha, to temporary block handle karne ke liye down-counter trick
                    updateCounterUI("Checking...");
                }
            })
            .catch(err => {
                // AGAR AB BHI READ FAIL HO: To serves ka alternative endpoint use karte hain
                console.log("Read failed, trying alternative endpoint...");
                
                // Yeh trick counter ko bina barhaye sirf current state return karegi
                fetch(`https://api.counterapi.dev/v1/${namespace}/${key}/down`)
                    .then(res => res.json())
                    .then(data => {
                        // Kyonki humne temporary down kiya tha to sahi value ke liye wapas +1 value internally show karenge
                        let correctedCount = (data.count || 0) + 1;
                        updateCounterUI(correctedCount);
                    })
                    .catch(() => {
                        updateCounterUI("Active");
                    });
            });
    }

    function updateCounterUI(countValue) {
        const counterElement = document.getElementById("total-visitors");
        if (counterElement) {
            counterElement.innerText = countValue;
        }
    }
});