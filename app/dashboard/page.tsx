'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Hazard {
  id: number;
  hazard_no: string;
  inspection_date: string;
  type: string;
  department: string;
  zone: string;
  responsible: string;
  risk_level: string;
  description: string;
  image_url: string | null;
  after_image_url: string | null;
  status: string;
  due_days: number | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState('Safety Officer (จป.วิชาชีพ)');
  const [userName, setUserName] = useState('');
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ตัวกรองข้อมูล
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('All');

  // 🌐 สถานะภาษา: 'TH' หรือ 'CN'
  const [lang, setLang] = useState<'TH' | 'CN'>('TH');

  const [reviewModalItem, setReviewModalItem] = useState<Hazard | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const authStatus = sessionStorage.getItem('sunsong_safety_auth');
    const role = sessionStorage.getItem('sunsong_safety_role');
    const user = sessionStorage.getItem('sunsong_safety_user');
    
    if (authStatus !== 'true') {
      router.push('/login');
    } else {
      if (role) setUserRole(role);
      if (user) setUserName(user);
      fetchHazards();
    }
  }, [router]);

  const isGeneralStaff = userRole.includes('General Staff');

  const fetchHazards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hazards')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching hazards:', error.message);
    } else {
      setHazards(data || []);
    }
    setLoading(false);
  };

  const calculateDueDate = (inspectionDateStr: string, dueDays: number | null) => {
    if (!inspectionDateStr) return '';
    const days = dueDays || 7;
    const inspectDate = new Date(inspectionDateStr);
    inspectDate.setDate(inspectDate.getDate() + days);
    return inspectDate.toISOString().split('T')[0];
  };

  const checkOverdue = (inspectionDateStr: string, dueDays: number | null, status: string) => {
    if (status === 'CLOSED' || !inspectionDateStr) return false;
    const days = dueDays || 7;
    const inspectDate = new Date(inspectionDateStr);
    const dueDate = new Date(inspectDate);
    dueDate.setDate(dueDate.getDate() + days);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today > dueDate;
  };

  const handleQuickUploadAfter = async (itemId: number, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `after-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('hazard-photos')
      .upload(fileName, file);

    if (uploadError) {
      alert(lang === 'TH' ? `อัปโหลดรูปภาพไม่สำเร็จ: ${uploadError.message}` : `上传失败: ${uploadError.message}`);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('hazard-photos')
      .getPublicUrl(fileName);

    const afterImageUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from('hazards')
      .update({ after_image_url: afterImageUrl })
      .eq('id', itemId);

    if (updateError) {
      alert(lang === 'TH' ? `เกิดข้อผิดพลาดในการบันทึกรูป: ${updateError.message}` : `保存图片错误: ${updateError.message}`);
    } else {
      alert(lang === 'TH' ? '✅ แนบรูปถ่ายหลักฐานการแก้ไขสำเร็จ!' : '✅ 整改照片上传成功!');
      fetchHazards();
    }
  };

  const handleApproveCase = async (item: Hazard) => {
    const { error } = await supabase
      .from('hazards')
      .update({ status: 'CLOSED' })
      .eq('id', item.id);

    if (error) {
      alert(lang === 'TH' ? `เกิดข้อผิดพลาด: ${error.message}` : `错误: ${error.message}`);
    } else {
      alert(lang === 'TH' ? '✅ อนุมัติปิดเคสเรียบร้อยแล้ว!' : '✅ 批准关闭案件成功!');
      setReviewModalItem(null);
      fetchHazards();
    }
  };

  const handleRejectCase = async (item: Hazard) => {
    if (!rejectReason.trim()) {
      alert(lang === 'TH' ? '⚠️ กรุณาระบุเหตุผลที่ตีกลับ' : '⚠️ 请填写退回原因');
      return;
    }

    const { error } = await supabase
      .from('hazards')
      .update({
        status: 'OPEN',
        after_image_url: null,
      })
      .eq('id', item.id);

    if (error) {
      alert(lang === 'TH' ? `เกิดข้อผิดพลาด: ${error.message}` : `错误: ${error.message}`);
    } else {
      alert(lang === 'TH' ? `❌ ตีกลับเคสเรียบร้อยแล้ว\nเหตุผล: ${rejectReason}` : `❌ 已退回整改\n原因: ${rejectReason}`);
      setReviewModalItem(null);
      setRejectReason('');
      fetchHazards();
    }
  };

  const handlePrintSingleItem = (item: Hazard) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dueDateStr = calculateDueDate(item.inspection_date, item.due_days);

    printWindow.document.write(`
      <html>
        <head>
          <title>Safety Report - ${item.hazard_no}</title>
          <style>
            body { font-family: 'Sarabun', sans-serif; padding: 20px; color: #1e293b; }
            h2 { color: #881337; border-bottom: 2px solid #881337; padding-bottom: 8px; }
            .box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .img-container { display: flex; gap: 20px; margin-top: 15px; }
            .img-box { text-align: center; }
            img { width: 180px; height: 140px; object-fit: cover; border-radius: 6px; border: 1px solid #94a3b8; }
          </style>
        </head>
        <body>
          <h2>🔴 SUNSONG (THAILAND) CO., LTD. - Safety Inspection Report</h2>
          <div class="box">
            <div class="row"><strong>รหัสเคส (Case No):</strong> ${item.hazard_no}</div>
            <div class="row"><strong>รายการตรวจ (Inspection Item):</strong> ${item.type}</div>
            <div class="row"><strong>วันที่ตรวจ (Inspection Date):</strong> ${item.inspection_date}</div>
            <div class="row"><strong>แผนก / โซน (Dept / Zone):</strong> ${item.department} (${item.zone})</div>
            <div class="row"><strong>ผู้รับผิดชอบ (Responsible):</strong> ${item.responsible}</div>
            <div class="row"><strong>กำหนดแก้ไข (Due Date):</strong> ${dueDateStr}</div>
            <div class="row"><strong>สถานะ (Status):</strong> ${item.status}</div>
            <div class="row"><strong>รายละเอียด (Description):</strong> ${item.description || '-'}</div>
          </div>
          <div class="img-container">
            <div class="img-box">
              <p><strong>รูปก่อน (Before)</strong></p>
              ${item.image_url ? `<img src="${item.image_url}" />` : '<p>ไม่มีรูป</p>'}
            </div>
            <div class="img-box">
              <p><strong>รูปหลัง (After)</strong></p>
              ${item.after_image_url ? `<img src="${item.after_image_url}" />` : '<p>รอรูปถ่ายหลักฐาน</p>'}
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredHazards = hazards.filter((item) => {
    const matchDept = selectedDept === 'All' || item.department === selectedDept;
    const matchYear = selectedYear === 'All' || (item.inspection_date && item.inspection_date.startsWith(selectedYear));
    
    let matchMonth = true;
    if (selectedMonth !== 'All' && item.inspection_date) {
      const monthPart = item.inspection_date.split('-')[1];
      matchMonth = monthPart === selectedMonth;
    }

    return matchDept && matchYear && matchMonth;
  });

  const countOpen = filteredHazards.filter(i => i.status === 'OPEN').length;
  const countClosed = filteredHazards.filter(i => i.status === 'CLOSED').length;
  const countOverdue = filteredHazards.filter(i => checkOverdue(i.inspection_date, i.due_days, i.status)).length;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf2f4 0%, #f1f5f9 50%, #e2e8f0 100%)', padding: '35px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b' }}>
      
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            padding: 0 !important;
            font-size: 12px !important;
          }
          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #881337;
            padding-bottom: 10px;
          }
          table img {
            width: 50px !important;
            height: 50px !important;
            object-fit: cover !important;
          }
        }
        .print-header {
          display: none;
        }
      `}</style>

      <div style={{ maxWidth: '1450px', margin: '0 auto' }}>
        
        <div className="print-header">
          <h2 style={{ margin: 0, color: '#881337', fontSize: '20px' }}>🔴 SUNSONG (THAILAND) CO., LTD.</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>Safety Inspection Report / 安全检查与跟踪报告</p>
        </div>

        {/* Top Header Card */}
        <div className="no-print" style={{ background: 'linear-gradient(135deg, #881337 0%, #4c0519 100%)', padding: '30px 35px', borderRadius: '24px', boxShadow: '0 15px 35px rgba(136, 19, 55, 0.35)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', color: '#ffffff' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '900', color: '#fecdd3', letterSpacing: '1px', marginBottom: '4px' }}>
              🔴 SUNSONG (THAILAND) CO., LTD. {lang === 'CN' && '松宋（泰国）有限公司'}
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: '900', margin: 0, letterSpacing: '0.5px' }}>
              {lang === 'TH' ? '📊 Cloud Safety Inspection Dashboard & Report' : '📊 现场安全检查与跟踪仪表盘'}
            </h1>
            <p style={{ color: '#fecdd3', fontSize: '14px', margin: '6px 0 0 0', fontWeight: '500' }}>
              {lang === 'TH' ? 'ระบบตรวจสอบ ติดตาม และรายงานความปลอดภัยออนไลน์' : '在线安全检查、跟踪与报告系统'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* 🌐 ปุ่มสลับภาษา TH / CN */}
            <button 
              onClick={() => setLang(lang === 'TH' ? 'CN' : 'TH')}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', border: '1px solid rgba(255, 255, 255, 0.5)', padding: '10px 16px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '13px', color: '#ffffff' }}
            >
              {lang === 'TH' ? '🇨🇳 中文' : '🇹🇭 ไทย'}
            </button>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '10px 16px', borderRadius: '14px', fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>
              👤 {userName || 'User'} | 👑 {userRole}
            </div>
            <button 
              onClick={() => {
                sessionStorage.clear();
                localStorage.clear();
                window.location.href = '/login';
              }}
              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}
            >
              {lang === 'TH' ? '🚪 ออกจากระบบ' : '🚪 登出'}
            </button>
          </div>
        </div>

        {/* Filter Toolbar & Buttons */}
        <div className="no-print" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', padding: '20px 30px', borderRadius: '18px', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', border: '1px solid #cbd5e1', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>{lang === 'TH' ? '🔍 ตัวกรองแผนก:' : '🔍 部门筛选:'}</span>
            
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #94a3b8', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', fontWeight: '600', color: '#1e293b', cursor: 'pointer' }}>
              <option value="All">{lang === 'TH' ? 'ทุกแผนก (All Departments)' : '所有部门 (All)'}</option>
              <option value="Assembly">Assembly {lang === 'CN' && '(总装)'}</option>
              <option value="Metal">Metal {lang === 'CN' && '(金属)'}</option>
              <option value="Hose">Hose {lang === 'CN' && '(胶管)'}</option>
              <option value="Tesla">Tesla {lang === 'CN' && '(特斯拉)'}</option>
              <option value="Engineer">Engineer {lang === 'CN' && '(工程)'}</option>
              <option value="Quality Control">Quality Control {lang === 'CN' && '(品质控制)'}</option>
              <option value="Other">Other {lang === 'CN' && '(其他)'}</option>
            </select>

            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #94a3b8', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', fontWeight: '600', color: '#1e293b', cursor: 'pointer' }}>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="All">{lang === 'TH' ? 'ทุกปี' : '所有年份'}</option>
            </select>

            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #94a3b8', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', fontWeight: '600', color: '#1e293b', cursor: 'pointer' }}>
              <option value="All">{lang === 'TH' ? 'ทุกเดือน' : '所有月份'}</option>
              <option value="01">{lang === 'TH' ? 'มกราคม' : '1月'}</option><option value="02">{lang === 'TH' ? 'กุมภาพันธ์' : '2月'}</option><option value="03">{lang === 'TH' ? 'มีนาคม' : '3月'}</option><option value="04">{lang === 'TH' ? 'เมษายน' : '4月'}</option><option value="05">{lang === 'TH' ? 'พฤษภาคม' : '5月'}</option><option value="06">{lang === 'TH' ? 'มิถุนายน' : '6月'}</option><option value="07">{lang === 'TH' ? 'กรกฎาคม' : '7月'}</option><option value="08">{lang === 'TH' ? 'สิงหาคม' : '8月'}</option><option value="09">{lang === 'TH' ? 'กันยายน' : '9月'}</option><option value="10">{lang === 'TH' ? 'ตุลาคม' : '10月'}</option><option value="11">{lang === 'TH' ? 'พฤศจิกายน' : '11月'}</option><option value="12">{lang === 'TH' ? 'ธันวาคม' : '12月'}</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => window.print()} style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
              {lang === 'TH' ? '🖨️ พิมพ์ทั้งหมด' : '🖨️ 打印全部'}
            </button>
            <button onClick={fetchHazards} style={{ backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', color: '#334155', cursor: 'pointer' }}>
              {lang === 'TH' ? '🔄 รีเฟรช' : '🔄 刷新'}
            </button>
            {!isGeneralStaff && (
              <button onClick={() => router.push('/')} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
                {lang === 'TH' ? '+ บันทึกใหม่' : '+ 新增'}
              </button>
            )}
          </div>
        </div>

        {/* Vivid Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '2px solid #f59e0b', borderLeft: '10px solid #d97706', padding: '20px', borderRadius: '18px', boxShadow: '0 8px 25px rgba(245, 158, 11, 0.2)' }}>
            <div style={{ fontSize: '12px', fontWeight: '900', color: '#92400e', letterSpacing: '0.8px' }}>{lang === 'TH' ? '⚡ เคสที่ต้องดำเนินการ (OPEN)' : '⚡ 进行中案件 (OPEN)'}</div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#78350f', marginTop: '6px' }}>{countOpen}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', border: '2px solid #22c55e', borderLeft: '10px solid #16a34a', padding: '20px', borderRadius: '18px', boxShadow: '0 8px 25px rgba(34, 197, 94, 0.2)' }}>
            <div style={{ fontSize: '12px', fontWeight: '900', color: '#166534', letterSpacing: '0.8px' }}>{lang === 'TH' ? '✨ ปิดเคสแล้ว (CLOSED)' : '✨ 已关闭案件 (CLOSED)'}</div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#14532d', marginTop: '6px' }}>{countClosed}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)', border: '2px solid #dc2626', borderLeft: '10px solid #991b1b', padding: '20px', borderRadius: '18px', boxShadow: '0 8px 25px rgba(220, 38, 38, 0.2)' }}>
            <div style={{ fontSize: '12px', fontWeight: '900', color: '#991b1b', letterSpacing: '0.8px' }}>{lang === 'TH' ? '🚨 เกินกำหนด (OVERDUE)' : '🚨 超期案件 (OVERDUE)'}</div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#7f1d1d', marginTop: '6px' }}>{countOverdue}</div>
          </div>
        </div>

        {/* Main Data Table Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', overflow: 'hidden', border: '2px solid #cbd5e1' }}>
          <div style={{ padding: '20px 30px', borderBottom: '2px solid #e2e8f0', fontWeight: '900', color: '#0f172a', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', background: '#f1f5f9' }}>
            {lang === 'TH' ? '📊 รายงานสรุปรายการความเสี่ยง และกำหนดเวลาแก้ไข' : '📊 风险及整改期限汇总报告'}
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#475569', fontSize: '16px', fontWeight: '700' }}>{lang === 'TH' ? 'กำลังโหลดข้อมูล...' : '正在加载数据...'}</div>
          ) : filteredHazards.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#475569', fontSize: '16px', fontWeight: '700' }}>{lang === 'TH' ? 'ไม่พบข้อมูลรายการความปลอดภัย' : '未找到安全数据'}</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#e2e8f0', color: '#1e293b', borderBottom: '2px solid #cbd5e1', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 12px', fontWeight: '900' }}>{lang === 'TH' ? 'รหัสเคส' : '编号'}</th>
                  <th style={{ padding: '14px 12px', fontWeight: '900' }}>{lang === 'TH' ? 'รายการตรวจ / วันที่' : '检查项目 / 日期'}</th>
                  <th style={{ padding: '14px 12px', fontWeight: '900' }}>{lang === 'TH' ? 'แผนก / โซน' : '部门 / 区域'}</th>
                  <th style={{ padding: '14px 12px', fontWeight: '900' }}>{lang === 'TH' ? 'กำหนดแก้ไข (Due Date)' : '整改期限 (Due Date)'}</th>
                  <th style={{ padding: '14px 12px', fontWeight: '900' }}>{lang === 'TH' ? 'รูปก่อน / รูปหลัง' : '整改前后照片'}</th>
                  <th style={{ padding: '14px 12px', fontWeight: '900' }}>{lang === 'TH' ? 'สถานะ' : '状态'}</th>
                  <th className="no-print" style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '900' }}>{lang === 'TH' ? 'จัดการ' : '操作'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredHazards.map((item) => {
                  const isOverdue = checkOverdue(item.inspection_date, item.due_days, item.status);
                  const dueDateStr = calculateDueDate(item.inspection_date, item.due_days);
                  const hasAfterImage = Boolean(item.after_image_url);

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s', backgroundColor: isOverdue ? '#fff5f5' : 'transparent' }}>
                      <td style={{ padding: '16px 12px', fontWeight: '900', color: '#881337' }}>{item.hazard_no}</td>
                      <td style={{ padding: '16px 12px', color: '#0f172a' }}>
                        <div style={{ fontWeight: '800' }}>{item.type}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{item.inspection_date || '-'}</div>
                      </td>
                      <td style={{ padding: '16px 12px', color: '#334155' }}>
                        <span style={{ fontWeight: '900', color: '#0f172a' }}>{item.department || '-'}</span> <br />
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>({item.zone || '-'}) / {item.responsible}</span>
                      </td>
                      
                      <td style={{ padding: '16px 12px' }}>
                        {isOverdue ? (
                          <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', display: 'inline-block' }}>
                            {lang === 'TH' ? `🚨 เกินกำหนด (${dueDateStr})` : `🚨 超期 (${dueDateStr})`}
                          </span>
                        ) : (
                          <div>
                            <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '12px' }}>📅 {dueDateStr}</div>
                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>{lang === 'TH' ? `(ภายใน ${item.due_days || 7} วัน)` : `(${item.due_days || 7}天内)`}</div>
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {item.image_url ? (
                            <a href={item.image_url} target="_blank" rel="noopener noreferrer" title="ดูรูปก่อน">
                              <img src={item.image_url} alt="Before" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                            </a>
                          ) : '-'}
                          <span style={{ fontWeight: '900', color: '#64748b' }}>➔</span>
                          {item.after_image_url ? (
                            <a href={item.after_image_url} target="_blank" rel="noopener noreferrer" title="ดูรูปหลัง">
                              <img src={item.after_image_url} alt="After" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #10b981' }} />
                            </a>
                          ) : (
                            <div>
                              <span style={{ color: '#e11d48', fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '2px' }}>{lang === 'TH' ? 'รอรูปแก้' : '待整改'}</span>
                              {isGeneralStaff && (
                                <label style={{ backgroundColor: '#d97706', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', cursor: 'pointer', display: 'inline-block' }}>
                                  {lang === 'TH' ? '📷 แนบรูป' : '📷 上传'}
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleQuickUploadAfter(item.id, e.target.files[0]);
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ 
                          backgroundColor: item.status === 'CLOSED' ? '#dcfce7' : isOverdue ? '#fee2e2' : '#fef3c7', 
                          color: item.status === 'CLOSED' ? '#166534' : isOverdue ? '#991b1b' : '#92400e', 
                          padding: '3px 10px', 
                          borderRadius: '20px', 
                          fontSize: '10px', 
                          fontWeight: '900',
                          display: 'inline-block'
                        }}>
                          {item.status === 'CLOSED' ? (lang === 'TH' ? 'CLOSED' : '已关闭') : isOverdue ? (lang === 'TH' ? 'OVERDUE' : '超期') : (lang === 'TH' ? 'OPEN' : '进行中')}
                        </span>
                      </td>

                      <td className="no-print" style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                          <button 
                            onClick={() => handlePrintSingleItem(item)}
                            style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '11px' }}
                          >
                            {lang === 'TH' ? '🖨️ พิมพ์' : '🖨️ 打印'}
                          </button>

                          {!isGeneralStaff && (
                            item.status === 'OPEN' ? (
                              <button 
                                onClick={() => {
                                  if (hasAfterImage) {
                                    setReviewModalItem(item);
                                  } else {
                                    alert(lang === 'TH' ? '⚠️ พนักงานยังไม่ได้แนบรูปถ่ายหลักฐานการแก้ไข' : '⚠️ 员工尚未上传整改照片');
                                  }
                                }}
                                style={{ 
                                  background: hasAfterImage ? '#2563eb' : '#cbd5e1', 
                                  color: hasAfterImage ? 'white' : '#64748b', 
                                  border: 'none', 
                                  padding: '6px 12px', 
                                  borderRadius: '8px', 
                                  fontWeight: '800', 
                                  cursor: hasAfterImage ? 'pointer' : 'not-allowed', 
                                  fontSize: '11px' 
                                }}
                              >
                                {hasAfterImage ? (lang === 'TH' ? '🔍 ตรวจสอบ' : '🔍 审查') : (lang === 'TH' ? '🔒 รอรูป' : '🔒 待照片')}
                              </button>
                            ) : (
                              <span style={{ color: '#065f46', fontWeight: '800', fontSize: '11px', backgroundColor: '#dcfce7', padding: '4px 8px', borderRadius: '6px' }}>
                                {lang === 'TH' ? '✨ ปิดแล้ว' : '✨ 已关闭'}
                              </span>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Modal สำหรับตรวจสอบงาน */}
      {reviewModalItem !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '520px', boxShadow: '0 15px 30px rgba(0,0,0,0.3)' }}>
            
            <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '900', color: '#881337' }}>
              {lang === 'TH' ? `🔍 ตรวจสอบผลการแก้ไขเคส ${reviewModalItem.hazard_no}` : `🔍 审查整改案件 ${reviewModalItem.hazard_no}`}
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              {lang === 'TH' ? 'ตรวจสอบรูปถ่ายหลักฐาน และตัดสินใจอนุมัติหรือตีกลับ' : '检查整改前后照片并批准关闭或退回整改'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '5px' }}>{lang === 'TH' ? 'รูปก่อน (Before)' : '整改前 (Before)'}</div>
                {reviewModalItem.image_url ? (
                  <a href={reviewModalItem.image_url} target="_blank" rel="noopener noreferrer">
                    <img src={reviewModalItem.image_url} alt="Before" style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </a>
                ) : <span style={{ fontSize: '12px' }}>{lang === 'TH' ? 'ไม่มีรูป' : '无'}</span>}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#10b981', marginBottom: '5px' }}>{lang === 'TH' ? 'รูปหลัง (After)' : '整改后 (After)'}</div>
                {reviewModalItem.after_image_url ? (
                  <a href={reviewModalItem.after_image_url} target="_blank" rel="noopener noreferrer">
                    <img src={reviewModalItem.after_image_url} alt="After" style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #10b981' }} />
                  </a>
                ) : <span style={{ fontSize: '12px' }}>{lang === 'TH' ? 'ไม่มีรูป' : '无'}</span>}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                {lang === 'TH' ? 'เหตุผลกรณีตีกลับให้แก้ไข:' : '退回整改原因:'}
              </label>
              <input 
                type="text" 
                value={rejectReason} 
                onChange={(e) => setRejectReason(e.target.value)} 
                placeholder={lang === 'TH' ? 'เช่น รูปไม่ชัดเจน, ยังแก้ไม่เรียบร้อย...' : '例如：照片不清晰、未整改彻底...'} 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} 
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => handleApproveCase(reviewModalItem)}
                style={{ flex: 1, backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '14px' }}
              >
                {lang === 'TH' ? '✅ อนุมัติปิดเคส' : '✅ 批准关闭 (Approve)'}
              </button>
              
              <button 
                type="button" 
                onClick={() => handleRejectCase(reviewModalItem)}
                style={{ flex: 1, backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '14px' }}
              >
                {lang === 'TH' ? '❌ ตีกลับแก้ไข' : '❌ 退回整改 (Reject)'}
              </button>
            </div>

            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <button 
                type="button" 
                onClick={() => { setReviewModalItem(null); setRejectReason(''); }}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                {lang === 'TH' ? 'ปิดหน้าต่างนี้' : '关闭窗口'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}