import React, { useState } from 'react';
import {
  Handle,
  Position,
  useNodeConnections,
  useNodesData,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function TestNode({ id, isConnectable, darkMode }) {
const { getEdges, setEdges, getNodes, updateNodeData } = useReactFlow();
const { deleteElements } = useReactFlow();

  const upstream = useNodeConnections({ handleType: 'target', handleId: 'top' });
  const sourceId = upstream?.[0]?.source ?? null;
  const sourceHandleId = upstream?.[0]?.sourceHandle ?? null;
const sourceNode = getNodes().find(n => n.id === sourceId);
const allResponses = sourceNode?.data;


  const [responseString, setResponseString] = useState('');

  const [expanded, setExpanded] = useState({});
  let parsed = {};
  try {
    parsed = JSON.parse(responseString);
  } catch {}

  const items = [];
  const traverse = (value, keyPath, level = 0) => {
    const isArray = Array.isArray(value);
    const isObject = value && typeof value === 'object' && !isArray;
    const handleId = isArray ? `${keyPath}[]` : keyPath;
    const displayLabel = level === 0
      ? handleId
      : handleId.split('.').pop().replace(/\[\d+\]/, '');
    items.push({ handleId, value, displayLabel, level });

    if ((isArray || isObject) && expanded[handleId]) {
      if (isArray && value.length) {
        Object.entries(value[0]).forEach(([subKey, subVal]) => {
          traverse(subVal, `${keyPath}[0].${subKey}`, level + 1);
        });
      } else if (isObject) {
        Object.entries(value).forEach(([subKey, subVal]) => {
          traverse(subVal, `${keyPath}.${subKey}`, level + 1);
        });
      }
    }
  };

  Object.entries(parsed).forEach(([k, v]) => traverse(v, k, 0));

const handleGetResponse = () => {
  if (!sourceId || !allResponses) {
    setResponseString('❌ No upstream data');
    return;
  }

  const edges = getEdges();
  const edge = edges.find(e => e.target === id && e.targetHandle === 'top');
  const handleId = edge?.sourceHandle;

  if (!handleId) {
    setResponseString('❌ No handle connected');
    return;
  }

  const targetResponse = allResponses?.[handleId];
  if (targetResponse) {
    setResponseString(targetResponse);

    // ADD THIS to make downstream nodes like CheckEqualNode work
    updateNodeData(id, { response: targetResponse });
    return;
  }

  setResponseString('❌ No response found for handle: ' + handleId);
};

  console.log("📦 allResponses", allResponses);


  return (
    <div
      className="test-node"
      style={{
        position: 'relative',
        padding: 12,
        background: darkMode ? '#2a2a2a' : '#fafafa',
        border: '1px solid',
        borderColor: darkMode ? '#555' : '#ddd',
        minWidth: 200,
        color: darkMode ? '#eee' : '#000',
      }}
    >
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

      <Handle
        type="target"
        id="top"
        position={Position.Left}
        style={{ top: 8 }}
        isConnectable={isConnectable}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          fontWeight: 'bold',
        }}
      >
        Response Evaluator
      </div>

      <button
        onClick={handleGetResponse}
        style={{
          marginTop: 24,
          padding: '6px 10px',
          background: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        Get
      </button>

      {items.map((item, idx) => {
        const { handleId, displayLabel, value, level } = item;
        const isContainer = Array.isArray(value) || (value && typeof value === 'object');
        const topPos = 60 + idx * 24;
        return (
          <React.Fragment key={`${handleId}-${idx}`}>
            <Handle
              type="source"
              id={handleId}
              position={Position.Right}
              style={{ top: topPos }}
              isConnectable={isConnectable}
              onClick={(e) => {
                if (e.ctrlKey) {
                  const filtered = getEdges().filter(
                    (edge) => !(edge.source === id && edge.sourceHandle === handleId)
                  );
                  setEdges(filtered);
                }
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: topPos - 6,
                right: 32,
                fontSize: 10,
                paddingLeft: level * 8,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {isContainer && (
                <span
                  style={{ cursor: 'pointer', marginRight: 4 }}
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [handleId]: !prev[handleId],
                    }))
                  }
                >
                  {expanded[handleId] ? '▼' : '▶'}
                </span>
              )}
              {displayLabel}
            </div>
          </React.Fragment>
        );
      })}

      <pre
        style={{
          marginTop: 24 + items.length * 24,
          maxHeight: 120,
          overflow: 'auto',
          fontSize: 10,
          background: darkMode ? '#2a2a2a' : '#fafafa',
          padding: 4,
          border: '1px solid #eee',
          borderRadius: 3,
          color: darkMode ? '#eee' : '#000',
        }}
      >
        {/* {responseString} */}
      </pre>
    </div>
  );
}

export default TestNode;
