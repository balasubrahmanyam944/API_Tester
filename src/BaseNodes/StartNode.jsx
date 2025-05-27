// StartNode.jsx
import React from "react";
import { Handle, Position } from "@xyflow/react";

const StartNode = ({ data }) => {
  return (
    <div style={{ padding: 10, border: "2px solid #00ff00", borderRadius: 6, background: "#e6ffe6" }}>
      <strong>▶ Start</strong>
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
};

export default StartNode;
