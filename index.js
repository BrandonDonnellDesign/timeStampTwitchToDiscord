const readline = require('readline');

// Function to format timestamp to "hh'h'mm'm'ss's'" format
function formatTimestamp(timestamp) {
    const timeComponents = timestamp.split(':');
    const hours = parseInt(timeComponents[0]);
    const minutes = parseInt(timeComponents[1]);
    const seconds = parseInt(timeComponents[2]);
    return `${hours.toString().padStart(2, '0')}h${minutes.toString().padStart(2, '0')}m${seconds.toString().padStart(2, '0')}s`;
}

// Function to create a Twitch link
function createTwitchLink(baseUrl, timestamp, text) {
    const timestampFormatted = formatTimestamp(timestamp);
    const videoId = baseUrl.split('/').pop(); // Extract the video ID from the base URL
    const twitchUrl = `https://www.twitch.tv/videos/${videoId}?t=${timestampFormatted}`;
    return `${timestamp} - [${text}](${twitchUrl})`;
}

// Function to process the input list and generate masked links
function processInputList(baseUrl, input) {
    const lines = input.trim().split('\n');
    const timestampedTextList = [];

    // Iterate over lines skipping the first line (date)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        const [timestamp, ...textArray] = line.split(' ');
        const text = textArray.join(' '); // Reconstruct text if it contains spaces
        timestampedTextList.push({ timestamp, text });
    }

    return { baseUrl, timestampedTextList };
}

// Function to generate masked links from the list of timestamped texts
function generateMaskedLinks(baseUrl, timestampedTextList) {
    console.log("\nMasked Links for Discord:");

    let output = ''; // Variable to store the output
    let block = ''; // Variable to store the current block of characters

    timestampedTextList.forEach(({ timestamp, text }) => {
        const maskedLink = createTwitchLink(baseUrl, timestamp, text);

        // Check if adding the masked link exceeds 2000 characters
        if ((block + maskedLink).length > 2000) {
            // If it exceeds, print the current block
            console.log(output);
            // Reset the block and output for the next block
            block = '';
            output = '';
        }
        
        // Add the masked link to the current block
        block += maskedLink + '\n';
        output += maskedLink + '\n'; // Also add to the complete output
    });

    console.log(output); // Print the remaining output
}

// Read input from the command line
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let baseUrl;
let inputList = '';

// Prompt user for base URL
rl.question('Enter the base URL for Twitch:\n', (url) => {
    baseUrl = url.trim();

    // Prompt user to paste the list of timestamps and text
    rl.question('Paste the list of timestamps and text (press Enter twice when done):\n', (input) => {
        inputList += input.trim() + '\n';

        // Handle user input
        rl.on('line', (input) => {
            if (input.trim() === '') {
                rl.close();
            } else {
                inputList += input.trim() + '\n';
            }
        });

        // Process the input when user finishes
        rl.on('close', () => {
            const { baseUrl: finalBaseUrl, timestampedTextList } = processInputList(baseUrl, inputList);
            generateMaskedLinks(finalBaseUrl, timestampedTextList);
        });
    });
});
