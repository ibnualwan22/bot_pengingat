export async function getWaGroups() {
  const sessionId = process.env.WA_SESSION_ID;
  const baseUrl = process.env.WA_API_BASE_URL;
  const apiKey = process.env.WA_API_KEY;
  
  if (!sessionId || !baseUrl) throw new Error("WA credentials not configured");

  try {
    const res = await fetch(`${baseUrl}/api/v1/sessions/${sessionId}/groups`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || ''
      }
    });

    if (!res.ok) throw new Error("Failed to fetch WA groups");
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("WA API Error:", error);
    throw error;
  }
}

export async function sendWaMessage(to: string, message: string) {
  const sessionId = process.env.WA_SESSION_ID;
  const baseUrl = process.env.WA_API_BASE_URL;
  const apiKey = process.env.WA_API_KEY;
  
  if (!sessionId || !baseUrl) throw new Error("WA credentials not configured");

  try {
    const res = await fetch(`${baseUrl}/api/v1/sessions/${sessionId}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || ''
      },
      body: JSON.stringify({
        to,
        message
      })
    });

    console.log(`Sending message to ${to}: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("WA API Error:", error);
    throw error;
  }
}

export async function registerWebhook(webhookUrl: string) {
  const baseUrl = process.env.WA_API_BASE_URL;
  const apiKey = process.env.WA_API_KEY;
  
  if (!baseUrl) throw new Error("WA credentials not configured");

  try {
    const res = await fetch(`${baseUrl}/api/v1/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || ''
      },
      body: JSON.stringify({
        url: webhookUrl,
        events: ["message:received"]
      })
    });
    return res;
  } catch (error) {
    console.error("Webhook registration error:", error);
    throw error;
  }
}
