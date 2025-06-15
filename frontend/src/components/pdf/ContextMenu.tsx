interface ContextMenuProps {
  isVisible: boolean;
  onSummarize: () => void;
  onShow: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function ContextMenu({
  isVisible,
  onSummarize,
  onShow,
  onDelete,
  onClose,
}: ContextMenuProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: "28px",
        right: "4px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        padding: "4px",
        display: isVisible ? "block" : "none",
        zIndex: 100,
      }}
    >
      {/* Menu items */}
      <div
        style={{
          padding: "8px 12px",
          cursor: "pointer",
          borderRadius: "4px",
          transition: "background-color 0.2s",
          fontSize: "14px",
          color: "#374151",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f3f4f6"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent"
        }}
        onClick={(e) => {
          e.stopPropagation()
          onSummarize()
          onClose()
        }}
      >
        Summarize PDF
      </div>
      <div
        style={{
          padding: "8px 12px",
          cursor: "pointer",
          borderRadius: "4px",
          transition: "background-color 0.2s",
          fontSize: "14px",
          color: "#374151",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f3f4f6"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent"
        }}
        onClick={(e) => {
          e.stopPropagation()
          onShow()
          onClose()
        }}
      >
        Show PDF
      </div>
      <div
        style={{
          padding: "8px 12px",
          cursor: "pointer",
          borderRadius: "4px",
          transition: "background-color 0.2s",
          fontSize: "14px",
          color: "#EF4444",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f3f4f6"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent"
        }}
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
          onClose()
        }}
      >
        Delete
      </div>
    </div>
  )
} 