import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const FraudReport = ({ verification, extractedText }) => {
  if (!verification && !extractedText) {
    return null;
  }

  const fraudScore = verification?.fraudScore ?? 0;
  const reasons = verification?.reasons ?? ["No verification data."];
  const documentStatus = verification?.documentStatus ?? "Unknown";
  
  const scoreColor = fraudScore > 70 ? '#F87171' : fraudScore > 30 ? '#FBBF24' : '#34D399';

  const chartData = {
    datasets: [{
      data: [fraudScore, 100 - fraudScore],
      backgroundColor: [scoreColor, '#4A5568'],
      borderColor: ['#1F2937'],
      circumference: 180,
      rotation: 270,
      borderWidth: 0,
    }],
  };

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid #4A5568', paddingTop: '1.5rem' }}>
      <h3 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Verification Report</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
        
        <div>
          <h4 style={{ marginBottom: '1rem' }}>Breakdown</h4>
          <div style={{ position: 'relative', maxWidth: '200px', margin: '0 auto 2rem auto' }}>
            <Doughnut data={chartData} options={{ cutout: '70%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }} />
            <div style={{ position: 'absolute', top: '60%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: scoreColor }}>{fraudScore}%</div>
              <div style={{ fontSize: '0.9rem', color: '#9CA3AF' }}>Fraud Risk</div>
            </div>
          </div>
          <ul style={{ listStyleType: 'none', padding: 0, fontSize: '0.9rem', color: '#D1D5DB' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Document Status:</span>
              <span style={{ fontWeight: 'bold', color: documentStatus === 'Valid' ? '#34D399' : '#F87171' }}>{documentStatus}</span>
            </li>
            {reasons.map((reason, i) => <li key={i} style={{ marginBottom: '4px' }}>- {reason}</li>)}
          </ul>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem' }}>Extracted Details</h4>
          {extractedText && Object.keys(extractedText).length > 0 ? (
            <ul className="text-sm space-y-2 text-gray-200" style={{ listStyleType: 'none', padding: 0 }}>
              {Object.entries(extractedText).map(([key, value]) => (
                value && (
                  <li key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '4px', marginBottom: '4px' }}>
                    <strong className="text-gray-400">{key}:</strong>
                    <span>{value}</span>
                  </li>
                )
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No text could be extracted.</p>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default FraudReport;