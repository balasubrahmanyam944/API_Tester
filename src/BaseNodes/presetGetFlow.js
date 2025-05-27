// src/BaseNodes/presetGetFlow.js

export const presetGetFlow = (x = 200, y = 100) => {
    const spacingY = 120;
    const spacingX = 250;
  
    const nodes = [
      {
        id: 'text_updater',
        type: 'textUpdater',
        data: { label: 'https://reqres.in/api/users?page=2' },
        position: { x, y },
      },
      {
        id: 'get_node',
        type: 'GetNode',
        data: {},
        position: { x: x + spacingX, y },
      },
      
      {
        id: 'for_loop',
        type: 'ForLoopNode',
        data: {},
        position: { x: x + spacingX * 3, y: y - spacingY },
      },
      {
        id: 'check_valid',
        type: 'CheckForValidNode',
        data: {},
        position: { x: x + spacingX * 3, y: y + spacingY },
      },
      {
        id: 'test_node',
        type: 'testnode',
        data: {},
        position: { x: x + spacingX * 2, y },
      },
      {
        id: 'check_equal',
        type: 'CheckEqualNode',
        data: {},
        position: { x: x + spacingX * 3, y: y + spacingY * 2 },
      },
    ];
  
    const edges = [
      {
        id: 'e1',
        source: 'text_updater',
        sourceHandle: 'a',
        target: 'get_node',
        targetHandle: 'endpoint',
      },
      {
  id: 'e2',
  source: 'get_node',
  sourceHandle: 'response_0',
  target: 'test_node',
  targetHandle: 'top',
}
    ];
  
    return { nodes, edges };
  };
  