'use client';

import React, { useState } from 'react';

export default function LoginPage() {
  const [role, setRole] = useState('Safety Officer (จป.วิชาชีพ)');
  const [username, setUsername] = useState('Jumpoon H.');
  const [password, setPassword] = useState('');
  const [lang, setLang] = useState<'th' | 'zh'>('th');

  // รายชื่อพนักงานแยกตามสิทธิ์ที่คุณกำหนด
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

  // ข้อความแปลภาษา (ไทย / จีน)
  const t = {
    th: {
      company: 'SUNSONG (THAILAND) CO., LTD.',
      title: '🔐 เข้าสู่ระบบ',
      subtitle: 'ระบบตรวจสอบความปลอดภัยออนไลน์',
      roleLabel: '👑 เลือกสิทธิ์การใช้งาน (Role)',
      userLabel: '👤 ชื่อผู้ใช้งาน (Username)',
      passLabel: '🔑 รหัสผ่าน (Password)',
      loginBtn: '🚀 เข้าสู่ระบบ (Login)'
    },
    zh: {
      company: 'SUNSONG (THAILAND) CO., LTD.',
      title: '🔐 系统登录',
      subtitle: '在线安全检查系统',
      roleLabel: '👑 选择权限 (Role)',
      userLabel: '👤 用户名 (Username)',
      passLabel: '🔑 密码 (Password)',
      loginBtn: '🚀 登录 (Login)'
    }
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    if (usersByRole[newRole] && usersByRole[newRole].length > 0) {
      setUsername(usersByRole[newRole][0]);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(lang === 'th' ? `เข้าสู่ระบบสำเร็จ!\nสิทธิ์: ${role}\nผู้ใช้งาน: ${username}` : `登录成功！\n权限: ${role}\n用户: ${username}`);
  };

  const currentText = t[lang];

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#7A1C2E',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'sans-serif',
      position: 'relative'
    }}>
      {/* ปุ่มสลับภาษา TH / 中文 มุมขวาบน */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px', borderRadius: '6px', display: 'flex', gap: '4px' }}>
        <button onClick={() => setLang('th')} style={{ background: lang === 'th' ? '#fff' : 'transparent', color: lang === 'th' ? '#7A1C2E' : '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>TH</button>
        <button onClick={() => setLang('zh')} style={{ background: lang === 'zh' ? '#fff' : 'transparent', color: lang === 'zh' ? '#7A1C2E' : '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>中文</button>
      </div>

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
          {currentText.company}
        </div>
        <h2 style={{ color: '#1f2937', marginBottom: '4px', fontSize: '24px' }}>
          {currentText.title}
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '30px' }}>
          {currentText.subtitle}
        </p>

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          {/* ดรอปดาวน์เลือกสิทธิ์ */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>
              {currentText.roleLabel}
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

          {/* ดรอปดาวน์เลือกชื่อผู้ใช้งานตามสิทธิ์ */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>
              {currentText.userLabel}
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
              {currentText.passLabel}
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
            {currentText.loginBtn}
          </button>
        </form>
      </div>
    </main>
  );
}
