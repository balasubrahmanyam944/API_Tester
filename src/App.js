// App.js
import React, { useState, useCallback, useMemo } from 'react';
import { ReactFlowProvider } from '@xyflow/react';  
import FlowWithSelection from './BaseNodes/FlowWithSelection';
import TextUpdaterNode from './TextUpdaterNode';
import TestNode from './TestNode';
import './App.css'; // assuming you have styles here
import GetNode from './BaseNodes/GetNode';
import CheckForValidNode from './BaseNodes/CheckForValidNode';
import ForLoopNode from './BaseNodes/ForLoopNode';
import CheckEqualNode from './BaseNodes/CheckEqualNode';
import StartNode from './BaseNodes/StartNode';

const initialNodes = [
  // { id: '0', data: { label: 'Hello' }, position: { x: 0, y: 50 } },
  // { id: '1', type: 'output', data: { label: 'World' }, position: { x: 10, y: 100 } },
  // { id: '20', type: 'textUpdater', data: { label: '' }, position: { x: 10, y: 200 } },
  // { id: '3', type: 'testnode', position: { x: 10, y: 300 } },
  // { id: '5', type: 'GetNode', position: { x: 10, y: 400 } },
];

const initialEdges = [
  { id: '0-1', source: '0', target: '1', label: 'to the', type: 'step' },
];

