import { ImageResponse } from "next/og";

export const alt = "Mahmoud Elfeel software engineering portfolio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "72px",
          color: "#f8fbff",
          background: "#050b12",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <img
          src="https://elfeel.me/Logo-transparent.png"
          alt=""
          width={302}
          height={302}
          style={{ objectFit: "contain", marginRight: "56px" }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: "-3px",
              lineHeight: 1,
            }}
          >
            Mahmoud Elfeel
          </div>
          <div
            style={{
              marginTop: "28px",
              color: "#38bdf8",
              fontSize: 45,
              fontWeight: 500,
            }}
          >
            Software Engineer
          </div>
          <div
            style={{
              marginTop: "24px",
              color: "#cbd5e1",
              fontSize: 25,
            }}
          >
            Backend · Full-stack · Mobile · Security
          </div>
        </div>
      </div>
    ),
    size,
  );
}
