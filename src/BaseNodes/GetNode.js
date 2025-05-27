import React, { useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function GetNode({ id, data, isConnectable, darkMode }) {
  const { getEdges, getNodes, setEdges, updateNodeData } = useReactFlow();
  const [responses, setResponses] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
const { deleteElements } = useReactFlow();

  const disconnectHandle = (handleId, type) => (e) => {
    if (e.ctrlKey) {
      const filtered = getEdges().filter(
        edge => !(edge[type] === id && edge[`${type}Handle`] === handleId)
      );
      setEdges(filtered);
    }
  };

  const getEndpointUrls = () => {
    const edges = getEdges();
    const nodes = getNodes();
    const endpointEdge = edges.find(e => e.target === id && e.targetHandle === 'endpoint');
    const sourceNodeId = endpointEdge?.source;
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    const label = sourceNode?.data?.label;

    let urls = [];

    if (typeof label === 'string') {
      urls = label
        .split(/[\n,]+/)
        .map(url => url.trim())
        .filter(url => /^https?:\/\//.test(url));
    } else if (typeof label === 'object' && label !== null) {
      Object.values(label).forEach(val => {
        if (typeof val === 'string') {
          urls.push(
            ...val
              .split(/[\n,]+/)
              .map(url => url.trim())
              .filter(url => /^https?:\/\//.test(url))
          );
        }
      });
    }

    return urls;
  };

  const handleRun = useCallback(async () => {
    const urls = getEndpointUrls();
    const resultList = [];

    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        resultList.push({ url, result: json });
      } catch (err) {
        resultList.push({ url, result: { error: err.message } });
      }
    }

    setResponses(resultList);
    const responseMap = {};
    resultList.forEach((r, i) => {
      responseMap[`response_${i}`] = JSON.stringify(r.result);
    });
    
    updateNodeData(id, (prev) => ({
      ...prev,
      ...responseMap,
    }));
  }, [getEdges, getNodes, id, updateNodeData]);

  data.onRun = handleRun;

  const baseStyle = {
    background: darkMode ? '#2a2a2a' : '#fafafa',
    color: darkMode ? '#eee' : '#000',
    border: '1px solid',
    borderColor: darkMode ? '#555' : '#ccc',
    minWidth: 260,
    padding: 10,
    position: 'relative'
  };

  return (
    <div style={baseStyle}>
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

      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Get</div>

      {/* Input handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="endpoint"
        style={{ top: 34 }}
        isConnectable={isConnectable}
        onClick={disconnectHandle('endpoint', 'target')}
      />
      <div style={{ position: 'absolute', top: 28, left: 24, fontSize: 10 }}>endpoint</div>

      <Handle
        type="target"
        position={Position.Left}
        id="pathParams"
        style={{ top: 56 }}
        isConnectable={isConnectable}
        onClick={disconnectHandle('pathParams', 'target')}
      />
      <div style={{ position: 'absolute', top: 50, left: 24, fontSize: 10 }}>pathParams</div>

      <Handle
        type="target"
        position={Position.Left}
        id="queryParams"
        style={{ top: 80 }}
        isConnectable={isConnectable}
        onClick={disconnectHandle('queryParams', 'target')}
      />
      <div style={{ position: 'absolute', top: 74, left: 24, fontSize: 10 }}>queryParams</div>

      {/* Run button */}
      {/* <button
        onClick={handleRun}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
        style={{ marginTop: 10 }}
      >
        Run GET Requests
      </button> */}
 <pre
        style={{
          marginTop: 50,
          maxHeight: 120,
          overflow: 'auto',
          fontSize: 10,
          background: darkMode ? '#2a2a2a' : '#fafafa',
          padding: 4,
          
          borderRadius: 3,
          color: darkMode ? '#eee' : '#000',
        }}
      >
      
      </pre>
      {/* Responses dropdown */}
      <div style={{ marginTop: 10, maxHeight: 300, overflowY: 'auto' }}>
        {responses.map((r, i) => (
          <div key={i} style={{ marginBottom: 8, position: 'relative' }}>
            <Handle
  type="source"
  position={Position.Right}
  id={`response_${i}`}  // This ensures each response gets a unique handle ID
  style={{ top: 20 }}
  isConnectable={isConnectable}
  onClick={disconnectHandle(`response_${i}`, 'source')}
/>

            <div
              onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
              style={{
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: 13,
                background: darkMode ? '#444' : '#eee',
                padding: '4px 6px',
                borderRadius: 4,
                paddingRight: 40
              }}
            >
              Response {i + 1}
            </div>
            {expandedIndex === i && (
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  background: darkMode ? '#333' : '#f5f5f5',
                  padding: 8,
                  borderRadius: 4,
                  fontSize: 11,
                  marginTop: 4
                }}
              >
                {JSON.stringify(r.result, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GetNode;