export default function App() {
  const [flowData, setFlowData] = useState({
    nodes: initialNodes,
    edges: initialEdges,
  });
  const [darkMode, setDarkMode] = useState(false);
 const [isHovered, setIsHovered] = useState(false);
 const [isClicked, setIsClicked] = useState(false);
  const toggleTheme = () => setDarkMode((prev) => !prev);
  
  const nodeTypes = useMemo(() => ({
    StartNode: (props) => <StartNode {...props} darkMode={darkMode} />,
    textUpdater: (props) => <TextUpdaterNode {...props} darkMode={darkMode} />,
    testnode: (props) => <TestNode {...props} darkMode={darkMode} />,
    GetNode: (props) => <GetNode {...props} darkMode={darkMode} />,
    CheckForValidNode: (props) => <CheckForValidNode {...props} darkMode={darkMode} />,
    ForLoopNode: (props) => <ForLoopNode {...props} darkMode={darkMode} />,
    CheckEqualNode: (props) => <CheckEqualNode {...props} darkMode={darkMode} />,
  }), [darkMode]); // Only regenerate if darkMode changes
  
  // Unified handler for nodes/edges updates
  const onChange = useCallback(({ nodes, edges }) => {
    setFlowData({ nodes, edges });
  }, []);

  // These two are the callbacks that FlowWithSelection will invoke
  const handleCreateTextNode = useCallback((flowPos) => {
    setFlowData(fd => ({
      ...fd,
      nodes: [
        ...fd.nodes,
        {
          id: `text_${+new Date()}`,
          type: 'textUpdater',
          position: flowPos,
          data: { label: '' },
        }
      ]
    }));
  }, []);

  const handleCreateGetNode = useCallback((flowPos) => {
    setFlowData(fd => ({
      ...fd,
      nodes: [
        ...fd.nodes,
        {
          id: `get_${+new Date()}`,
          type: 'GetNode',
          position: flowPos,
          data: {}
        }
      ]
    }));
  }, []);
  const handleCreateTextUpdateNode = useCallback((flowPos) => {
    setFlowData(fd => ({
      ...fd,
      nodes: [
        ...fd.nodes,
        {
          id: `test_${+new Date()}`,
          type: 'testnode',
          position: flowPos,
          data: {}
        }
      ]
    }));
  }, []);
  const handleCreateValidationNode = useCallback((flowPos) => {
    setFlowData(fd => ({
      ...fd,
      nodes: [
        ...fd.nodes,
        {
          id: `valid_${+new Date()}`,
          type: 'CheckForValidNode',
          position: flowPos,
          data: {}
        }
      ]
    }));
  }, []);
  const handleCreateForLoopNode = useCallback((flowPos) => {
    setFlowData(fd => ({
      ...fd,
      nodes: [...fd.nodes, {
        id: `forloop_${+new Date()}`,
        type: 'ForLoopNode',
        position: flowPos,
        data: {},
      }]
    }));
  }, []);
  const handleCreateCheckEqualNode = useCallback((flowPos) => {
    setFlowData(fd => ({
      ...fd,
      nodes: [...fd.nodes, {
        id: `checkloop_${+new Date()}`,
        type: 'CheckEqualNode',
        position: flowPos,
        data: {},
      }]
    }));
  }, []);
  const handleCreateStartNode = useCallback((flowPos) => {
    setFlowData(fd => ({
      ...fd,
      nodes: [
        ...fd.nodes,
        {
          id: `start_${+new Date()}`,
          type: 'StartNode',       // ← must match the lookup above
          position: flowPos,
          data: { onRun: () => console.log('start!') }
        }
      ]
    }));
    
  }, []);
  const baseBackground = darkMode ? '#444' : '#ccc';
  const baseColor = darkMode ? '#fff' : '#000';

  // Slightly darker background for hover/click
  const hoverBackground = darkMode ? '#333' : '#bbb';
  const clickBackground = darkMode ? '#222' : '#aaa';
  const handleRunFlow = () => {
    const { nodes, edges } = flowData;
   setIsClicked(true); // Set clicked state
    // Your logic here
    setTimeout(() => setIsClicked(false), 200); // Optional: reset click after 200ms
    // look for the StartNode (capital “S”)
    const startNode = nodes.find(n => n.type === "StartNode");
    if (!startNode) return;
  
    const visited = new Set();
    const stack = [startNode.id];
  
    while (stack.length > 0) {
      const currentId = stack.pop();
      if (visited.has(currentId)) continue;
      visited.add(currentId);
  
      // follow every outgoing edge
      const outgoing = edges.filter(e => e.source === currentId);
      outgoing.forEach(e => {
        stack.push(e.target);
        const targetNode = nodes.find(n => n.id === e.target);
        // if that node has an onRun, call it
        if (targetNode?.data?.onRun) {
          targetNode.data.onRun();
        }
      });
    }
  };
  
   const backgroundColor = isClicked
    ? '#2e50b3'   // Clicked color
    : isHovered
    ? '#3b65d1'   // Hover color
    : '#5180f4';  // Default color
 const background = isClicked
    ? clickBackground
    : isHovered
    ? hoverBackground
    : baseBackground;

  return (
    <div className={darkMode ? 'dark-mode' : 'light-mode'} style={{ width: '100%', height: '100vh' }}>
      <div style={{display: 'flex', justifyContent: 'center', padding: 10, background: darkMode ? '#333' : '#eee' }}>
       <button
      onClick={handleRunFlow}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: backgroundColor,
        color: "white",
        height: "30px",
        width: "150px",
        borderRadius: 4,
        border: 'none',
        cursor: "pointer",
        transition: "background 0.2s ease" // smooth transition
      }}
    >
      Run
    </button></div>
     <button
      onClick={() => {
        setIsClicked(true);
        toggleTheme(); // trigger actual theme change
        setTimeout(() => setIsClicked(false), 150); // reset click effect
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsClicked(false); // reset click on mouse leave
      }}
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        padding: '6px 12px',
        borderRadius: 4,
        border: 'none',
        background: background,
        color: baseColor,
        cursor: "pointer",
        transition: 'background 0.2s ease'
      }}
    >
      Toggle {darkMode ? 'Light' : 'Dark'} Mode
    </button>
       <ReactFlowProvider>
      <FlowWithSelection
        nodes={flowData.nodes}
        edges={flowData.edges}
        onChange={onChange}
        nodeTypes={nodeTypes}
        onCreateTextNode={handleCreateTextNode}
        onCreateGetNode={handleCreateGetNode}
        onCreateTestNode={handleCreateTextUpdateNode}
        OnValidationNode={handleCreateValidationNode}
        onCreateForLoopNode={handleCreateForLoopNode}
        OnCreateCheckEqualNode={handleCreateCheckEqualNode}
        onStartNode={handleCreateStartNode}
        fitViewOptions={{ padding: 0.2 }}
        darkMode={darkMode} // pass to FlowWithSelection
      />
      </ReactFlowProvider>
    </div>
  );
}
