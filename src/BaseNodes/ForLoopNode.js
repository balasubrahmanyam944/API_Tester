// ForLoopNode.js
import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function ForLoopNode({ id, isConnectable, darkMode }) {
  const { getEdges, getNodes, updateNodeData, setEdges } = useReactFlow();
  const [status, setStatus] = useState(null);
const { deleteElements } = useReactFlow();

  const disconnectHandle = (handleId, type) => (e) => {
    if (e.ctrlKey) {
      const filtered = getEdges().filter(
        edge => !(edge[type] === id && edge[`${type}Handle`] === handleId)
      );
      setEdges(filtered);
    }
  };

  const resolvePath = (obj, path) => {
    if (!path) return obj;
    try {
      if (path.endsWith('[]')) path = path.slice(0, -2);
      return path
        .replace(/\[(\d+)\]/g, '.$1')
        .split('.')
        .reduce((cur, key) => (cur ? cur[key] : undefined), obj);
    } catch (err) {
      console.error('Path resolution error:', err);
      return undefined;
    }
  };

  const fetchJSON = (nodeId) => {
    const node = getNodes().find(n => n.id === nodeId);
    if (!node) return '';
    const json = node.data?.response;
    if (json) return json;
    const upstreamEdge = getEdges().find(e => e.target === nodeId && e.targetHandle === 'top');
    if (!upstreamEdge) return '';
    return fetchJSON(upstreamEdge.source);
  };

  const runLoop = () => {
    const edges = getEdges();
    const inputEdge = edges.find(e => e.target === id && e.targetHandle === 'array');
    if (!inputEdge) {
      setStatus('❌ No array connected');
      return;
    }

    const jsonString = fetchJSON(inputEdge.source);
    const sourceHandleId = inputEdge.sourceHandle;

    if (!jsonString || typeof jsonString !== 'string') {
      setStatus('❌ No JSON data');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      console.error('Invalid JSON:', err);
      setStatus('❌ Invalid JSON');
      return;
    }

    let arrayPath = sourceHandleId;
    const bracketMatch = sourceHandleId?.match(/^(.+?)\[\d+\]$/);
    if (bracketMatch) arrayPath = bracketMatch[1];
    if (/\.\d+$/.test(sourceHandleId)) arrayPath = sourceHandleId.replace(/\.\d+$/, '');

    let array = resolvePath(parsed, arrayPath);
    if (!Array.isArray(array)) {
      if (typeof array === 'object') array = [array];
      else {
        setStatus('❌ Not an array');
        return;
      }
    }

    updateNodeData(id, { response: JSON.stringify(array) });
    setStatus(`✅ Loop Ready (${array.length} items)`);
  };

  const baseStyle = {
    background: darkMode ? '#2a2a2a' : '#fff',
    color: darkMode ? '#eee' : '#000',
    border: '1px solid',
    borderColor: darkMode ? '#555' : '#888'
  };

  return (
    <div style={{
      ...baseStyle,
      padding: 12,
      minWidth: 180,
      borderRadius: 4,
      textAlign: 'center',
      position: 'relative'
    }}>
      <button
  onClick={() => deleteElements({ nodes: [{ id }] })}
  style={{
    position: 'absolute',
    top: 4,
    right: 4,
    background: 'transparent',
    border: 'none',
    color: darkMode ? '#f88' : '#a00',
    fontWeight: 'bold',
    fontSize: 10,
    cursor: 'pointer',
    zIndex: 10,
  }}
  title="Delete Node"
>
  🗑Delete
</button>

      <div style={{ fontWeight: 'bold', marginBottom: 6 }}>For Loop</div>

      <Handle
        type="target"
        id="array"
        position={Position.Left}
        style={{ top: '50%' }}
        isConnectable={isConnectable}
        onClick={disconnectHandle('array', 'target')}
      />

      <button
        onClick={runLoop}
        style={{
          fontSize: 12,
          padding: '6px 10px',
          background: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          margin: '10px 0'
        }}
      >
        Run Loop
      </button>

      {status && (
        <div style={{ fontSize: 14, fontWeight: 'bold', marginTop: 6 }}>
          {status}
        </div>
      )}

      <Handle
        type="source"
        id="response"
        position={Position.Right}
        style={{ top: '50%' }}
        isConnectable={isConnectable}
        onClick={disconnectHandle('response', 'source')}
      />
    </div>
  );
}