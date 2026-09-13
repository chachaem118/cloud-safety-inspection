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
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('All');

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
      alert(`อัปโหลดรูปภาพไม่สำเร็จ: ${uploadError.message}`);
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
      alert(`เกิดข้อผิดพลาดในการบันทึกรูป: ${updateError.message}`);
    } else {
      alert('✅ แนบรูปถ่ายหลักฐานการแก้ไข (After Photo) สำเร็จ!');
      fetchHazards();
    }
  };

  const handleApproveCase = async (item: Hazard) => {
    const { error } = await supabase
      .from('hazards')
      .update({ status: 'CLOSED' })
      .eq('id', item.id);

    if (error) {
      alert(`เกิดข้อผิดพลาดในการปิดเคส: ${error.message}`);
    } else {
      alert('✅ อนุมัติปิดเคสเรียบร้อยแล้ว!');
      setReviewModalItem(null);
      fetchHazards();
    }
  };

  const handleRejectCase = async (item: Hazard) => {
    if (!rejectReason.trim()) {
      alert('⚠️ กรุณาระบุเหตุผลที่ตีกลับให้พนักงานแก้ไขทราบ');
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
      alert(`เกิดข้อผิดพลาดในการตีกลับ: ${error.message}`);
    } else {
      alert(`❌ ตีกลับเคสเรียบร้อยแล้ว\nเหตุผล: ${rejectReason}`);
      setReviewModalItem(null);
      setRejectReason('');
      fetchHazards();
    }
  };

  // 🖨️ ฟังก์ชันพิมพ์เฉพาะรายการเดี่ยว (Single Item Print)
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
          <h2>🔴 SUNSONG (THAILAND) CO., LTD. - รายงานผลการตรวจสอบความปลอดภัย</h2>
          <div class="box">
            <div class="row"><strong>รหัสเคส:</strong> ${item.hazard_no}</div>
            <div class="row"><strong>ประเภทความไม่ปลอดภัย:</strong> ${item.type}</div>
            <div class="row"><strong>วันที่ตรวจ:</strong> ${item.inspection_date}</div>
            <div class="row"><strong>แผนก / โซน:</strong> ${item.department} (${item.zone})</div>
            <div class="row"><strong>ผู้รับผิดชอบ:</strong> ${item.responsible}</div>
            <div class="row"><strong>กำหนดแก้ไข (Due Date):</strong> ${dueDateStr}</div>
            <div class="row"><strong>สถานะเคส:</strong> ${item.status}</div>
            <div class="row"><strong>รายละเอียด:</strong> ${item.description || '-'}</div>
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

  const countUnsafeAct = filteredHazards.filter(i => i.type?.includes('Unsafe Act')).length;
  const countUnsafeCondition = filteredHazards.filter(i => i.type?.includes('Unsafe Condition')).length;
  const countNearMiss = filteredHazards.filter(i => i.type?.includes('Near Miss')).length;
  const countOverdue = filteredHazards.filter(i => checkOverdue(i.inspection_date, i.due_days, i.status)).length;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf2f4 0%, #f1f5f9 50%, #e2e8f0 100%)', padding: '35px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b' }}>
      
      {/* 🖨️ CSS สำหรับการพิมพ์: ซ่อนส่วนที่ไม่ต้องการ และจัดหน้าให้พอดีกระดาษ */}
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
          table {
            font-size: 11px !important;
          }
        }
        .print-header {
          display: none;
        }
      `}</style>

      <div style={{ maxWidth: '1450px', margin: '0 auto' }}>
        
        {/* หัวกระเอดาษเฉพาะตอนสั่ง Print */}
        <div className="print-header">
          <h2 style={{ margin: 0, color: '#881337', fontSize: '20px' }}>🔴 SUNSONG (THAILAND) CO., LTD.</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>รายงานการตรวจสอบและติดตามความปลอดภัย (Safety Inspection Report)</p>
        </div>

        {/* Top Header Card (ซ่อนตอน Print) */}
        <div className="no-print" style={{ background: 'linear-gradient(135deg, #881337 0%, #4c0519 100%)', padding: '30px 35px', borderRadius: '24px', boxShadow: '0 15px 35px rgba(136, 19, 55, 0.35)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', color: '#ffffff' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '900', color: '#fecdd3', letterSpacing: '1px', marginBottom: '4px' }}>
              🔴 SUNSONG (THAILAND) CO., LTD.
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: '900', margin: 0, letterSpacing: '0.5px' }}>
              📊 Cloud Safety Inspection Dashboard & Report
            </h1>
            <p style={{ color: '#fecdd3', fontSize: '14px', margin: '6px 0 0 0', fontWeight: '500' }}>ระบบตรวจสอบ ติดตาม และรายงานความปลอดภัยออนไลน์</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.4)', padding: '12px 18px', borderRadius: '14px', fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>
              👤 {userName || 'ผู้ใช้งาน'} | 👑 {userRole}
            </div>
            <button 
              onClick={() => {
                sessionStorage.clear();
                localStorage.clear();
                window.location.href = '/login';
              }}
              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px 18px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)' }}
            >
              🚪 ออกจากระบบ
            </button>
          </div>
        </div>

        {/* Filter Toolbar & Buttons (ซ่อนตอน Print) */}
        <div className="no-print" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', padding: '20px 30px', borderRadius: '18px', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', border: '1px solid #cbd5e1', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>🔍 ตัวกรองข้อมูล:</span>
            
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #94a3b8', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', fontWeight: '600', color: '#1e293b', cursor: 'pointer' }}>
              <option value="All">ทุกแผนก (All Departments)</option>
              <option value="Assembly">Assembly</option>
              <option value="Metal">Metal</option>
              <option value="Hose">Hose</option>
              <option value="Tesla">Tesla</option>
              <option value="Engineer">Engineer</option>
            </select>

            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #94a3b8', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', fontWeight: '600', color: '#1e293b', cursor: 'pointer' }}>
              <option value="2026">ปี 2026</option>
              <option value="2025">ปี 2025</option>
              <option value="All">ทุกปี</option>
            </select>

            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #94a3b8', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', fontWeight: '600', color: '#1e293b', cursor: 'pointer' }}>
              <option value="All">ทุกเดือน (All Months)</option>
              <option value="01">มกราคม</option><option value="02">กุมภาพันธ์</option><option value="03">มีนาคม</option><option value="04">เมษายน</option><option value="05">พฤษภาคม</option><option value="06">มิถุนายน</option><option value="07">กรกฎาคม</option><option value="08">สิงหาคม</option><option value="09">กันยายน</option><option value="10">ตุลาคม</option><option value="11">พฤศจิกายน</option><option value="12">ธันวาคม</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => window.print()} style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)' }}>🖨️ พิมพ์รายงานทั้งหมด</button>
            <button onClick={fetchHazards} style={{ backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', color: '#334155', cursor: 'pointer' }}>🔄 รีเฟรช</button>
            {!isGeneralStaff && (
              <button onClick={() => router.push('/')} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>+ บันทึกใหม่</button>
            )}
          </div>
        </div>

        {/* Vivid Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '2px solid #f59e0b', borderLeft: '10px solid #d97706', padding: '20px', borderRadius: '18px', boxShadow: '0 8px 25px rgba(245, 158, 11, 0.2)' }}>
            <div style={{ fontSize: '12px', fontWeight: '900', color: '#92400e', letterSpacing: '0.8px' }}>⚡ UNSAFE ACT</div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#78350f', marginTop: '6px' }}>{countUnsafeAct}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)', border: '2px solid #f43f5e', borderLeft: '10px solid #e11d48', padding: '20px', borderRadius: '18px', boxShadow: '0 8px 25px rgba(244, 63, 94, 0.2)' }}>
            <div style={{ fontSize: '12px', fontWeight: '900', color: '#9f1239', letterSpacing: '0.8px' }}>🔥 UNSAFE CONDITION</div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#881337', marginTop: '6px' }}>{countUnsafeCondition}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)', border: '2px solid #a855f7', borderLeft: '10px solid #9333ea', padding: '20px', borderRadius: '18px', boxShadow: '0 8px 25px rgba(168, 85, 247, 0.2)' }}>
            <div style={{ fontSize: '12px', fontWeight: '900', color: '#6b21a8', letterSpacing: '0.8px' }}>⚠️ NEAR MISS</div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#581c87', marginTop: '6px' }}>{countNearMiss}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)', border: '2px solid #dc2626', borderLeft: '10px solid #991b1b', padding: '20px', borderRadius: '18px', boxShadow: '0 8px 25px rgba(220, 38, 38, 0.2)' }}>
            <div style={{ fontSize: '12px', fontWeight: '900', color: '#991b1b', letterSpacing: '0.8px' }}>🚨 OVERDUE</div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#7f1d1d', marginTop: '6px' }}>{countOverdue}</div>
          </div>
        </div>

        {/* Main Data Table Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', overflow: 'hidden', border: '2px solid #cbd5e1' }}>
          <div style={{ padding: '20px 30px', borderBottom: '2px solid #e2e8f0', fontWeight: '900', color: '#0f172a', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', background: '#f1f5f9' }}>
            📊 รายงานสรุปรายการความเสี่ยง และกำหนดเวลาแก้ไข (Due Date)
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#475569', fontSize: '16px', fontWeight: '700' }}>กำลังโหลดข้อมูล...</div>
          ) : filteredHazards.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#475569', fontSize: '16px', fontWeight: '700' }}>ไม่พบข้อมูลรายการความปลอดภัยในเงื่อนไขนี้</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#e2e8f0', color: '#1e293b', borderBottom: '2px solid #cbd5e1', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 12px', fontWeight: '900' }}>รหัสเคส</th>
                  <th style={{ padding: '14px 12px', fontWeight: '900' }}>ประเภท / วันที่ตรวจ</th>
                  <th style={{ padding: '14px 12px', fontWeight: '900' }}>แผนก / โซน</th>
                  <th style={{ padding: '14px 12px', fontWeight: '900' }}>กำหนดแก้ไข (Due Date)</th>
                  <th style={{ padding: '14px 12px', fontWeight: '900' }}>รูปก่อน / รูปหลัง</th>
                  <th style={{ padding: '14px 12px', fontWeight: '900' }}>สถานะ</th>
                  <th className="no-print" style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '900' }}>จัดการ / ปริ้นท์รายเคส</th>
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
                            🚨 เกินกำหนด ({dueDateStr})
                          </span>
                        ) : (
                          <div>
                            <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '12px' }}>📅 {dueDateStr}</div>
                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>(ภายใน {item.due_days || 7} วัน)</div>
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
                              <span style={{ color: '#e11d48', fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '2px' }}>รอรูปแก้</span>
                              {isGeneralStaff && (
                                <label style={{ backgroundColor: '#d97706', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', cursor: 'pointer', display: 'inline-block' }}>
                                  📷 แนบรูป After
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
                          {item.status === 'CLOSED' ? 'CLOSED' : isOverdue ? 'OVERDUE' : 'OPEN'}
                        </span>
                      </td>

                      <td className="no-print" style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                          {/* ปุ่มปริ้นท์รายเคส */}
                          <button 
                            onClick={() => handlePrintSingleItem(item)}
                            style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '11px' }}
                            title="พิมพ์เฉพาะรายงานเคesนี้"
                          >
                            🖨️ พิมพ์
                          </button>

                          {/* ปุ่มตรวจสอบ/อนุมัติ (เฉพาะ Safety/ผู้บริหาร) */}
                          {!isGeneralStaff && (
                            item.status === 'OPEN' ? (
                              <button 
                                onClick={() => {
                                  if (hasAfterImage) {
                                    setReviewModalItem(item);
                                  } else {
                                    alert('⚠️ พนักงานยังไม่ได้แนบรูปถ่ายหลักฐานการแก้ไข (After Photo)');
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
                                {hasAfterImage ? '🔍 ตรวจสอบ' : '🔒 รอรูป'}
                              </button>
                            ) : (
                              <span style={{ color: '#065f46', fontWeight: '800', fontSize: '11px', backgroundColor: '#dcfce7', padding: '4px 8px', borderRadius: '6px' }}>✨ ปิดแล้ว</span>
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
            
            <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '900', color: '#881337' }}>🔍 ตรวจสอบผลการแก้ไขเคส {reviewModalItem.hazard_no}</h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>ตรวจสอบรูปถ่ายหลักฐาน (After Photo) และตัดสินใจว่าจะอนุมัติปิดเคส หรือตีกลับให้แก้ไขใหม่</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '5px' }}>รูปก่อน (Before)</div>
                {reviewModalItem.image_url ? (
                  <a href={reviewModalItem.image_url} target="_blank" rel="noopener noreferrer">
                    <img src={reviewModalItem.image_url} alt="Before" style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </a>
                ) : <span style={{ fontSize: '12px' }}>ไม่มีรูป</span>}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#10b981', marginBottom: '5px' }}>รูปหลัง (After)</div>
                {reviewModalItem.after_image_url ? (
                  <a href={reviewModalItem.after_image_url} target="_blank" rel="noopener noreferrer">
                    <img src={reviewModalItem.after_image_url} alt="After" style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #10b981' }} />
                  </a>
                ) : <span style={{ fontSize: '12px' }}>ไม่มีรูป</span>}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>เหตุผลกรณีตีกลับให้แก้ไข:</label>
              <input 
                type="text" 
                value={rejectReason} 
                onChange={(e) => setRejectReason(e.target.value)} 
                placeholder="เช่น รูปไม่ชัดเจน, ยังแก้ไม่เรียบร้อย..." 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} 
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => handleApproveCase(reviewModalItem)}
                style={{ flex: 1, backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '14px' }}
              >
                ✅ อนุมัติปิดเคส
              </button>
              
              <button 
                type="button" 
                onClick={() => handleRejectCase(reviewModalItem)}
                style={{ flex: 1, backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '14px' }}
              >
                ❌ ตีกลับแก้ไข
              </button>
            </div>

            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <button 
                type="button" 
                onClick={() => { setReviewModalItem(null); setRejectReason(''); }}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                ปิดหน้าต่างนี้
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
