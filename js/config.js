window.CALLMED_API_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:5000/api"
    : "https://callmed-backend.onrender.com/api";
