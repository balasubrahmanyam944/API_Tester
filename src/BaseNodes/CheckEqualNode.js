import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';

const CheckEqualNode = ({ id, isConnectable, darkMode }) => {
  const { getEdges, getNodes, setEdges } = useReactFlow();
  const [status, setStatus] = useState('');
  const [key, setKey] = useState('');
  const [expectedType, setExpectedType] = useState('string');
const { deleteElements } = useReactFlow();

  const disconnectHandle = (handleId, type) => (e) => {
    if (e.ctrlKey) {
      const filtered = getEdges().filter(
        edge => !(edge[type] === id && edge[`${type}Handle`] === handleId)
      );
      setEdges(filtered);
    }
  };

  const handleCheck = () => {
    const edges = getEdges();
    const nodes = getNodes();
    const inputEdge = edges.find(e => e.target === id && e.targetHandle === 'input');
    if (!inputEdge) {
      setStatus('❌ No data input');
      return;
    }

    const sourceNode = nodes.find(n => n.id === inputEdge.source);
    const jsonString = sourceNode?.data?.response || '';
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
  setStatus('❌ Invalid JSON');
  console.error('❌ JSON parse failed:', err, 'Value:', jsonString);
  return;
}


    const array = Array.isArray(parsed) ? parsed : typeof parsed === 'object' && parsed !== null ? Object.values(parsed).find(Array.isArray) : null;

    if (!Array.isArray(array)) {
      setStatus('❌ No valid array');
      return;
    }

    const result = array.every(item => {
      if (!item || typeof item !== 'object') return false;
      const value = item[key];
      return typeof value === expectedType;
    });

    setStatus(result ? '✅ All Equal' : '❌ Mismatch');
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

      <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Check Equal</div>

      <Handle
        type="target"
        id="input"
        position={Position.Left}
        style={{ top: '50%' }}
        isConnectable={isConnectable}
        onClick={disconnectHandle('input', 'target')}
      />

      <input
        type="text"
        placeholder="Key"
        value={key}
        onChange={e => setKey(e.target.value)}
        style={{ width: '80%', marginBottom: 6, padding: 4 }}
      />

      <select
        value={expectedType}
        onChange={e => setExpectedType(e.target.value)}
        style={{ width: '80%', marginBottom: 6, padding: 4 }}
      >
        <option value="string">string</option>
        <option value="number">number</option>
        <option value="boolean">boolean</option>
      </select>

      <button
        onClick={handleCheck}
        style={{ fontSize: 12, padding: '4px 8px', marginTop: 4, background: '#007bff', color: '#fff', border: 'none', borderRadius: 4 }}
      >
        Check
      </button>

      {status && <div style={{ marginTop: 8, fontWeight: 'bold' }}>{status}</div>}

      <Handle
        type="source"
        id="result"
        position={Position.Right}
        style={{ top: '50%' }}
        isConnectable={isConnectable}
        onClick={disconnectHandle('result', 'source')}
      />
    </div>
  );
};

export default CheckEqualNode;
