require('dotenv').config();

async function main() {
    const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.AIML_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'mistralai/codestral-2501',
            messages: [
                {
                    role: 'user',
                    content: 'Hello'
                }
            ]
        }),
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}

main();