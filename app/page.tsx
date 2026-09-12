'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SafetyInspectionForm() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const [lang, setLang] = useState<'TH' | 'CN'>('TH');

  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  
  // 📋 ค่าเริ่มต้นประเภทการตรวจ 9 หมวด
  const [type, setType] = useState('1. ความเป็นระเบียบและสภาพพื้นที่การทำงาน (作业现场整洁与工作环境状况)');
  const [department, setDepartment] = useState('Assembly');
  const [zone, setZone] = useState('Factory 1');
  const [responsible, setResponsible] = useState('Jumpoon H');
  const [riskLevel, setRiskLevel] = useState('Low');
  const [likelihood, setLikelihood] = useState(2);
  const [severity, setSeverity] = useState(2);
  const [dueDays, setDueDays] = useState(7);
  const [description, setDescription] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('sunsong_safety_auth');
    const user = sessionStorage.getItem('sunsong_safety_user');
    const role = sessionStorage.getItem('sunsong_safety_role');

    if (auth !== 'true') {
      router.push('/login');
    } else {
      setCurrentUser(user);
      setCurrentRole(role);
      setCheckingAuth(false);
    }
  }, [router]);

  const riskScore = likelihood * severity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = null;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('hazard-photos')
        .upload(fileName, imageFile);

      if (uploadError) {
        alert(lang === 'TH' ? `อัปโหลดรูปภาพไม่สำเร็จ: ${uploadError.message}` : `上传图片失败: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('hazard-photos')
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    const hazardNo = `HZ-${Math.floor(1000 + Math.random() * 9000)}`;

    const { error } = await supabase.from('hazards').insert([
      {
        hazard_no: hazardNo,
        inspection_date: inspectionDate,
        type,
        department,
        zone,
        responsible,
        risk_level: riskLevel,
        likelihood,
        severity,
        risk_score: riskScore,
        due_days: Number(dueDays),
        description,
        image_url: imageUrl,
        status: 'OPEN',
      },
    ]);

    setLoading(false);

    if (error) {
      alert(lang === 'TH' ? `เกิดข้อผิดพลาดในการบันทึก: ${error.message}` : `保存错误: ${error.message}`);
    } else {
      alert(lang === 'TH' ? `✅ บันทึกรายงานความปลอดภัยสำเร็จ! รหัสเคส: ${hazardNo}` : `✅ 安全报告保存成功! 编号: ${hazardNo}`);
      setDescription('');
      setImageFile(null);
      router.push('/dashboard');
    }
  };

  if (checkingAuth) {
    return <div style={{ textAlign: 'center', padding: '100px', fontSize: '18px', fontWeight: 'bold' }}>กำลังตรวจสอบสิทธิ์การใช้งาน...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf2f4 0%, #f1f5f9 50%, #e2e8f0 100%)', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '750px', margin: '0 auto', background: '#ffffff', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '2px solid #cbd5e1' }}>
        
        {/* Header & Language Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '900', color: '#881337', letterSpacing: '1px', marginBottom: '6px' }}>
              🔴 SUNSONG (THAILAND) CO., LTD. {lang === 'CN' && '松宋（泰国）有限公司'}
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', margin: 0 }}>
              {lang === 'TH' ? '🚨 บันทึกรายการตรวจสอบความปลอดภัย' : '🚨 记录安全检查项目'}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              onClick={() => setLang(lang === 'TH' ? 'CN' : 'TH')}
              style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '13px', color: '#334155' }}
            >
              {lang === 'TH' ? '🇨🇳 中文' : '🇹🇭 ไทย'}
            </button>
            <a href="/dashboard" style={{ color: '#2563eb', fontSize: '13px', fontWeight: '800', textDecoration: 'none' }}>
              {lang === 'TH' ? '📊 Dashboard' : '📊 仪表盘'} &rarr;
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                {lang === 'TH' ? '📅 วันที่ตรวจ (Inspection Date)' : '📅 检查日期 (Inspection Date)'}
              </label>
              <input 
                type="date" 
                value={inspectionDate} 
                onChange={(e) => setInspectionDate(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '14px', backgroundColor: '#f8fafc', fontWeight: '600', boxSizing: 'border-box', outline: 'none' }}
                required 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                {lang === 'TH' ? '⚡ รายการตรวจ (Inspection Item)' : '⚡ 检查项目 (Inspection Item)'}
              </label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '13px', backgroundColor: '#f8fafc', fontWeight: '600', boxSizing: 'border-box', outline: 'none' }}
              >
                <option value="1. ความเป็นระเบียบและสภาพพื้นที่การทำงาน (作业现场整洁与工作环境状况)">1. ความเป็นระเบียบและสภาพพื้นที่การทำงาน (作业现场整洁与工作环境状况)</option>
                <option value="2. เครื่องจักรและอุปกรณ์ (机械设备与工具)">2. เครื่องจักรและอุปกรณ์ (机械设备与工具)</option>
                <option value="3. ความปลอดภัยด้านไฟฟ้า (用电安全)">3. ความปลอดภัยด้านไฟฟ้า (用电安全)</option>
                <option value="4. การควบคุมและใช้งานอุปกรณ์ PPE (个人防护用品（PPE）的管理与使用)">4. การควบคุมและใช้งานอุปกรณ์ PPE (个人防护用品（PPE）的管理与使用)</option>
                <option value="5. วิธีการทำงานอย่างปลอดภัย (安全作业方法)">5. วิธีการทำงานอย่างปลอดภัย (安全作业方法)</option>
                <option value="6. การป้องกันอัคคีภัยและทางหนีไฟ (消防安全与疏散通道)">6. การป้องกันอัคคีภัยและทางหนีไฟ (消防安全与疏散通道)</option>
                <option value="7. ความปลอดภัยด้านคลังสินค้าและการขนย้าย (仓储与搬运安全)">7. ความปลอดภัยด้านคลังสินค้าและการขนย้าย (仓储与搬运安全)</option>
                <option value="8. การคัดแยกขยะ/ของเสีย (垃圾/废弃物分类分拣)">8. การคัดแยกขยะ/ของเสีย (垃圾/废弃物分类分拣)</option>
                <option value="9. การจัดการและควบคุมสารเคมี (化学品管理与控制)">9. การจัดการและควบคุมสารเคมี (化学品管理与控制)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                {lang === 'TH' ? '🏢 แผนก (Department)' : '🏢 部门 (Department)'}
              </label>
              <select 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '14px', backgroundColor: '#f8fafc', fontWeight: '600', boxSizing: 'border-box', outline: 'none' }}
              >
                <option value="Assembly">Assembly {lang === 'CN' && '(总装)'}</option>
                <option value="Metal">Metal {lang === 'CN' && '(金属)'}</option>
                <option value="Hose">Hose {lang === 'CN' && '(胶管)'}</option>
                <option value="Tesla">Tesla {lang === 'CN' && '(特斯拉)'}</option>
                <option value="Engineer">Engineer {lang === 'CN' && '(工程)'}</option>
                <option value="Quality Control">Quality Control {lang === 'CN' && '(品质控制)'}</option>
                <option value="Other">Other {lang === 'CN' && '(其他)'}</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                {lang === 'TH' ? '📍 โซนพื้นที่ (Zone)' : '📍 区域 (Zone)'}
              </label>
              <select 
                value={zone} 
                onChange={(e) => setZone(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '14px', backgroundColor: '#f8fafc', fontWeight: '600', boxSizing: 'border-box', outline: 'none' }}
              >
                <option value="Factory 1">Factory 1 {lang === 'CN' && '(一厂)'}</option>
                <option value="Factory 2">Factory 2 {lang === 'CN' && '(二厂)'}</option>
                <option value="Factory 3">Factory 3 {lang === 'CN' && '(三厂)'}</option>
                <option value="Warehouse">Warehouse {lang === 'CN' && '(仓库)'}</option>
                <option value="Office">Office {lang === 'CN' && '(办公室)'}</option>
                <option value="Other">Other {lang === 'CN' && '(其他)'}</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                {lang === 'TH' ? '👤 ผู้รับผิดชอบแก้ไข' : '👤 负责整改人员'}
              </label>
              <input 
                type="text" 
                value={responsible} 
                onChange={(e) => setResponsible(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '14px', backgroundColor: '#f8fafc', fontWeight: '600', boxSizing: 'border-box', outline: 'none' }}
                required 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                {lang === 'TH' ? '⏱️ กำหนดเวลาแก้ไข (SLA)' : '⏱️ 整改期限 (SLA)'}
              </label>
              <select 
                value={dueDays} 
                onChange={(e) => setDueDays(Number(e.target.value))}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '14px', backgroundColor: '#f8fafc', fontWeight: '800', color: '#881337', boxSizing: 'border-box', outline: 'none' }}
              >
                <option value={3}>{lang === 'TH' ? 'ภายใน 3 วัน' : '3天内'}</option>
                <option value={7}>{lang === 'TH' ? 'ภายใน 7 วัน' : '7天内'}</option>
                <option value={15}>{lang === 'TH' ? 'ภายใน 15 วัน' : '15天内'}</option>
                <option value={30}>{lang === 'TH' ? 'ภายใน 30 วัน' : '30天内'}</option>
              </select>
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', fontWeight: '900', color: '#1e293b' }}>
              {lang === 'TH' ? '⚠️ การประเมินความเสี่ยง (Risk Assessment)' : '⚠️ 风险评估 (Risk Assessment)'}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '5px' }}>{lang === 'TH' ? 'โอกาสเกิด' : '可能性'}</label>
                <input type="number" min={1} max={5} value={likelihood} onChange={(e) => setLikelihood(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: '600', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '5px' }}>{lang === 'TH' ? 'ความรุนแรง' : '严重性'}</label>
                <input type="number" min={1} max={5} value={severity} onChange={(e) => setSeverity(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: '600', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '5px' }}>{lang === 'TH' ? 'ระดับความเสี่ยง' : '风险等级'}</label>
                <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: '800', color: riskLevel === 'High' ? '#dc2626' : '#16a34a', boxSizing: 'border-box' }}>
                  <option value="Low">Low ({lang === 'TH' ? 'ต่ำ' : '低'})</option>
                  <option value="Medium">Medium ({lang === 'TH' ? 'ปานกลาง' : '中'})</option>
                  <option value="High">High ({lang === 'TH' ? 'สูง' : '高'})</option>
                </select>
              </div>
            </div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              {lang === 'TH' ? '🧮 คะแนนความเสี่ยงรวม (Risk Score):' : '🧮 风险总分 (Risk Score):'} <span style={{ color: '#881337', fontSize: '16px' }}>{riskScore}</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
              {lang === 'TH' ? '📝 รายละเอียดข้อบกพร่อง / ความไม่ปลอดภัย' : '📝 缺陷详情 / 不安全描述'}
            </label>
            <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={lang === 'TH' ? 'ระบุรายละเอียดลักษณะความไม่ปลอดภัยที่พบ...' : '请详细描述发现的安全隐患...'} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '14px', backgroundColor: '#f8fafc', fontWeight: '600', boxSizing: 'border-box', outline: 'none' }} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
              {lang === 'TH' ? '📸 แนบรูปถ่ายหลักฐานหน้างาน (Before Photo)' : '📸 现场照片 (Before Photo)'}
            </label>
            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]); }} style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '13px', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} />
          </div>

          <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #881337 0%, #be123c 100%)', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '16px', boxShadow: '0 8px 25px rgba(136, 19, 55, 0.35)', marginTop: '10px' }}>
            {loading ? (lang === 'TH' ? 'กำลังบันทึกข้อมูล...' : '正在保存...') : (lang === 'TH' ? '💾 ส่งรายงานความปลอดภัย (Submit Hazard Report)' : '💾 提交安全报告 (Submit Hazard Report)')}
          </button>
        </form>
      </div>
    </div>
  );
}