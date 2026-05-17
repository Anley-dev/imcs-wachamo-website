// Dynamic Countdown Timer Engine
document.addEventListener("DOMContentLoaded", () => {
    const countdownElement = document.getElementById("featured-countdown");
    if (!countdownElement) return;

    // Pull targeted ISO string timestamp from data-date attribute
    const targetDateString = countdownElement.getAttribute("data-date");
    const targetDate = new Date(targetDateString).getTime();

    // DOM Target Elements
    const daysElement = document.getElementById("days");
    const hoursElement = document.getElementById("hours");
    const minutesElement = document.getElementById("minutes");
    const secondsElement = document.getElementById("seconds");

    const updateCountdown = () => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        // Check if event has already passed
        if (difference < 0) {
            countdownElement.innerHTML = "<div class='time-block' style='min-width: 100%; color: var(--secondary); font-weight: bold;'>Program has Commenced / Active Now</div>";
            clearInterval(timerInterval);
            return;
        }

        // Time Conversions
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Update DOM Elements
        daysElement.textContent = days.toString().padStart(2, '0');
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
    };

    // Run immediately on boot and set interval loop
    updateCountdown();
    const timerInterval = setInterval(updateCountdown, 1000);
});

