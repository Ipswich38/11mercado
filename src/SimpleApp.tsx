import React from 'react';

export default function SimpleApp() {
  console.log('SimpleApp component rendering');
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>Simple Test App - Port 3000</h1>
      <p>If you see this, React is working on the new port</p>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px', 
        borderRadius: '8px',
        marginTop: '20px',
        border: '1px solid #ccc'
      }}>
        <h3>Debug Info:</h3>
        <p>Port: 3000</p>
        <p>Time: {new Date().toLocaleTimeString()}</p>
        <button 
          onClick={() => alert('Button clicked!')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Click
        </button>
      </div>
    </div>
  );
}