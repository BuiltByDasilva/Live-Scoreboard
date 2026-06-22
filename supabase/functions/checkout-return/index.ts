function renderPage(status: "success" | "cancelled") {
  const isSuccess = status === "success";
  const title = isSuccess ? "Payment complete" : "Checkout cancelled";
  const message = isSuccess
    ? "Your skin unlock has been sent to Live Scoreboard. You can close this tab and return to the extension."
    : "No payment was completed. You can close this tab and return to Live Scoreboard.";
  const accent = isSuccess ? "#b8ff16" : "#ff5d4d";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | Live Scoreboard</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: radial-gradient(circle at top, #1c2d10, #050705 58%);
      color: #fffdf5;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    main {
      width: min(560px, calc(100vw - 40px));
      padding: 38px;
      border: 1px solid rgba(184, 255, 22, 0.34);
      border-radius: 8px;
      background: rgba(8, 12, 8, 0.86);
      box-shadow: 0 0 52px rgba(184, 255, 22, 0.18);
    }
    .mark {
      width: 58px;
      height: 58px;
      display: grid;
      place-items: center;
      border: 2px solid ${accent};
      border-radius: 999px;
      color: ${accent};
      font-size: 32px;
      font-weight: 900;
      margin-bottom: 22px;
      box-shadow: 0 0 28px rgba(184, 255, 22, 0.28);
    }
    h1 {
      margin: 0 0 12px;
      font-size: clamp(32px, 6vw, 54px);
      line-height: 0.95;
      letter-spacing: 0;
    }
    p {
      margin: 0 0 24px;
      color: #c8d2c0;
      font-size: 18px;
      line-height: 1.5;
    }
    button {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      padding: 0 18px;
      border: 1px solid ${accent};
      border-radius: 8px;
      color: ${accent};
      font-weight: 900;
      font-size: 15px;
      background: rgba(184, 255, 22, 0.1);
      cursor: pointer;
    }
  </style>
</head>
<body>
  <main>
    <div class="mark">${isSuccess ? "OK" : "!"}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <button type="button" onclick="window.close()">Close tab</button>
  </main>
</body>
</html>`;
}

Deno.serve((req) => {
  const url = new URL(req.url);
  const tail = url.pathname.split("/").filter(Boolean).pop();
  const status = tail === "cancelled" ? "cancelled" : "success";

  return new Response(renderPage(status), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
});
