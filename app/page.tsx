'use client';

import React, { useState } from 'react';

export default function SafetyApp() {
  const [role, setRole] = useState('Safety Officer (จป.วิชาชีพ)');
  const [username, setUsername] = useState('Jumpoon H.');
  const [lang, setLang] = useState<'th' | 'zh'>('th');
  const [currentView, setCurrentView] = useState<'menu' | 'report' | 'form'>('menu');

  // รายชื่อพนักงานแยกตามสิทธิ์
  const usersByRole: { [key: string]: string[] } = {
    'Safety Officer (จป.วิชาชีพ)': ['Jumpoon H.', 'Hao N.'],
    'Manager / Supervisor (ผู้บริหาร)': ['Yan n G.', 'Li K.'],
    'General Staff (พนักงานทั่วไป)': [
      'Siriporn N.', 'Wannisa P.', 'Kroegrit K.', 'Wiriya K.', 
      'Nway Thet Thet Maung', 'Zhang S.', 'Wang Y.', 'Yu Peng.', 'Peng J.', 'Zhao Z.'
    ]
  };

  // 9 หัวข้อการตรวจสอบความปลอดภัย (ไทย / จีน)
  const inspectionItems = [
    { id: 1, th: 'ความเป็นระเบียบและสภาพพื้นที่การทำงาน', zh: '作业现场整洁与工作环境状况' },
    { id: 2, th: 'เครื่องจักรและอุปกรณ์', zh: '机械设备与工具' },
    { id: 3, th: 'ความปลอดภัยด้านไฟฟ้า', zh: '用电安全' },
    { id: 4, th: 'การควบคุมและใช้งานอุปกรณ์ PPE', zh: '个人防护用品（PPE）的管理与使用' },
    { id: 5, th: 'วิธีการทำงานอย่างปลอดภัย', zh: '安全作业方法' },
    { id: 6, th: 'การป้องกันอัคคีภัยและทางหนีไฟ', zh: '消防安全与疏散通道' },
    { id: 7, th: 'ความปลอดภัยด้านคลังสินค้าและการขนย้าย', zh: '仓储与搬运安全' },
    { id: 8, th: 'การคัดแยกขยะ/ของเสีย', zh: '垃圾/废弃物分类分拣' },
    { id: 9, th: 'การจัดการและควบคุมสารเคมี', zh: '化学品管理与控制' }
  ];

  // ข้อความรองรับ 2 ภาษา
  const t = {
    th: {
      company: 'SUNSONG (THAILAND) CO., LTD.',
      subtitle: 'Cloud Safety Inspection',
      roleLabel: 'สิทธิ์:',
      userLabel: 'ผู้ใช้:',
      welcomeTitle: '📋 ระบบตรวจสอบความปลอดภัย (9 Steps)',
      welcomeSub: 'ยินดีต้อนรับเข้าสู่ระบบ กรุณาเลือกหัวข้อที่ต้องการตรวจสอบด้านล่างนี้',
      card1Title: '🔍 ตรวจสอบความปลอดภัยประจำวัน',
      card1Desc: 'บันทึกผลการตรวจสอบ 9 หัวข้อความปลอดภัยในพื้นที่ปฏิบัติงาน',
      card1Btn: 'เริ่มทำรายการ (9 ข้อ)',
      card2Title: '📊 ประวัติและรายงาน',
      card2Desc: 'เรียกดูประวัติการตรวจสอบย้อนหลังและสถานะการดำเนินงานด้านความปลอดภัย',
      card2Btn: 'ดูรายงาน',
      backBtn: '⬅️ กลับหน้าหลัก',
      formTitle: '📝 ฟอร์มบันทึกผลการตรวจสอบความปลอดภัย (9 ขั้นตอน)',
      formSub: 'กรุณาตรวจสอบและประเมินความปลอดภัยตามหัวข้อด้านล่างนี้',
      statusPass: 'ปกติ (Pass)',
      statusUnsafe: 'พบความเสี่ยง (Unsafe)',
      notePlaceholder: 'ระบุรายละเอียดหรือข้อเสนอแนะเพิ่มเติม...',
      submitBtn: '💾 บันทึกผลการตรวจสอบ',
      filterDept: 'ทุกแผนก (All Departments)',
      filterYear: 'ปี 2026',
      filterMonth: 'ทุกเดือน (All Months)',
      printBtn: 'พิมพ์รายงาน (Print)',
      refreshBtn: 'รีเฟรช',
      addBtn: '+ บันทึกใหม่',
      tableTitle: 'รายงานสรุปรายการความเสี่ยง และกำหนดเวลาแก้ไข (Due Date)',
      colCode: 'รหัสเคส',
      colType: 'ประเภท / วันที่ตรวจฯ',
      colDept: 'แผนก / โซน',
      colDue: 'กำหนดแก้ไข (Due Date)',
      colImages: 'รูปก่อน / รูปหลัง',
      colStatus: 'สถานะ',
      colAction: 'ตรวจสอบ / อนุมัติ',
      statusClosed: 'CLOSED',
      actionUpdate: '✏️ ปิดเคสแล้ว'
    },
    zh: {
      company: 'SUNSONG (THAILAND) CO., LTD.',
      subtitle: '在线安全检查系统',
      roleLabel: '权限:',
      userLabel: '用户:',
      welcomeTitle: '📋 安全检查系统 (9 Steps)',
      welcomeSub: '欢迎使用系统，请选择下方需要检查的项目',
      card1Title: '🔍 日常安全检查',
      card1Desc: '记录工作场所9项安全检查结果',
      card1Btn: '开始检查 (9项)',
      card2Title: '📊 历史与报告',
      card2Desc: '查看历史检查记录及安全运营状态',
      card2Btn: '查看报告',
      backBtn: '⬅️ 返回主页',
      formTitle: '📝 安全检查记录表 (9个步骤)',
      formSub: '请根据以下项目进行安全检查与评估',
      statusPass: '正常 (Pass)',
      statusUnsafe: '发现隐患 (Unsafe)',
      notePlaceholder: '填写详细说明或整改建议...',
      submitBtn: '💾 保存检查结果',
      filterDept: '所有部门 (All Departments)',
      filterYear: '2026年',
      filterMonth: '所有月份 (All Months)',
      printBtn: '打印报告 (Print)',
      refreshBtn: '刷新',
      addBtn: '+ 新增记录',
      tableTitle: '风险汇总报告及整改期限 (Due Date)',
      colCode: '案例编号',
      colType: '类型 / 检查日期',
      colDept: '部门 / 区域',
      colDue: '整改期限 (Due Date)',
      colImages: '整改前 / 整改后',
      colStatus: '状态',
      colAction: '检查 / 批准',
      statusClosed: 'CLOSED',
      actionUpdate: '✏️ 已关闭'
    }
  };

  const currentText = t[lang];

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    if (usersByRole[newRole] && usersByRole[newRole].length > 0) {
      setUsername(usersByRole[newRole][0]);
    }
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
      {/* Navbar ด้านบน */}
      <nav style={{ backgroundColor: '#7A1C2E', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '18px' }}>{currentText.company}</h1>
          <span style={{ fontSize: '12px', opacity: 0.9 }}>{currentText.subtitle}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: '8px' }}>
            <div>
              <span style={{ fontSize: '11px', opacity: 0.8, marginRight: '4px' }}>{currentText.roleLabel}</span>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                style={{ padding: '4px 6px', borderRadius: '4px', fontSize: '12px', border: 'none', backgroundColor: '#fff', color: '#333', cursor: 'pointer' }}
              >
                <option value="Safety Officer (จป.วิชาชีพ)">Safety Officer (จป.วิชาชีพ)</option>
                <option value="Manager / Supervisor (ผู้บริหาร)">Manager / Supervisor (ผู้บริหาร)</option>
                <option value="General Staff (พนักงานทั่วไป)">General Staff (พนักงานทั่วไป)</option>
              </select>
            </div>

            <div>
              <span style={{ fontSize: '11px', opacity: 0.8, marginRight: '4px' }}>{currentText.userLabel}</span>
              <select
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ padding: '4px 6px', borderRadius: '4px', fontSize: '12px', border: 'none', backgroundColor: '#fff', color: '#333', cursor: 'pointer' }}
              >
                {usersByRole[role]?.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ปุ่มสลับภาษา TH / 中文 */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px', borderRadius: '6px', display: 'flex', gap: '4px' }}>
            <button onClick={() => setLang('th')} style={{ background: lang === 'th' ? '#fff' : 'transparent', color: lang === 'th' ? '#7A1C2E' : '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>TH</button>
            <button onClick={() => setLang('zh')} style={{ background: lang === 'zh' ? '#fff' : 'transparent', color: lang === 'zh' ? '#7A1C2E' : '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>中文</button>
          </div>
        </div>
      </nav>

      {/* หน้าที่ 1: เมนูหลัก */}
      {currentView === 'menu' && (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#1f2937', marginTop: 0 }}>{currentText.welcomeTitle}</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '25px' }}>{currentText.welcomeSub}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                <h3 style={{ color: '#7A1C2E', marginTop: '0' }}>{currentText.card1Title}</h3>
                <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '20px' }}>{currentText.card1Desc}</p>
                <button 
                  onClick={() => setCurrentView('form')}
                  style={{ backgroundColor: '#7A1C2E', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
                >
                  {currentText.card1Btn}
                </button>
              </div>

              <div style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                <h3 style={{ color: '#7A1C2E', marginTop: '0' }}>{currentText.card2Title}</h3>
                <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '20px' }}>{currentText.card2Desc}</p>
                <button 
                  onClick={() => setCurrentView('report')}
                  style={{ backgroundColor: '#374151', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
                >
                  {currentText.card2Btn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* หน้าที่ 2: ฟอร์มบันทึกผลการตรวจสอบความปลอดภัย 9 หัวข้อ */}
      {currentView === 'form' && (
        <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
          <button 
            onClick={() => setCurrentView('menu')}
            style={{ backgroundColor: '#4b5563', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}
          >
            {currentText.backBtn}
          </button>

          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#1f2937', marginTop: 0 }}>{currentText.formTitle}</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '25px' }}>{currentText.formSub}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {inspectionItems.map((item, index) => (
                <div key={item.id} style={{ border: '1px solid #e5e7eb', padding: '16px', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                  <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '10px', fontSize: '15px' }}>
                    {index + 1}. {lang === 'th' ? item.th : item.zh}
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'normal' }}>{lang === 'th' ? item.zh : item.th}</div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#059669' }}>
                      <input type="radio" name={`item_${item.id}`} defaultChecked /> {currentText.statusPass}
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#dc2626' }}>
                      <input type="radio" name={`item_${item.id}`} /> {currentText.statusUnsafe}
                    </label>
                    <input 
                      type="text" 
                      placeholder={currentText.notePlaceholder} 
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', minWidth: '220px' }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => { alert(lang === 'th' ? 'บันทึกข้อมูลสำเร็จ!' : '保存成功！'); setCurrentView('report'); }}
              style={{ width: '100%', marginTop: '30px', backgroundColor: '#7A1C2E', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(122, 28, 46, 0.3)' }}
            >
              {currentText.submitBtn}
            </button>
          </div>
        </div>
      )}

      {/* หน้าที่ 3: แดชบอร์ดตารางสรุปรายงานและความเสี่ยง */}
      {currentView === 'report' && (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
          <button 
            onClick={() => setCurrentView('menu')}
            style={{ backgroundColor: '#4b5563', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}
          >
            {currentText.backBtn}
          </button>

          {/* แถบตัวกรอง */}
          <div style={{ backgroundColor: 'white', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#4b5563' }}>🔍 ตัวกรอง:</span>
              <select style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}><option>{currentText.filterDept}</option></select>
              <select style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}><option>{currentText.filterYear}</option></select>
              <select style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}><option>{currentText.filterMonth}</option></select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>🖨️ {currentText.printBtn}</button>
              <button style={{ backgroundColor: '#4b5563', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>🔄 {currentText.refreshBtn}</button>
              <button onClick={() => setCurrentView('form')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>{currentText.addBtn}</button>
            </div>
          </div>

          {/* การ์ดสถิติ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '25px' }}>
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', padding: '20px', borderRadius: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#b45309', marginBottom: '8px' }}>⚠️ UNSAFE ACT</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#92400e' }}>0</div>
            </div>
            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', padding: '20px', borderRadius: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#b91c1c', marginBottom: '8px' }}>🚨 UNSAFE CONDITION</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#991b1b' }}>2</div>
            </div>
            <div style={{ backgroundColor: '#f3e8ff', border: '1px solid #a855f7', padding: '20px', borderRadius: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#7e22ce', marginBottom: '8px' }}>⚠️ NEAR MISS</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#6b21a8' }}>0</div>
            </div>
            <div style={{ backgroundColor: '#ffe4e6', border: '1px solid #f43f5e', padding: '20px', borderRadius: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#be123c', marginBottom: '8px' }}>⏰ OVERDUE</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#881337' }}>0</div>
            </div>
          </div>

          {/* ตารางรายงานสรุปความเสี่ยง */}
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937', fontSize: '16px' }}>
              📋 {currentText.tableTitle}
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#4b5563' }}>
                    <th style={{ padding: '12px' }}>{currentText.colCode}</th>
                    <th style={{ padding: '12px' }}>{currentText.colType}</th>
                    <th style={{ padding: '12px' }}>{currentText.colDept}</th>
                    <th style={{ padding: '12px' }}>{currentText.colDue}</th>
                    <th style={{ padding: '12px' }}>{currentText.colImages}</th>
                    <th style={{ padding: '12px' }}>{currentText.colStatus}</th>
                    <th style={{ padding: '12px' }}>{currentText.colAction}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '14px', fontWeight: 'bold', color: '#991b2a' }}>HZ-2026-817353</td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 'bold', color: '#374151' }}>Unsafe Condition</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>2026-09-12</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 'bold' }}>Engineer</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>(Factory 3) / คุณสมชาย</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ color: '#2563eb', fontWeight: 'bold' }}>📅 2026-09-19</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#e5e7eb', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>รูปก่อน</div>
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#e5e7eb', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>รูปหลัง</div>
                      </div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>{currentText.statusClosed}</span>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>ปิดโดย: {username}</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <button style={{ backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #059669', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>{currentText.actionUpdate}</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
         
