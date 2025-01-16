function parseCustomDate(dateString) {
  // Jika tanggal adalah 'unli' atau '-'
  if (dateString === "unli" || dateString === "-") {
    return dateString; // Kembalikan string "unli" atau "-" untuk menandakan tidak terbatas
  }

  // Jika formatnya adalah tanggal dan waktu
  const [day, month, year, time] = dateString.split("/");
  const [hour, minute] = time.split(":");

  // Buat objek Date berdasarkan komponen-komponen tersebut
  return new Date(year, month - 1, day, hour, minute);
}

module.exports = parseCustomDate;
