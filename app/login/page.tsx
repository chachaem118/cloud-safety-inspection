'use client';

import React, { useState } from 'react';

export default function LoginPage() {
  const [role, setRole] = useState('Safety Officer (จป.วิชาชีพ)');
  const [username, setUsername] = useState('Jumpoon H.');
  const [password, setPassword] = useState('');

  // รายชื่อพนักงานแยกตามสิทธิ์
  const usersByRole: { [key: string]: string[] } = {
    'Safety Officer (จป.วิชาชีพ)': ['Jumpoon H.', 'Hao N.'],
    'Manager / Supervisor (ผู้บริหาร)': ['Yan n G.', 'Li K.'],
    'General Staff (พนักงานทั่วไป)': [
      'Siriporn N.',
      'Wannisa P.',
      'Kroegrit K.',
      'Wiriya K.',
      'Nway Thet Thet Maung',
      'Zhang S.',
      'Wang Y.',
      'Yu Peng.',
      'Peng J.',
      'Zhao Z.'
    ]
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    // ตั้งค่าชื่อแรกในกลุ่มนั้นเป็นค่าเริ่มต้นอัตโนมัติ
    if (usersByRole[newRole] && usersByRole[newRole].length > 0) {
      setUsername(usersByRole[newRole][0]);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`เข้าสู่ระบบสำเร็จ!\nสิทธิ์: ${role}\nผู้ใช้งาน: ${username}`);
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#7A1C2E',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '14px', color: '#7A1C2E', fontWeight: 'bold', marginBottom: '8px' }}>
          SUNSONG (THAILAND) CO., LTD.
        </div>
        <h2 style={{ color: '#1f2937', marginBottom: '4px', fontSize: '24px' }}>
          🔐 เข้าสู่ระบบ
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '30px' }}>
          ระบบตรวจสอบความปลอดภัยออนไลน์
        </p>

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          {/* เลือกสิทธิ์การใช้งาน (Role) */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>
              👑 เลือกสิทธิ์การใช้งาน (Role)
            </label>
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                backgroundColor: '#fff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="Safety Officer (จป.วิชาชีพ)">Safety Officer (จป.วิชาชีพ)</option>
              <option value="Manager / Supervisor (ผู้บริหาร)">Manager / Supervisor (ผู้บริหาร)</option>
              <option value="General Staff (พนักงานทั่วไป)">General Staff (พนักงานทั่วไป)</option>
            </select>
          </div>

          {/* เลือกชื่อผู้ใช้งาน (Username) ตาม Role */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>
              👤 ชื่อผู้ใช้งาน (Username)
            </label>
            <select
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                backgroundColor: '#fff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              {usersByRole[role]?.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* ช่องกรอกรหัสผ่าน */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>
              🔑 รหัสผ่าน (Password)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* ปุ่มเข้าสู่ระบบ */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#991b2a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(153, 27, 42, 0.3)'
            }}
          >
            🚀 เข้าสู่ระบบ (Login)
          </button>
        </form>
      </div>
    </main>
  );
}
