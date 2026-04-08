const axios = require("axios");
(async () => {
  try {
    const API_URL =
      process.env.API_URL ||
      "https://doctor-booking-appointment-i137.onrender.com";
    const r = await axios.get(`${API_URL}/api/doctors/doctors`, {
      params: { page: 1, limit: 15 },
    });
    console.log(
      "status",
      r.status,
      "total",
      r.data.totalPages,
      "count",
      (r.data.doctors || []).length,
    );
    console.log(
      "sample",
      JSON.stringify((r.data.doctors || []).slice(0, 2), null, 2),
    );
  } catch (e) {
    if (e.response)
      console.error("resp err", e.response.status, e.response.data);
    else console.error("err", e.message);
  }
})();
