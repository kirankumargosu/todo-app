export const tabs = {
  container: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
  },
  button: {
    padding: "8px 16px",
    border: "1px solid #ccc",
    backgroundColor: "#f9f9f9",
    cursor: "pointer",
    borderRadius: "4px",
    fontWeight: 500,
    transition: "background-color 0.2s, border-color 0.2s",
  },
  activeButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    borderColor: "#007bff",
  },
  disabledButton: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};

export const imageGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: "12px",
};

export const imageCard = {
  container: {
    position: "relative" as "relative",
    border: "1px solid #ddd",
    borderRadius: "4px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  hover: {
    transform: "scale(1.03)",
  },
  img: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  meta: {
    position: "absolute" as "absolute",
    bottom: "4px",
    left: "4px",
    fontSize: "12px",
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "#fff",
    padding: "2px 6px",
    borderRadius: "3px",
  },
};
