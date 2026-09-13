'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState('Safety Officer (จป.วิชาชีพ)');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [lang, setLang] = useState<'TH' | 'CN'>('TH');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      alert(lang === 'TH' ? '⚠️ กรุณากรอกชื่อผู้ใช้งาน' : '⚠️ 请输入用户名');
      return;
    }

    // บันทึกสิทธิ์และชื่อลง sessionStorage
    sessionStorage.setItem('sunsong_safety_auth', 'true');
    sessionStorage.setItem('sunsong_safety_user', username);
    sessionStorage.setItem('sunsong_safety_role', role);

    alert(lang === 'TH' ? `🎉 ยินดีต้อนรับคุณ ${username}เข้าสู่ระบบ!` : `🎉 欢迎 ${username} 登录系统!`);
    router.push('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #881337 0%, #4c0519 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* 🌐 ปุ่มสลับภาษา (มุมขวาบน) */}
      <div style={{ position: 'absolute', top: '25px', right: '30px' }}>
        <button 
          onClick={() => setLang(lang === 'TH' ? 'CN' : 'TH')}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.4)', padding: '8px 16px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '13px', color: '#ffffff' }}
        >
          {lang === 'TH' ? '🇨🇳 中文' : '🇹🇭 ไทย'}
        </button>
      </div>

      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', width: '100%', maxWidth: '420px', border: '2px solid #fecdd3' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '13px', fontWeight: '900', color: '#881337', letterSpacing: '1px', marginBottom: '6px' }}>
            🔴 SUNSONG (THAILAND) CO., LTD. {lang === 'CN' && '松宋（泰国）有限公司'}
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', margin: 0 }}>
            {lang === 'TH' ? '🔐 เข้าสู่ระบบ' : '🔐 系统登录'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '6px 0 0 0', fontWeight: '600' }}>
            {lang === 'TH' ? 'ระบบตรวจสอบความปลอดภัยออนไลน์' : '在线安全检查与跟踪系统'}
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
              {lang === 'TH' ? '👑 เลือกสิทธิ์การใช้งาน (Role)' : '👑 选择用户角色 (Role)'}
            </label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '14px', backgroundColor: '#f8fafc', fontWeight: '800', color: '#881337', outline: 'none', cursor: 'pointer' }}
            >
              <option value="Safety Officer (จป.วิชาชีพ)">Safety Officer ({lang === 'TH' ? 'จป.วิชาชีพ' : '安全专员'})</option>
              <option value="Executive (ผู้บริหาร)">Executive ({lang === 'TH' ? 'ผู้บริหาร' : '高管'})</option>
              <option value="General Staff (พนักงานทั่วไป)">General Staff ({lang === 'TH' ? 'พนักงานทั่วไป (แนบรูปแก้)' : '普通员工 (上传整改照片)'})</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
              {lang === 'TH' ? '👤 ชื่อผู้ใช้งาน (Username)' : '👤 用户名 (Username)'}
            </label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder={lang === 'TH' ? 'ระบุชื่อของคุณ...' : '请输入您的姓名...'}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '14px', backgroundColor: '#f8fafc', fontWeight: '600', boxSizing: 'border-box', outline: 'none' }}
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
              {lang === 'TH' ? '🔑 รหัสผ่าน (Password)' : '🔑 密码 (Password)'}
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '14px', backgroundColor: '#f8fafc', fontWeight: '600', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            style={{ background: 'linear-gradient(135deg, #881337 0%, #be123c 100%)', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '16px', boxShadow: '0 8px 25px rgba(136, 19, 55, 0.35)', marginTop: '10px' }}
          >
            {lang === 'TH' ? '🚀 เข้าสู่ระบบ (Login)' : '🚀 登录系统 (Login)'}
          </button>
        </form>

      </div>
    </div>
  );
}
  
     
         
       
