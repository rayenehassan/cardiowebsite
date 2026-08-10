const fs = require("fs");
const raw = fs.readFileSync(".env.local", "utf8").replace(/^﻿/, "");
const env = Object.fromEntries(
  raw.split("\n").filter(l => l.trim() && !l.startsWith("#"))
    .map(l => [l.split("=")[0].trim(), l.split("=").slice(1).join("=").trim()])
);
const { createClient } = require("../node_modules/@supabase/supabase-js");
const client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  for (const t of ["chat_logs", "chat_custom_answers"]) {
    const { error } = await client.from(t).select("id").limit(1);
    console.log(t + " : " + (error ? "ERREUR -> " + error.message : "OK (existe)"));
  }
})();
