// Telegram Bot API integration for sending test results
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentName, score, total, timeSpent, timestamp, testType } = req.body;

    // Validate required fields
    if (!studentName || score === undefined || !total || !timeSpent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create message for Telegram
    const percentage = ((score / total) * 100).toFixed(1);
    const message = `
📚 *Uzbek-English Translation Test Result*
👤 *Student:* ${studentName}
📊 *Score:* ${score}/${total} (${percentage}%)
⏱️ *Time Spent:* ${timeSpent}
📅 *Completed:* ${new Date(timestamp).toLocaleString()}
🔄 *Test Type:* Uzbek to English Translation with Prepositions
    `.trim();

    // Send message to Telegram if credentials are available
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown',
          }),
        }
      );

      if (!telegramResponse.ok) {
        console.error('Telegram API error:', await telegramResponse.text());
        return res.status(500).json({ error: 'Failed to send message to Telegram' });
      }
    } else {
      console.log('Telegram credentials not set. Message would be:', message);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Results processed successfully' 
    });
  } catch (error) {
    console.error('Error processing results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
