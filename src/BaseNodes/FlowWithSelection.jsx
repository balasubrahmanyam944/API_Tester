// FlowWithSelection.jsx
import React, { useState, useRef, useCallback } from "react";
import {
  ReactFlow,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  darkMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { presetGetFlow } from "./presetGetFlow";
/**
 * FlowWithSelection
 * - Box-selection (drag to select)
 * - Click to toggle select individual nodes/edges
 * - Delete key or button removes selected items
 * - Ctrl+drag panning
 * - Right-click menu for node creation
 */
export default function FlowWithSelection({
  nodes,
  edges,
  onChange,
  nodeTypes,
  fitViewOptions,
  onCreateTextNode,
  onCreateGetNode,
  onCreateTestNode,
  OnValidationNode,
  onCreateForLoopNode,
  OnCreateCheckEqualNode, // as a prop
  onStartNode,
  darkMode,
}) {
  const wrapperRef = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const { getEdges, setEdges } = useReactFlow();

  // track selection
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [selectedEdges, setSelectedEdges] = useState(new Set());

  // apply ReactFlow removal/change events
  const onNodesChangeHandler = useCallback(
    (changes) => {
      const updated = applyNodeChanges(changes, nodes);
      onChange({ nodes: updated, edges });
    }
    // [nodes, edges, onChange]
  );

  const onEdgesChangeHandler = useCallback(
    (changes) => {
      const updated = applyEdgeChanges(changes, edges);
      onChange({ nodes, edges: updated });
    }
    // [nodes, edges, onChange]
  );

  const onConnect = useCallback((params) => {
    const updated = addEdge(params, edges);
    onChange({ nodes, edges: updated });
  });

  // toggle selection on click
  // Updated onNodeClick to disconnect nodes when a handle is clicked

  const onNodeClick = useCallback(
    (event, node) => {
      // Check if the clicked node is already selected
      if (selectedNodes.has(node.id)) {
        setSelectedNodes((prev) => {
          const next = new Set(prev);
          next.delete(node.id);
          return next;
        });
      } else {
        setSelectedNodes((prev) => {
          const next = new Set(prev);
          next.add(node.id);
          return next;
        });
      }

      // Check if any handle is clicked, and disconnect if it's connected
      const selectedHandle = event.target;
      const targetNodeId = node.id;

      // Get all the edges connected to the clicked node
      const connectedEdges = edges.filter(
        (edge) => edge.source === targetNodeId || edge.target === targetNodeId
      );

      // Find the edge connected to the clicked handle
      const edgeToDisconnect = connectedEdges.find(
        (edge) =>
          edge.sourceHandle === selectedHandle.id ||
          edge.targetHandle === selectedHandle.id
      );

      if (edgeToDisconnect) {
        // Disconnect the edge by removing it
        const updatedEdges = edges.filter((edge) => edge !== edgeToDisconnect);
        onChange({ nodes, edges: updatedEdges });
      }
    },
    [edges, onChange, selectedNodes]
  );

  const onEdgeClick = useCallback((_, edge) => {
    setSelectedEdges((prev) => {
      const next = new Set(prev);
      if (next.has(edge.id)) next.delete(edge.id);
      else next.add(edge.id);
      return next;
    });
  }, []);

  // handle right-click menu coords
  const handleContextMenu = useCallback((event) => {
    event.preventDefault();
    const bounds = wrapperRef.current.getBoundingClientRect();
    setContextMenu({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      clientX: event.clientX,
      clientY: event.clientY,
    });
  }, []);

  const handlePaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  // create at click pos
  const createNodeAt = useCallback(
    (callback) => {
      if (!contextMenu || !rfInstance || !callback) return;
      const flowPos = rfInstance.screenToFlowPosition({
        x: contextMenu.clientX,
        y: contextMenu.clientY,
      });
      callback(flowPos);
      setContextMenu(null);
    },
    [contextMenu, rfInstance]
  );
  const onAddPresetGet = () => {
    if (!rfInstance) return;
    const flowPos = rfInstance.screenToFlowPosition({
      x: contextMenu.clientX,
      y: contextMenu.clientY,
    });
  
    const { nodes: presetNodes, edges: presetEdges } = presetGetFlow(flowPos.x, flowPos.y);
    onChange({
      nodes: [...nodes, ...presetNodes],
      edges: [...edges, ...presetEdges],
    });
  
    setContextMenu(null);
  };
  
  // delete via button or Delete key
  const handleDeleteSelected = useCallback(() => {
    // filter out selected
    const newNodes = nodes.filter((n) => !selectedNodes.has(n.id));
    const newEdges = edges.filter((e) => !selectedEdges.has(e.id));
    onChange({ nodes: newNodes, edges: newEdges });
    setSelectedNodes(new Set());
    setSelectedEdges(new Set());
  }, [nodes, edges, selectedNodes, selectedEdges, onChange]);

  return (
    <div
      ref={wrapperRef}
      tabIndex={0}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: darkMode ? "#1e1e1e" : "#fff",
      }}
      onContextMenu={handleContextMenu}
      onClick={handlePaneClick}
      // onKeyDown={(e) => {
      //   if (e.key === "Delete") handleDeleteSelected();
      // }}
    >
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onInit={setRfInstance}
          onNodesChange={onNodesChangeHandler}
          onEdgesChange={onEdgesChangeHandler}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          deleteKeyCode={[46]}
          keyboardEventTarget="document"
          selectionOnDrag={true}
          selectionKeyCode={null}
          panOnDrag={true}
          panActivationKeyCode="Control"
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={fitViewOptions}
          className={darkMode ? "dark-theme" : ""}
        >
          <Background />
        </ReactFlow>
      </ReactFlowProvider>
      {/* Context menu */}
      {contextMenu && (
        <div
          style={{
            position: "absolute",
            top: contextMenu.y,
            left: contextMenu.x,
            background: darkMode ? "#2a2a2a" : "#fff",
            border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
            borderRadius: 6,
            color: darkMode ? "#eee" : "#000",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            zIndex: 100,
          }}
        >
          <div
            style={{
              padding: 8,
              cursor: "pointer",
              background: darkMode ? "#2a2a2a" : "#fff",
              border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
              borderRadius: 6,
              color: darkMode ? "#eee" : "#000",
            }}
            onClick={() => createNodeAt(onCreateTextNode)}
          >
            Create Text node
          </div>
          <div
            style={{
              padding: 8,
              cursor: "pointer",
              background: darkMode ? "#2a2a2a" : "#fff",
              border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
              borderRadius: 6,
              color: darkMode ? "#eee" : "#000",
            }}
            onClick={() => createNodeAt(onCreateGetNode)}
          >
            Create Get node
          </div>
          <div
            style={{
              padding: 8,
              cursor: "pointer",
              background: darkMode ? "#2a2a2a" : "#fff",
              border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
              borderRadius: 6,
              color: darkMode ? "#eee" : "#000",
            }}
            onClick={() => createNodeAt(onCreateTestNode)}
          >
            Create Response Evaluator node
          </div>
          <div
            style={{
              padding: 8,
              cursor: "pointer",
              background: darkMode ? "#2a2a2a" : "#fff",
              border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
              borderRadius: 6,
              color: darkMode ? "#eee" : "#000",
            }}
            onClick={() => createNodeAt(OnValidationNode)}
          >
            Create Validation node
          </div>
          <div
            style={{
              padding: 8,
              cursor: "pointer",
              background: darkMode ? "#2a2a2a" : "#fff",
              border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
              borderRadius: 6,
              color: darkMode ? "#eee" : "#000",
            }}
            onClick={() => createNodeAt(onCreateForLoopNode)}
          >
            Create For Loop node
          </div>
          <div
            style={{
              padding: 8,
              cursor: "pointer",
              background: darkMode ? "#2a2a2a" : "#fff",
              border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
              borderRadius: 6,
              color: darkMode ? "#eee" : "#000",
            }}
            onClick={() => createNodeAt(OnCreateCheckEqualNode)}
          >
            Create Check Equal Node
          </div>
          <div
  style={{
    padding: 8,
    cursor: "pointer",
    background: darkMode ? "#2a2a2a" : "#fff",
    border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
    borderRadius: 6,
    color: darkMode ? "#eee" : "#000",
  }}
  onClick={onAddPresetGet}
>
  Preset Get
</div>
<div
  style={{
    padding: 8,
    cursor: "pointer",
    background: darkMode ? "#2a2a2a" : "#fff",
    border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
    borderRadius: 6,
    color: darkMode ? "#eee" : "#000",
  }}
  onClick={() => createNodeAt(onStartNode)}
>
  Start Node
</div>
        </div>
      )}
    </div>
  );
}
