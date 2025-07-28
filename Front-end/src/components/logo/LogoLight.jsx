import React from "react";
import { Shield, Heart, Leaf, RotateCcw } from "lucide-react";
import './LogoAnimation.css'; // Nếu CSS nằm trong cùng thư mục với Logo.js

const Logo = ({ size = "medium", variant = "horizontal" }) => {
  const sizeClasses = {
    small: { width: "140px", height: "52px" },
    medium: { width: "200px", height: "68px" },
    large: { width: "280px", height: "88px" },
  };

  const iconSizes = {
    small: 22,
    medium: 30,
    large: 40,
  };

  const textSizes = {
    small: "1.25rem",
    medium: "1.625rem",
    large: "2rem",
  };

  const LogoIcon = () => (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        maxWidth: sizeClasses[size].width,
        maxHeight: sizeClasses[size].height,
        aspectRatio: "1",
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05) rotate(5deg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1) rotate(0deg)";
      }}
    >
      {/* Main gradient background circle */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, #34d399 0%, #14b8a6 30%, #0891b2 70%, #0e7490 100%)",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          animation: "pulse 3s ease-in-out infinite",
        }}
      />

      {/* Inner white circle with subtle pattern */}
      <div
        style={{
          position: "relative",
          borderRadius: "50%",
          backgroundColor: "white",
          padding: "10px",
          boxShadow:
            "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06), inset 0 -2px 4px 0 rgba(0, 0, 0, 0.03)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Main renewal arrow with animation */}
          <RotateCcw
            size={iconSizes[size]}
            style={{
              color: "#059669",
              position: "absolute",
              zIndex: 10,
              filter: "drop-shadow(0 2px 4px rgba(5, 150, 105, 0.3))",
              animation: "rotate 4s linear infinite",
            }}
            strokeWidth={2.8}
          />

          {/* Heart symbol with pulse effect */}
          <Heart
            size={iconSizes[size] * 0.65}
            style={{
              color: "#f43f5e",
              position: "absolute",
              top: "6px",
              right: "6px",
              zIndex: 20,
              filter: "drop-shadow(0 1px 2px rgba(244, 63, 94, 0.3))",
              animation: "heartbeat 2s ease-in-out infinite",
            }}
            fill="currentColor"
          />

          {/* Leaf with gentle sway */}
          <Leaf
            size={iconSizes[size] * 0.55}
            style={{
              color: "#22c55e",
              position: "absolute",
              bottom: "6px",
              left: "6px",
              zIndex: 20,
              filter: "drop-shadow(0 1px 2px rgba(34, 197, 94, 0.3))",
              animation: "sway 3s ease-in-out infinite",
            }}
            fill="currentColor"
          />

          {/* Shield with subtle glow */}
          <Shield
            size={iconSizes[size] * 0.45}
            style={{
              color: "#2563eb",
              position: "absolute",
              top: "6px",
              left: "6px",
              zIndex: 20,
              filter: "drop-shadow(0 1px 2px rgba(37, 99, 235, 0.3))",
            }}
            fill="currentColor"
          />
        </div>
      </div>
    </div>
  );

  const LogoText = () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span
        style={{
          fontWeight: "800",
          fontSize: textSizes[size],
          color: "#1f2937",
          lineHeight: "1.1",
          letterSpacing: "-0.02em",
          background:
            "linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
        }}
      >
        <span
          style={{
            background: "linear-gradient(135deg, #059669 0%, #14b8a6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Re
        </span>
        <span
          style={{
            background: "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          New
        </span>
        <span
          style={{
            background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Me
        </span>
      </span>
      <span
        style={{
          fontSize: "0.8rem",
          color: "#6b7280",
          fontWeight: "600",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginTop: "2px",
          background: "linear-gradient(90deg, #6b7280 0%, #9ca3af 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Preventive Healthcare
      </span>
    </div>
  );

  if (variant === "icon-only") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            ...sizeClasses[size],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LogoIcon />
        </div>
      </div>
    );
  }

    if (variant === "vertical") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <LogoIcon />
        <LogoText />
      </div>
    );
  }

  return (
    <div
      style={{
        ...sizeClasses[size],
        display: "flex",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <LogoIcon />
      <LogoText />
    </div>
  );
};

export default Logo;

