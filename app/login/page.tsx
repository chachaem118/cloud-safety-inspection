'use client';

import React, { useState } from 'react';

export default function SafetyApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('Safety Officer (จป.วิชาชีพ)');
  const [username, setUsername] = useState('Jumpoon H.');
  const [password, setPassword] = useState('');
  const [lang, setLang] = useState<'th' | 'zh'>('th');

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

  // ข้อความแปลภาษา (ไทย / จีน)
  const t = {
    th: {
      company: 'SUNSONG (THAILAND) CO., LTD.',
      title: '🔐 เข้าสู่ระบบ',
      subtitle: 'ระบบตรวจสอบความปลอดภัยออนไลน์',
      roleLabel: '👑 เลือกสิทธิ์การใช้งาน (Role)',
      userLabel: '👤 ชื่อผู้ใช้งาน (Username)',
      passLabel: '🔑 รหัสผ่าน (Password)',
      loginBtn: '🚀 เข้าสู่ระบบ (Login)',
      logoutBtn: 'ออกจากระบบ',
      dashboardTitle: '📋 รายการตรวจสอบความปลอดภัย',
      dashboardSub: 'ยินดีต้อนรับเข้าสู่ระบบ กรุณาเลือกหัวข้อที่ต้องการตรวจสอบด้านล่างนี้',
      card1Title: '🔍 ตรวจสอบความปลอดภัยประจำวัน',
      card1Desc: 'บันทึกผลการตรวจสอบสภาพแวดล้อมและอุปกรณ์ความปลอดภัยในพื้นที่ปฏิบัติงาน',
      card1Btn: 'เริ่มทำรายการ',
      card2Title: '📊 ประวัติและรายงาน',
      card2Desc: 'เรียกดูประวัติการตรวจสอบย้อนหลังและสถานะการดำเนินงานด้านความปลอดภัย',
      card2Btn: 'ดูรายงาน'
    },
    zh: {
      company: 'SUNSONG (THAILAND) CO., LTD.',
      title: '🔐 系统登录',
      subtitle: '在线安全检查系统',
      roleLabel: '👑 选择权限 (Role)',
      userLabel: '👤 用户名 (Username)',
      passLabel: '🔑 密码 (Password)',
      loginBtn: '🚀 登录 (Login)',
      logoutBtn: '退出登录',
      dashboardTitle: '📋 安全检查列表',
      dashboardSub: '欢迎使用系统，请选择下方需要检查的项目',
      card1Title: '🔍 日常安全检查',
      card1Desc: '记录工作场所的环境和安全设备检查结果',
      card1Btn: '开始检查',
      card2Title: '📊 历史与报告',
      card2Desc: '查看历史检查记录及安全运营状态',
      card2Btn: '查看报告'
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
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword('');
  };

  const currentText = t[lang];

  // หน้าแดชบอร์ดหลังเข้าสู่ระบบ
  if (isLoggedIn) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
        <nav style={{ backgroundColor: '#7A1C2E', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px' }}>{currentText.company}</h1>
            <span style={{ fontSize: '12px', opacity: 0.9 }}>Cloud Safety Inspection</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* ปุ่มเปลี่ยนภาษา */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px', borderRadius: '6px', display: 'flex', gap: '4px' }}>
              <button onClick={() => setLang('th')} style={{ background: lang === 'th' ? '#fff' : 'transparent', color: lang === 'th' ? '#7A1C2E' : '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>TH</button>
              <button onClick={() => setLang('zh')} style={{ background: lang === 'zh' ? '#fff' : 'transparent', color: lang === 'zh' ? '#7A1C2E' : '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>中文</button>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{username}</div>
              <div style={{ fontSize: '11px', backgroundColor: '#991b2a', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>{role}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{ backgroundColor: '#ffffff', color: '#7A1C2E', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
            >
              {currentText.logoutBtn}
            </button>
          </div>
        </nav>

        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
            <h2 style={{ color: '#1f2937', marginTop: 0 }}>{currentText.dashboardTitle}</h2>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>{currentText.dashboardSub}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                <h3 style={{ color: '#7A1C2E', marginTop: '0' }}>{currentText.card1Title}</h3>
                <p style={{ fontSize: '13px', color: '#4b5563' }}>{currentText.card1Desc}</p>
                <button style={{ backgroundColor: '#7A1C2E', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: '10px' }}>
                  {currentText.card1Btn}
                </button>
              </div>

              <div style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                <h3 style={{ color: '#7A1C2E', marginTop: '0' }}>{currentText.card2Title}</h3>
                <p style={{ fontSize: '13px', color: '#4b5563' }}>{currentText.card2Desc}</p>
                <button style={{ backgroundColor: '#374151', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: '10px' }}>
                  {currentText.card2Btn}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // หน้า Login ปกติ
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
      {/* ปุ่มสลับภาษาบนมุมขวาหน้า Login */}
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
