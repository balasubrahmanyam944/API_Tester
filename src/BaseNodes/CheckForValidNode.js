import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function CheckForValidNode({ id, isConnectable, darkMode }) {
  const { getEdges, getNodes, setEdges } = useReactFlow();
  const [inputHandles, setInputHandles] = useState(['input_0']);
  const [statusMap, setStatusMap] = useState({});
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
    } catch {
      return undefined;
    }
  };

  const isValid = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'number' || typeof value === 'boolean') return true;
    if (Array.isArray(value)) return value.length > 0 && value.every(isValid);
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      return keys.length > 0 && keys.every(k => isValid(value[k]));
    }
    return false;
  };

  const fetchJSON = (node) => {
    if (!node) return '';
    const jsonString = node.data?.response;
    if (jsonString) return jsonString;
    const topEdge = getEdges().find(e => e.target === node.id && e.targetHandle === 'top');
    if (!topEdge) return '';
    const upstream = getNodes().find(n => n.id === topEdge.source);
    return fetchJSON(upstream);
  };

  const runValidation = (handleId) => {
    const edges = getEdges();
    const nodes = getNodes();
    const edge = edges.find(e => e.target === id && e.targetHandle === handleId);
    if (!edge) {
      setStatusMap(prev => ({ ...prev, [handleId]: '❌ No connection' }));
      return;
    }

    const sourceNode = nodes.find(n => n.id === edge.source);
    const sourceHandleId = edge.sourceHandle;
    const jsonString = fetchJSON(sourceNode);
console.log("📦 jsonString from upstream:", jsonString);

    let parsed;
try {
  if (typeof jsonString === 'string') {
    parsed = JSON.parse(jsonString);
  } else if (typeof jsonString === 'object') {
    parsed = jsonString; // already parsed
  } else {
    throw new Error('Invalid type');
  }
} catch (err) {
setStatusMap(prev => ({ ...prev, [handleId]: '❌ Invalid JSON' }));
  console.error('❌ JSON parse failed:', err, 'Value:', jsonString);
  return;
}


    const val = resolvePath(parsed, sourceHandleId);
    console.log('Validating path:', sourceHandleId, 'Value:', val);

    const ok = isValid(val);
    setStatusMap(prev => ({ ...prev, [handleId]: ok ? '✅ Valid' : '❌ Not valid' }));
  };

  const addInputHandle = () => {
    setInputHandles(prev => [...prev, `input_${prev.length}`]);
  };

  const removeInputHandle = () => {
    if (inputHandles.length > 1) {
      const newHandles = [...inputHandles];
      newHandles.pop();
      setInputHandles(newHandles);
      
      // Also remove status for removed handle
      const lastHandle = inputHandles[inputHandles.length - 1];
      setStatusMap(prev => {
        const newMap = {...prev};
        delete newMap[lastHandle];
        return newMap;
      });
    }
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
      minWidth: 200,
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

      <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Check Valid</div>

      {inputHandles.map((handleId) => (
        <div key={handleId} style={{ position: 'relative', marginBottom: 12 }}>
          <Handle
            type="target"
            id={handleId}
            position={Position.Left}
            style={{ top: '50%' }}
            isConnectable={isConnectable}
            onClick={disconnectHandle(handleId, 'target')}
          />

          <button
            onClick={() => runValidation(handleId)}
            style={{ fontSize: 10, padding: '4px 8px', marginLeft: 24 }}
          >
            Validate {handleId}
          </button>

          {statusMap[handleId] && (
            <div style={{ fontSize: 12, marginTop: 4 }}>{statusMap[handleId]}</div>
          )}

          <Handle
            type="source"
            id={`out_${handleId}`}
            position={Position.Right}
            style={{ top: '50%' }}
            isConnectable={isConnectable}
            onClick={disconnectHandle(`out_${handleId}`, 'source')}
          />
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={addInputHandle}
          style={{ fontSize: 14, fontWeight: 'bold' }}>＋</button>
        <button onClick={removeInputHandle}
          style={{ fontSize: 14, fontWeight: 'bold' }}>－</button>
      </div>
    </div>
  );
}