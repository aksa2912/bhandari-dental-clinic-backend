const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[bhandari-dental] server listening on http://localhost:${PORT}`);
});
