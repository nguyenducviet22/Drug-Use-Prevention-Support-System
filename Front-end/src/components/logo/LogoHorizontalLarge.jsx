import React from 'react';
import Logo from './Logo';

const LogoHorizontalLarge = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
    borderRadius: '18px',
    boxShadow: '0 6px 24px 0 rgba(0,0,0,0.07)',
    padding: '2.5rem',
    maxWidth: '520px',
    margin: '2rem auto'
  }}>
    <div style={{
      color: '#374151',
      fontWeight: 600,
      fontSize: '1.35rem',
      marginBottom: '1.5rem',
      textAlign: 'center'
    }}>
    </div>
    <Logo size="large" variant="horizontal" />
  </div>
);

export default LogoHorizontalLarge; 