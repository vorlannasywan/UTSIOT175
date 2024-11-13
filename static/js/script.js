async function fetchSensorData() {
    try {
        const response = await fetch('/get_data');
        const data = await response.json();

        if (data.length > 0) {
            // Extract max, min, and average temperature values
            const maxTemp = Math.max(...data.map(item => item.suhumax));
            const minTemp = Math.min(...data.map(item => item.suhumin));
            const avgTemp = data.reduce((acc, item) => acc + item.suhurata2, 0) / data.length;

            // Update data cards
            document.getElementById('suhumax').textContent = maxTemp || 'N/A';
            document.getElementById('suhumin').textContent = minTemp || 'N/A';
            document.getElementById('suhurata2').textContent = avgTemp.toFixed(2) || 'N/A';

            // Initialize the individual charts
            createSingleValueChart('maxTempChart', maxTemp, 'Max Temp (°C)', '#FF6384');
            createSingleValueChart('minTempChart', minTemp, 'Min Temp (°C)', '#36A2EB');
            createSingleValueChart('avgTempChart', avgTemp, 'Avg Temp (°C)', '#FFCE56');

            // Data for main temperature and humidity chart
            const temperatureData = data.map(item => item.nilaisuhuhumid.map(val => val.suhu)).flat();
            const humidityData = data.map(item => item.nilaisuhuhumid.map(val => val.humid)).flat();
            const timestamps = data.map(item => item.nilaisuhuhumid.map(val => new Date(val.timestamp).toLocaleTimeString())).flat();

            // Initialize the main chart
            updateChart(timestamps, temperatureData, humidityData);
        } else {
            console.log('No data found');
        }
    } catch (error) {
        console.error('Error fetching sensor data:', error);
    }
}

// Function to create a simple single-value chart
function createSingleValueChart(elementId, dataValue, label, color) {
    const ctx = document.getElementById(elementId).getContext("2d");
    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: [label],
            datasets: [
                {
                    data: [dataValue, 100 - dataValue],
                    backgroundColor: [color, "#f5f7fb"],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            cutout: '80%', // Adjust inner radius
            plugins: {
                tooltip: {
                    enabled: false
                },
                legend: {
                    display: false
                }
            }
        }
    });
}

// Function to update the main temperature and humidity chart
function updateChart(timestamps, temperatureData, humidityData) {
    const ctx = document.getElementById('temperatureHumidityChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: temperatureData,
                    borderColor: '#FF6384',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false
                },
                {
                    label: 'Humidity (%)',
                    data: humidityData,
                    borderColor: '#36A2EB',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Values'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", fetchSensorData);
