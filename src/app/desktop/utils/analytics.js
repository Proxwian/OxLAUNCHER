import fetch from "node-fetch";

export const sendAnalyticsEvent = async (playerName, accountType) => {
  console.log('Send analytics event!');
  await fetch(
    "https://www.google-analytics.com/mp/collect?measurement_id=G-6TKP16Y5EN&api_secret=QBpssHnYTrudn-0Djq5ebA",
    {
      method: "POST",
      body: JSON.stringify({
        client_id: playerName,
        events: [
          {
            name: "app_start",
            params: { platform: "electron", playerName: playerName, account_type: accountType }
          }
        ]
      })
    }
  );
}