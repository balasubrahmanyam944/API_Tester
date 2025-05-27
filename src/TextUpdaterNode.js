import { useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';

function TextUpdaterNode({ id, darkMode }) {
  const { updateNodeData, getEdges, setEdges } = useReactFlow();
  const [inputs, setInputs] = useState(['']); // multiple input support
  const { deleteElements } = useReactFlow();

  const handleChange = useCallback((index, value) => {
    const updated = [...inputs];
    updated[index] = value;
    setInputs(updated);
    updateNodeData(id, { label: updated });
  }, [inputs, id, updateNodeData]);

  const addInput = () => {
    setInputs([...inputs, '']);
  };

  const disconnectHandle = (handleId, type) => (e) => {
    if (e.ctrlKey) {
      const filtered = getEdges().filter(
        edge => !(edge[type] === id && edge[`${type}Handle`] === handleId)
      );
      setEdges(filtered);
    }
  };

  return (
    <div className={`text-updater-node ${darkMode ? 'dark' : ''}`}>
      <button
        onClick={() => deleteElements({ nodes: [{ id }] })}
        className="delete-button"
        title="Delete Node"
      >
        🗑Delete
      </button>

      <Handle
        type="target"
        position={Position.Left}
        onClick={disconnectHandle(null, 'target')}
      />

      {inputs.map((value, index) => (
        <div key={index} className="input-container">
          <label>Text {index + 1}:</label>
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(index, e.target.value)}
            className="nodrag input-field"
          />
        </div>
      ))}

      <button
        onClick={addInput}
        className="add-input-button"
      >
        ➕ Add Input
      </button>

      <Handle
        type="source"
        position={Position.Right}
        id="a"
        onClick={disconnectHandle('a', 'source')}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        onClick={disconnectHandle('b', 'source')}
      />
    </div>
  );
}

export default TextUpdaterNode;
