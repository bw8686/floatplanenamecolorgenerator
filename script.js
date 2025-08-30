function fastHashStringToInt(str) {
    let hashCode = BigInt(0);

    for (let i = 0; i < str.length; i++) {
        hashCode = BigInt(str.charCodeAt(i)) + ((hashCode << BigInt(5)) - hashCode);
    }

    return Number(hashCode % BigInt(Number.MAX_SAFE_INTEGER));
}

const NAME_COLOR_COUNT = 10;
const COLORS = [
    '#aaaaaa', // 1
    '#006699', // 2
    '#cc6600', // 3
    '#d400d4', // 4
    '#009933', // 5
    '#ff6600', // 6
    '#006666', // 7
    '#b63d3d', // 8
    '#9763cb', // 9
    '#0099cc', // 10
];

function getUsernameColorIndex(username) {
    const usernameHash = fastHashStringToInt(username);
    return (Math.abs(usernameHash) % NAME_COLOR_COUNT);
}

function getUsernameColor(username) {
    const index = getUsernameColorIndex(username);
    return COLORS[index];
}

function* findOnePerColor(str) {
    const len = str.length;
    const foundColors = new Set();
    let attempts = 0;
    const maxAttempts = 10000; // Safety limit
    
    const originalColor = getUsernameColor(str);
    foundColors.add(originalColor);
    yield { variation: str, color: originalColor };
    
    while (foundColors.size < NAME_COLOR_COUNT && attempts < maxAttempts) {
        attempts++;
        let variation = '';
        for (let i = 0; i < len; i++) {
            const char = str[i];
            if (Math.random() < 0.5) {
                variation += char === char.toUpperCase() ? 
                    char.toLowerCase() : char.toUpperCase();
            } else {
                variation += char;
            }
        }
        
        const color = getUsernameColor(variation);
        if (!foundColors.has(color)) {
            foundColors.add(color);
            yield { variation, color };
            
            if (foundColors.size === NAME_COLOR_COUNT) break;
        }
    }
}

function updateResults() {
    const username = document.getElementById('usernameInput').value.trim();
    const resultDiv = document.getElementById('result');
    
    resultDiv.innerHTML = '';
    
    if (!username) return;
    
    const colorMap = new Map();
    
    for (const { variation, color } of findOnePerColor(username)) {
        if (!colorMap.has(color)) {
            colorMap.set(color, variation);
        }
    }
    
    const sortedColors = COLORS.map((color, index) => ({
        color,
        variation: colorMap.get(color) || 'No variation found',
        index: index + 1
    }));
    
    for (const { color, variation, index } of sortedColors) {
        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = color;
        colorBox.textContent = variation;
        colorBox.title = `Color ${index}: ${color}`;
        
        const colorLabel = document.createElement('div');
        colorLabel.textContent = `Color ${index}: ${color}`;
        colorLabel.style.fontSize = '0.8em';
        colorLabel.style.marginTop = '4px';
        
        const container = document.createElement('div');
        container.style.marginBottom = '10px';
        container.appendChild(colorBox);
        container.appendChild(colorLabel);
        
        resultDiv.appendChild(container);
    }
    
    const foundCount = colorMap.size;
    if (foundCount < NAME_COLOR_COUNT) {
        const remaining = NAME_COLOR_COUNT - foundCount;
        const message = document.createElement('p');
        message.textContent = `Could not find variations for ${remaining} color${remaining > 1 ? 's' : ''}. Try a different username.`;
        message.style.color = '#666';
        resultDiv.appendChild(message);
    }
}

function isValidUsername(username) {
    return /^[a-zA-Z0-9\-_]+$/.test(username);
}

function updateCharCount() {
    const input = document.getElementById('usernameInput');
    const charCount = document.getElementById('charCount');
    const errorMessage = document.getElementById('errorMessage');
    
    const username = input.value;
    charCount.textContent = `${username.length}/20`;
    
    if (username && !isValidUsername(username)) {
        errorMessage.textContent = 'Only alphanumeric characters, dashes (-), and underscores (_) are allowed';
        errorMessage.style.display = 'block';
        return false;
    } else {
        errorMessage.style.display = 'none';
        return true;
    }
}

function init() {
    const usernameInput = document.getElementById('usernameInput');
    usernameInput.addEventListener('input', () => {
        if (updateCharCount()) {
            updateResults();
        } else {
            document.getElementById('result').innerHTML = '';
        }
    });
    
    usernameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            updateResults();
        }
    });
    
    updateCharCount();
    updateResults();
}

document.addEventListener('DOMContentLoaded', init);
