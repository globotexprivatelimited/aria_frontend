export const metadata = { title: "Privacy Policy - Aria" };

export default function Privacy() {
  const wrap = { maxWidth: 760, margin: "0 auto", padding: "64px 24px 96px", fontFamily: "system-ui, sans-serif", color: "#2C332D", lineHeight: 1.7 };
  const h2 = { fontSize: 20, fontWeight: 600, color: "#1B2621", marginTop: 36, marginBottom: 10 };
  return (
    <main style={wrap}>
      <h1 style={{ fontSize: 34, fontWeight: 700, color: "#1B2621" }}>Privacy Policy</h1>
      <p style={{ color: "#6E756F", marginTop: 6 }}>Aria, operated by Globotex Private Limited. Last updated 14 August 2026.</p>

      <h2 style={h2}>What Aria is</h2>
      <p>Aria is a guest concierge service used by hotels. Guests message a hotel&apos;s WhatsApp number, and Aria helps with requests such as housekeeping, dining and bookings on that hotel&apos;s behalf.</p>

      <h2 style={h2}>What we collect</h2>
      <p>When you message a hotel using Aria we receive your WhatsApp number, the content of your messages, and the room you are staying in if the hotel has shared it with us. We keep a record of the requests you make so hotel staff can fulfil them.</p>

      <h2 style={h2}>Why we hold it</h2>
      <p>Solely to deliver the service you asked for and to let the hotel serve you during your stay. We do not sell your data, we do not use it for advertising, and we do not share it with other guests or with businesses unrelated to your stay.</p>

      <h2 style={h2}>How long we keep it</h2>
      <p>Message content is retained for a limited period after your stay ends and then deleted. Request records may be kept longer in an anonymised form so hotels can understand demand, but without anything that identifies you.</p>

      <h2 style={h2}>Your rights</h2>
      <p>Under India&apos;s Digital Personal Data Protection Act you may ask for a copy of your data or ask us to erase it. Reply <b>STOP</b> to any Aria message and your data will be erased and no further messages sent. You can also write to us at the address below.</p>

      <h2 style={h2}>Security</h2>
      <p>Data is stored on managed infrastructure with access limited to the hotel you are staying with and to Globotex staff who maintain the service.</p>

      <h2 style={h2}>WhatsApp</h2>
      <p>Messages are delivered over the WhatsApp Business Platform, operated by Meta. Their handling of message delivery is covered by WhatsApp&apos;s own privacy policy.</p>

      <h2 style={h2}>Contact</h2>
      <p>
        Globotex Private Limited<br />
        5th Floor, 5 &amp; 6 Fancy Lane, Kolkata 700001, India<br />
        contact@globotex.co.in
      </p>
    </main>
  );
}
