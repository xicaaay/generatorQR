import { ImageResponse } from "next/og";

export const alt = "Generador de códigos QR gratis · PNG HD y SVG";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Patrón decorativo tipo QR (no es un QR real)
const PATTERN = [
  "1111111010111111",
  "1000001001100001",
  "1011101011101101",
  "1011101000101101",
  "1000001010100001",
  "1111111010111111",
  "0000000011000000",
  "1101011100110101",
  "0110100111011010",
  "1011011001101101",
  "0000000010110010",
  "1111111001011011",
  "1000001011010110",
  "1011101000111011",
  "1000001010010110",
  "1111111011101101",
];

export default function OpengraphImage() {
  const cell = 22;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px",
          background: "#f5f5f5",
          color: "#171717",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
          <div style={{ fontSize: 28, color: "#737373", fontWeight: 600 }}>
            Generador gratuito
          </div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, marginTop: 16 }}>
            Crea tu código QR
          </div>
          <div style={{ fontSize: 32, color: "#525252", marginTop: 24 }}>
            PNG HD y SVG · Sin registro · 100% en tu navegador
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: 28,
            background: "#ffffff",
            borderRadius: 32,
            boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
          }}
        >
          {PATTERN.map((row, y) => (
            <div key={y} style={{ display: "flex" }}>
              {row.split("").map((bit, x) => (
                <div
                  key={x}
                  style={{
                    width: cell,
                    height: cell,
                    background: bit === "1" ? "#171717" : "transparent",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
