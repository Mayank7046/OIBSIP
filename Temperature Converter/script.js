document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('convert').addEventListener('click', convertTemperature);
});

function convertTemperature() {
    const temperatureInput = document.getElementById('temperature');
    const fromUnit = document.getElementById('fromUnit').value;
    const toUnit = document.getElementById('toUnit').value;
    const resultElement = document.getElementById('result');
    const errorElement = document.getElementById('error');
    
    // Reset previous error
    errorElement.textContent = '';
    
    // Validate input
    if (temperatureInput.value === '') {
        errorElement.textContent = 'Please enter a temperature';
        return;
    }
    
    const temperature = parseFloat(temperatureInput.value);
    
    // Check for absolute zero
    if (fromUnit === 'celsius' && temperature < -273.15) {
        errorElement.textContent = 'Temperature cannot be below absolute zero (-273.15°C)';
        return;
    }
    if (fromUnit === 'fahrenheit' && temperature < -459.67) {
        errorElement.textContent = 'Temperature cannot be below absolute zero (-459.67°F)';
        return;
    }
    if (fromUnit === 'kelvin' && temperature < 0) {
        errorElement.textContent = 'Temperature cannot be below absolute zero (0K)';
        return;
    }
    
    let result;
    
    // Convert to Celsius first
    let celsius;
    switch (fromUnit) {
        case 'celsius':
            celsius = temperature;
            break;
        case 'fahrenheit':
            celsius = (temperature - 32) * 5/9;
            break;
        case 'kelvin':
            celsius = temperature - 273.15;
            break;
    }
    
    // Convert from Celsius to target unit
    switch (toUnit) {
        case 'celsius':
            result = celsius;
            break;
        case 'fahrenheit':
            result = (celsius * 9/5) + 32;
            break;
        case 'kelvin':
            result = celsius + 273.15;
            break;
    }
    
    // Round to 2 decimal places
    result = Math.round(result * 100) / 100;
    
    // Display result
    let unitSymbol = '';
    switch (toUnit) {
        case 'celsius': unitSymbol = '°C'; break;
        case 'fahrenheit': unitSymbol = '°F'; break;
        case 'kelvin': unitSymbol = 'K'; break;
    }
    
    resultElement.textContent = `${result} ${unitSymbol}`;
}