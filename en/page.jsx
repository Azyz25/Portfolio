/* ===== بداية الجزء الأول: الواردات والحالات الأساسية ===== */
'use client';

import { useState, useEffect, useRef } from 'react';
//import { withRoleProtection, useProtectedAPI } from '@/utils/withRoleProtection';
import { withRoleProtection, useProtectedAPI } from '@/utils/temp-protection';
import DashboardLayout from '@/app/components/DashboardLayout';
import styles from './page.module.css';
import { setupBypassAuth } from '@/utils/bypass-auth';
import { 
  Shield, Lock, Smartphone, Eye, EyeOff, AlertTriangle,
  Navigation, Layout, Edit3, Save, Plus, Trash2, BarChart3,
  LogOut, Menu, X, Globe, ImageIcon, Phone, Mail, Users,
  Database, Settings, CreditCard, FileText, Package,
  UserCheck, DollarSign, TestTube, CheckCircle, XCircle,
  AlertCircle, Home, UserPlus, Key, RefreshCw, Search,
  Filter, Download, Upload, Calendar, Clock, Star, Award,
  TrendingUp, Activity, Zap, Target, Layers, Code, Palette,
  Monitor, Tablet, Link, ExternalLink, Copy, Check, Info,
  HelpCircle, BookOpen, MessageSquare, Bell, Flag, MapPin,
  Building, Briefcase, GraduationCap, School, Users2,
  UserX, UserMinus, Crown, Verified
} from 'lucide-react';

function SuperAdminDashboard() {
  const { makeAuthenticatedRequest } = useProtectedAPI();

  // ===== حالات التطبيق الرئيسية =====
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notification, setNotification] = useState('');

  // ===== بيانات الإحصائيات =====
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    systemHealth: 0
  });

  // ===== بيانات إدارة المستخدمين =====
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'student',
    password: '',
    national_id: '',
    phone: '',
    level: '',
    grade: '',
    edu_admin: '',
    school_name: '',
    school_type: '',
    is_active: true
  });

  // ===== بيانات إدارة الخطط =====
  const [plans, setPlans] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    price: '',
    duration_days: 30,
    features: [],
    is_active: true,
    is_featured: false
  });

  // ===== بيانات إدارة الصفحات =====
  const [pages, setPages] = useState({});
  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [pageForm, setPageForm] = useState({
    title_ar: '',
    title_en: '',
    content_ar: '',
    content_en: '',
    meta_description_ar: '',
    meta_description_en: ''
  });

  // ===== بيانات إعدادات الدفع =====
  const [paymentSettings, setPaymentSettings] = useState({
    payment_enabled: true,
    payment_gateway: 'stripe',
    payment_test_mode: true,
    payment_currency: 'SAR',
    stripe_public_key: '',
    stripe_secret_key: '',
    paypal_client_id: '',
    paypal_client_secret: '',
    bank_transfer_enabled: false,
    bank_account_number: '',
    bank_name: '',
    iban: ''
  });

  // ===== بيانات النافبار =====
  const [navbarData, setNavbarData] = useState({
    logo_path: '/assets/miras-logo.svg',
    links: []
  });

  // ===== بيانات الفوتر =====
  const [footerData, setFooterData] = useState({
    logo_path: '/assets/miras-logo-footer.svg',
    quickLinks: [],
    legalPages: [],
    contact: { phone: '', email: '', workHours: '' },
    socialMedia: [],
    copyright: '',
    description: ''
  });

  // ===== بيانات الصفحة الرئيسية =====
  const [homepageData, setHomepageData] = useState({
    hero_title: '',
    hero_subtitle: '',
    hero_cta_text: '',
    hero_cta_link: '',
    hero_image: '',
    features: [],
    testimonials: [],
    stats: []
  });

  // ===== إعدادات البحث والتصفية =====
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // ===== ثوابت البيانات =====
  const userRoles = [
    { value: 'student', label: 'طالب' },
    { value: 'teacher', label: 'معلم' },
    { value: 'manager', label: 'مدير مدرسة' },
    { value: 'supervisor', label: 'مشرف' },
    { value: 'super_admin', label: 'مشرف أكبر' }
  ];

  const pageTypes = [
    { value: 'privacy-policy', label: 'سياسة الخصوصية' },
    { value: 'terms-of-service', label: 'شروط الخدمة' },
    { value: 'about-us', label: 'نبذة عنا' },
    { value: 'contact-us', label: 'تواصل معنا' }
  ];

  const paymentGateways = [
    { value: 'stripe', label: 'Stripe' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'bank_transfer', label: 'تحويل بنكي' }
  ];

  const currencies = [
    { value: 'SAR', label: 'ريال سعودي (SAR)' },
    { value: 'USD', label: 'دولار أمريكي (USD)' },
    { value: 'EUR', label: 'يورو (EUR)' }
  ];
/* ===== نهاية الجزء الأول: الواردات والحالات الأساسية ===== */
/* ===== بداية الجزء الثاني: دوال جلب البيانات ===== */

  // ===== جلب الإحصائيات =====
  const fetchStats = async () => {
    try {
      console.log('جاري جلب الإحصائيات...');
      const response = await makeAuthenticatedRequest('/api/super-admin/dashboard-stats');
      
      if (response.status === 200) {
        const data = await response.json();
        console.log('📊 Raw stats response:', data);
        
        let statsData = data.data || data;
        
        if (Array.isArray(statsData) && statsData.length > 0) {
          statsData = statsData[0];
        }
        
        setStats({
          totalUsers: statsData.totalUsers || statsData.total_users || 0,
          activeSubscriptions: statsData.activeSubscriptions || statsData.active_subscriptions || 0,
          monthlyRevenue: statsData.monthlyRevenue || statsData.monthly_revenue || 0,
          systemHealth: statsData.systemHealth || statsData.system_health || 0
        });
        
      } else {
        console.error('API Error:', response.status);
        setError(`خطأ في الخادم: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Stats fetch error:', err);
      setError(`خطأ في الاتصال: ${err.message}`);
    }
  };

  // ===== جلب المستخدمين =====
  const fetchUsers = async () => {
    try {
      console.log('جاري جلب المستخدمين...');
      const response = await makeAuthenticatedRequest('/api/super-admin/users');
      
      if (response.status === 200) {
        const data = await response.json();
        console.log('👥 Raw users response:', data);
        
        let usersData = data.data || data.users || data;
        
        if (!Array.isArray(usersData)) {
          usersData = [];
        }
        
        setUsers(usersData);
        
      } else {
        setError(`خطأ في جلب المستخدمين: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Users fetch error:', err);
      setError(`خطأ في الاتصال: ${err.message}`);
    }
  };

  // ===== جلب الخطط =====
  const fetchPlans = async () => {
    try {
      console.log('جاري جلب الخطط...');
      const response = await makeAuthenticatedRequest('/api/super-admin/plans');
      
      if (response.status === 200) {
        const data = await response.json();
        console.log('📦 Raw plans response:', data);
        
        let plansData = data.data || data.plans || data;
        
        if (!Array.isArray(plansData)) {
          plansData = [];
        }
        
        setPlans(plansData);
        
      } else {
        setError(`خطأ في جلب الخطط: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Plans fetch error:', err);
      setError(`خطأ في الاتصال: ${err.message}`);
    }
  };

  // ===== جلب الصفحات =====
  const fetchPages = async () => {
    try {
      console.log('جاري جلب الصفحات...');
      const response = await makeAuthenticatedRequest('/api/super-admin/pages');
      
      if (response.status === 200) {
        const data = await response.json();
        console.log('📄 Raw pages response:', data);
        
        let pagesData = data.data || data.pages || data;
        
        setPages(pagesData);
        
      } else {
        setError(`خطأ في جلب الصفحات: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Pages fetch error:', err);
      setError(`خطأ في الاتصال: ${err.message}`);
    }
  };

  // ===== جلب إعدادات الدفع =====
  const fetchPaymentSettings = async () => {
    try {
      console.log('جاري جلب إعدادات الدفع...');
      const response = await makeAuthenticatedRequest('/api/super-admin/payment-settings');
      
      if (response.status === 200) {
        const data = await response.json();
        console.log('💳 Raw payment settings response:', data);
        
        let settingsData = data.data || data;
        
        setPaymentSettings(settingsData);
        
      } else {
        setError(`خطأ في جلب إعدادات الدفع: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Payment settings fetch error:', err);
      setError(`خطأ في الاتصال: ${err.message}`);
    }
  };

  // ===== جلب بيانات النافبار =====
  const fetchNavbarData = async () => {
    try {
      console.log('جاري جلب بيانات النافبار...');
      const response = await makeAuthenticatedRequest('/api/super-admin/navbar');
      
      if (response.status === 200) {
        const data = await response.json();
        console.log('🧭 Raw navbar response:', data);
        
        let navbarDataResponse = data.data || data;
        
        setNavbarData(navbarDataResponse);
        
      } else {
        setError(`خطأ في جلب بيانات النافبار: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Navbar fetch error:', err);
      setError(`خطأ في الاتصال: ${err.message}`);
    }
  };

  // ===== جلب بيانات الفوتر =====
  const fetchFooterData = async () => {
    try {
      console.log('جاري جلب بيانات الفوتر...');
      const response = await makeAuthenticatedRequest('/api/super-admin/footer');
      
      if (response.status === 200) {
        const data = await response.json();
        console.log('🦶 Raw footer response:', data);
        
        let footerDataResponse = data.data || data;
        
        setFooterData(footerDataResponse);
        
      } else {
        setError(`خطأ في جلب بيانات الفوتر: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Footer fetch error:', err);
      setError(`خطأ في الاتصال: ${err.message}`);
    }
  };

  // ===== جلب بيانات الصفحة الرئيسية =====
  const fetchHomepageData = async () => {
    try {
      console.log('جاري جلب بيانات الصفحة الرئيسية...');
      const response = await makeAuthenticatedRequest('/api/super-admin/homepage');
      
      if (response.status === 200) {
        const data = await response.json();
        console.log('🏠 Raw homepage response:', data);
        
        let homepageDataResponse = data.data || data;
        
        setHomepageData(homepageDataResponse);
        
      } else {
        setError(`خطأ في جلب بيانات الصفحة الرئيسية: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Homepage fetch error:', err);
      setError(`خطأ في الاتصال: ${err.message}`);
    }
  };

/* ===== نهاية الجزء الثاني: دوال جلب البيانات ===== */
/* ===== بداية الجزء الثالث: دوال إدارة المستخدمين ===== */

  // ===== إعادة تعيين نموذج المستخدم =====
  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      role: 'student',
      password: '',
      national_id: '',
      phone: '',
      level: '',
      grade: '',
      edu_admin: '',
      school_name: '',
      school_type: '',
      is_active: true
    });
  };

  // ===== إنشاء مستخدم جديد =====
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔍 Form state before submit:', userForm);
      
      const url = editingUser 
        ? `/api/super-admin/users/${editingUser.id}` 
        : '/api/super-admin/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      // تحضير البيانات
      const dataToSend = {
        name: userForm.name?.trim() || '',
        email: userForm.email?.trim() || '',
        role: userForm.role || 'student',
        password: userForm.password?.trim() || '',
        national_id: userForm.national_id?.trim() || '',
        phone: userForm.phone?.trim() || '',
        level: userForm.level?.trim() || '',
        grade: userForm.grade?.trim() || '',
        edu_admin: userForm.edu_admin?.trim() || '',
        school_name: userForm.school_name?.trim() || '',
        school_type: userForm.school_type?.trim() || '',
        is_active: Boolean(userForm.is_active)
      };
      
      // التحقق من البيانات الأساسية
      if (!dataToSend.name) {
        alert('يرجى إدخال اسم المستخدم');
        setLoading(false);
        return;
      }
      
      if (!dataToSend.email) {
        alert('يرجى إدخال البريد الإلكتروني');
        setLoading(false);
        return;
      }
      
      if (!editingUser && !dataToSend.password) {
        alert('يرجى إدخال كلمة المرور');
        setLoading(false);
        return;
      }
      
      console.log('📤 Final data to send:', JSON.stringify(dataToSend, null, 2));
      
      const response = await makeAuthenticatedRequest(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Success:', responseData);
        setShowUserModal(false);
        setEditingUser(null);
        resetUserForm();
        await fetchUsers();
        await fetchStats();
        setNotification(responseData.message || 'تم حفظ المستخدم بنجاح!');
      } else {
        const errorData = await response.json();
        console.error('❌ Server error:', errorData);
        setNotification(errorData.message || errorData.error || 'حدث خطأ في الخادم');
      }
    } catch (err) {
      console.error('❌ Submit error:', err);
      setNotification('حدث خطأ في الاتصال بالخادم: ' + err.message);
    }
    
    setLoading(false);
  };

  // ===== تحرير المستخدم =====
  const handleUserEdit = (user) => {
    setEditingUser(user);
    
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'student',
      password: '', // لا نحمل كلمة المرور في التعديل
      national_id: user.national_id || '',
      phone: user.phone || '',
      level: user.level || '',
      grade: user.grade || '',
      edu_admin: user.edu_admin || '',
      school_name: user.school_name || '',
      school_type: user.school_type || '',
      is_active: user.is_active || false
    });
    
    setShowUserModal(true);
  };

  // ===== حذف المستخدم =====
  const handleUserDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    try {
      const response = await makeAuthenticatedRequest(`/api/super-admin/users/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchUsers();
        await fetchStats();
        setNotification('تم حذف المستخدم بنجاح');
      } else {
        const errorData = await response.json();
        setNotification(errorData.message || 'خطأ في حذف المستخدم');
      }
    } catch (err) {
      console.error('❌ خطأ في حذف المستخدم:', err);
      setNotification('خطأ في حذف المستخدم');
    }
  };

  // ===== تحديث حالة المستخدم =====
  const updateUserStatus = async (id, status) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/super-admin/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: status })
      });

      if (response.ok) {
        await fetchUsers();
        setNotification(`تم ${status ? 'تفعيل' : 'إلغاء تفعيل'} المستخدم بنجاح`);
      } else {
        const errorData = await response.json();
        setNotification(errorData.message || 'خطأ في تحديث حالة المستخدم');
      }
    } catch (err) {
      console.error('❌ خطأ في تحديث حالة المستخدم:', err);
      setNotification('خطأ في تحديث حالة المستخدم');
    }
  };

  // ===== إعادة تعيين كلمة المرور =====
  const resetUserPassword = async (id) => {
    const newPassword = prompt('أدخل كلمة المرور الجديدة:');
    if (!newPassword) return;
    
    try {
      const response = await makeAuthenticatedRequest(`/api/super-admin/users/${id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword })
      });

      if (response.ok) {
        setNotification('تم إعادة تعيين كلمة المرور بنجاح');
      } else {
        const errorData = await response.json();
        setNotification(errorData.message || 'خطأ في إعادة تعيين كلمة المرور');
      }
    } catch (err) {
      console.error('❌ خطأ في إعادة تعيين كلمة المرور:', err);
      setNotification('خطأ في إعادة تعيين كلمة المرور');
    }
  };

  // ===== التحقق من البريد الإلكتروني =====
  const verifyUserEmail = async (id) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/super-admin/users/${id}/verify-email`, {
        method: 'POST'
      });

      if (response.ok) {
        await fetchUsers();
        setNotification('تم إرسال رسالة التحقق من البريد الإلكتروني');
      } else {
        const errorData = await response.json();
        setNotification(errorData.message || 'خطأ في إرسال رسالة التحقق');
      }
    } catch (err) {
      console.error('❌ خطأ في إرسال رسالة التحقق:', err);
      setNotification('خطأ في إرسال رسالة التحقق');
    }
  };

  // ===== التحقق من رقم الهاتف =====
  const verifyUserPhone = async (id) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/super-admin/users/${id}/verify-phone`, {
        method: 'POST'
      });

      if (response.ok) {
        await fetchUsers();
        setNotification('تم إرسال رمز التحقق من الهاتف');
      } else {
        const errorData = await response.json();
        setNotification(errorData.message || 'خطأ في إرسال رمز التحقق');
      }
    } catch (err) {
      console.error('❌ خطأ في إرسال رمز التحقق:', err);
      setNotification('خطأ في إرسال رمز التحقق');
    }
  };

/* ===== نهاية الجزء الثالث: دوال إدارة المستخدمين ===== */
/* ===== بداية الجزء الرابع: دوال إدارة الخطط ===== */

  // ===== إعادة تعيين نموذج الخطة =====
  const resetPlanForm = () => {
    setPlanForm({
      name_ar: '',
      name_en: '',
      description_ar: '',
      description_en: '',
      price: '',
      duration_days: 30,
      features: [],
      is_active: true,
      is_featured: false
    });
  };

  // ===== إنشاء أو تحديث خطة =====
  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔍 Plan form state before submit:', planForm);
      
      const url = editingPlan 
        ? `/api/super-admin/plans/${editingPlan.id}` 
        : '/api/super-admin/plans';
      
      const method = editingPlan ? 'PUT' : 'POST';
      
      // تحضير البيانات
      const dataToSend = {
        name_ar: planForm.name_ar?.trim() || '',
        name_en: planForm.name_en?.trim() || '',
        description_ar: planForm.description_ar?.trim() || '',
        description_en: planForm.description_en?.trim() || '',
        price: parseFloat(planForm.price) || 0,
        duration_days: parseInt(planForm.duration_days) || 30,
        features: Array.isArray(planForm.features) 
          ? planForm.features.filter(feature => feature.trim() !== '') 
          : [],
        is_active: Boolean(planForm.is_active),
        is_featured: Boolean(planForm.is_featured)
      };
      
      // التحقق من البيانات الأساسية
      if (!dataToSend.name_ar) {
        alert('يرجى إدخال اسم الخطة باللغة العربية');
        setLoading(false);
        return;
      }
      
      if (!dataToSend.name_en) {
        alert('يرجى إدخال اسم الخطة باللغة الإنجليزية');
        setLoading(false);
        return;
      }
      
      if (dataToSend.price <= 0) {
        alert('يرجى إدخال سعر صحيح');
        setLoading(false);
        return;
      }
      
      console.log('📤 Final plan data to send:', JSON.stringify(dataToSend, null, 2));
      
      const response = await makeAuthenticatedRequest(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Plan success:', responseData);
        setShowPlanModal(false);
        setEditingPlan(null);
        resetPlanForm();
        await fetchPlans();
        await fetchStats();
        setNotification(responseData.message || 'تم حفظ الخطة بنجاح!');
      } else {
        const errorData = await response.json();
        console.error('❌ Plan server error:', errorData);
        setNotification(errorData.message || errorData.error || 'حدث خطأ في الخادم');
      }
    } catch (err) {
      console.error('❌ Plan submit error:', err);
      setNotification('حدث خطأ في الاتصال بالخادم: ' + err.message);
    }
    
    setLoading(false);
  };

  // ===== تحرير الخطة =====
  const handlePlanEdit = (plan) => {
    setEditingPlan(plan);
    
    setPlanForm({
      name_ar: plan.name_ar || '',
      name_en: plan.name_en || '',
      description_ar: plan.description_ar || '',
      description_en: plan.description_en || '',
      price: plan.price || '',
      duration_days: plan.duration_days || 30,
      features: plan.features || [],
      is_active: plan.is_active || false,
      is_featured: plan.is_featured || false
    });
    
    setShowPlanModal(true);
  };

  // ===== حذف الخطة =====
  const handlePlanDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخطة؟')) return;
    
    try {
      const response = await makeAuthenticatedRequest(`/api/super-admin/plans/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchPlans();
        await fetchStats();
        setNotification('تم حذف الخطة بنجاح');
      } else {
        const errorData = await response.json();
        setNotification(errorData.message || 'خطأ في حذف الخطة');
      }
    } catch (err) {
      console.error('❌ خطأ في حذف الخطة:', err);
      setNotification('خطأ في حذف الخطة');
    }
  };

  // ===== إضافة ميزة للخطة =====
  const addFeatureToPlan = () => {
    setPlanForm(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  // ===== تحديث ميزة في الخطة =====
  const updatePlanFeature = (index, value) => {
    setPlanForm(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  // ===== حذف ميزة من الخطة =====
  const removePlanFeature = (index) => {
    setPlanForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

/* ===== نهاية الجزء الرابع: دوال إدارة الخطط ===== */
/* ===== بداية الجزء الخامس: دوال إدارة الصفحات والمحتوى ===== */

  // ===== إعادة تعيين نموذج الصفحة =====
  const resetPageForm = () => {
    setPageForm({
      title_ar: '',
      title_en: '',
      content_ar: '',
      content_en: '',
      meta_description_ar: '',
      meta_description_en: ''
    });
  };

  // ===== تحديث الصفحة =====
  const handlePageSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔍 Page form state before submit:', pageForm);
      
      const url = `/api/super-admin/pages/${editingPage}`;
      
      // تحضير البيانات
      const dataToSend = {
        title_ar: pageForm.title_ar?.trim() || '',
        title_en: pageForm.title_en?.trim() || '',
        content_ar: pageForm.content_ar?.trim() || '',
        content_en: pageForm.content_en?.trim() || '',
        meta_description_ar: pageForm.meta_description_ar?.trim() || '',
        meta_description_en: pageForm.meta_description_en?.trim() || ''
      };
      
      // التحقق من البيانات الأساسية
      if (!dataToSend.title_ar) {
        alert('يرجى إدخال عنوان الصفحة باللغة العربية');
        setLoading(false);
        return;
      }
      
      if (!dataToSend.content_ar) {
        alert('يرجى إدخال محتوى الصفحة باللغة العربية');
        setLoading(false);
        return;
      }
      
      console.log('📤 Final page data to send:', JSON.stringify(dataToSend, null, 2));
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Page success:', responseData);
        setShowPageModal(false);
        setEditingPage(null);
        resetPageForm();
        await fetchPages();
        setNotification(responseData.message || 'تم حفظ الصفحة بنجاح!');
      } else {
        const errorData = await response.json();
        console.error('❌ Page server error:', errorData);
        setNotification(errorData.message || errorData.error || 'حدث خطأ في الخادم');
      }
    } catch (err) {
      console.error('❌ Page submit error:', err);
      setNotification('حدث خطأ في الاتصال بالخادم: ' + err.message);
    }
    
    setLoading(false);
  };

  // ===== تحرير الصفحة =====
  const handlePageEdit = (pageKey) => {
    const page = pages[pageKey];
    if (page) {
      setPageForm({
        title_ar: page.title_ar || '',
        title_en: page.title_en || '',
        content_ar: page.content_ar || '',
        content_en: page.content_en || '',
        meta_description_ar: page.meta_description_ar || '',
        meta_description_en: page.meta_description_en || ''
      });
      setEditingPage(pageKey);
      setShowPageModal(true);
    }
  };

  // ===== حفظ إعدادات الدفع =====
  const handlePaymentSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔍 Payment settings before submit:', paymentSettings);
      
      const response = await makeAuthenticatedRequest('/api/super-admin/payment-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentSettings)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Payment settings success:', responseData);
        setNotification(responseData.message || 'تم حفظ إعدادات الدفع بنجاح!');
      } else {
        const errorData = await response.json();
        console.error('❌ Payment settings server error:', errorData);
        setNotification(errorData.message || errorData.error || 'حدث خطأ في الخادم');
      }
    } catch (err) {
      console.error('❌ Payment settings submit error:', err);
      setNotification('حدث خطأ في الاتصال بالخادم: ' + err.message);
    }
    
    setLoading(false);
  };

  // ===== اختبار اتصال الدفع =====
  const testPaymentConnection = async () => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest('/api/super-admin/payment-test', {
        method: 'POST'
      });

      if (response.ok) {
        const responseData = await response.json();
        setNotification(responseData.success ? '✅ تم اختبار الاتصال بنجاح' : '❌ فشل اختبار الاتصال');
      } else {
        setNotification('❌ فشل اختبار الاتصال');
      }
    } catch (err) {
      console.error('❌ Payment test error:', err);
      setNotification('❌ خطأ في اختبار الاتصال');
    } finally {
      setLoading(false);
    }
  };

  // ===== حفظ بيانات النافبار =====
  const handleNavbarSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔍 Navbar data before submit:', navbarData);
      
      const response = await makeAuthenticatedRequest('/api/super-admin/navbar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(navbarData)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Navbar success:', responseData);
        setNotification(responseData.message || 'تم حفظ بيانات النافبار بنجاح!');
      } else {
        const errorData = await response.json();
        console.error('❌ Navbar server error:', errorData);
        setNotification(errorData.message || errorData.error || 'حدث خطأ في الخادم');
      }
    } catch (err) {
      console.error('❌ Navbar submit error:', err);
      setNotification('حدث خطأ في الاتصال بالخادم: ' + err.message);
    }
    
    setLoading(false);
  };

  // ===== إضافة رابط للنافبار =====
  const addNavbarLink = () => {
    const newLink = {
      id: Date.now(),
      name_ar: '',
      name_en: '',
      url: '',
      target: '_self',
      order: navbarData.links.length + 1,
      is_active: true
    };
    
    setNavbarData(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));
  };

  // ===== تحديث رابط في النافبار =====
  const updateNavbarLink = (index, field, value) => {
    setNavbarData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  // ===== حذف رابط من النافبار =====
  const removeNavbarLink = (index) => {
    setNavbarData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  // ===== حفظ بيانات الفوتر =====
  const handleFooterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔍 Footer data before submit:', footerData);
      
      const response = await makeAuthenticatedRequest('/api/super-admin/footer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(footerData)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Footer success:', responseData);
        setNotification(responseData.message || 'تم حفظ بيانات الفوتر بنجاح!');
      } else {
        const errorData = await response.json();
        console.error('❌ Footer server error:', errorData);
        setNotification(errorData.message || errorData.error || 'حدث خطأ في الخادم');
      }
    } catch (err) {
      console.error('❌ Footer submit error:', err);
      setNotification('حدث خطأ في الاتصال بالخادم: ' + err.message);
    }
    
    setLoading(false);
  };

  // ===== حفظ بيانات الصفحة الرئيسية =====
  const handleHomepageSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔍 Homepage data before submit:', homepageData);
      
      const response = await makeAuthenticatedRequest('/api/super-admin/homepage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(homepageData)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Homepage success:', responseData);
        setNotification(responseData.message || 'تم حفظ بيانات الصفحة الرئيسية بنجاح!');
      } else {
        const errorData = await response.json();
        console.error('❌ Homepage server error:', errorData);
        setNotification(errorData.message || errorData.error || 'حدث خطأ في الخادم');
      }
    } catch (err) {
      console.error('❌ Homepage submit error:', err);
      setNotification('حدث خطأ في الاتصال بالخادم: ' + err.message);
    }
    
    setLoading(false);
  };

  // ===== إضافة ميزة للصفحة الرئيسية =====
  const addHomepageFeature = () => {
    const newFeature = {
      id: Date.now(),
      title_ar: '',
      title_en: '',
      description_ar: '',
      description_en: '',
      icon: '',
      order: homepageData.features.length + 1
    };
    
    setHomepageData(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));
  };

  // ===== تحديث ميزة في الصفحة الرئيسية =====
  const updateHomepageFeature = (index, field, value) => {
    setHomepageData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }));
  };

  // ===== حذف ميزة من الصفحة الرئيسية =====
  const removeHomepageFeature = (index) => {
    setHomepageData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

/* ===== نهاية الجزء الخامس: دوال إدارة الصفحات والمحتوى ===== */
/* ===== بداية الجزء السادس: دوال useEffect والتحميل الأولي ===== */

  // ===== useEffect للتحميل الأولي =====
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchStats();
      setLoading(false);
    };
    
    loadData();
  }, []);

  // ===== useEffect لجلب البيانات حسب التبويب النشط =====
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'plans') {
      fetchPlans();
    } else if (activeTab === 'pages') {
      fetchPages();
    } else if (activeTab === 'payment') {
      fetchPaymentSettings();
    } else if (activeTab === 'navbar') {
      fetchNavbarData();
    } else if (activeTab === 'footer') {
      fetchFooterData();
    } else if (activeTab === 'homepage') {
      fetchHomepageData();
    }
  }, [activeTab]);

  // ===== useEffect لإخفاء الإشعارات تلقائياً =====
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // ===== دوال التصفية والبحث =====
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.national_id && user.national_id.includes(searchTerm));
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'active' && user.is_active) ||
                         (filterStatus === 'inactive' && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.name_en?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // ===== رسائل التحميل والأخطاء =====
  if (loading && activeTab === 'dashboard') {
    return (
      <DashboardLayout title="لوحة تحكم المشرف الأكبر" userType="super_admin">
        <div className={styles.loadingSpinner}>
          جاري تحميل البيانات...
        </div>
      </DashboardLayout>
    );
  }

/* ===== نهاية الجزء السادس: دوال useEffect والتحميل الأولي ===== */
/* ===== بداية الجزء السابع: الواجهة الرئيسية والسايدبار ===== */

  return (
    <DashboardLayout title="لوحة تحكم المشرف الأكبر" userType="super_admin">
      <div className={styles.superAdminDashboard}>
        {/* السايد بار */}
        <div className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
          <div className={styles.sidebarHeader}>
            <div className={styles.logo}>
              <Shield className="w-8 h-8" />
            </div>
            {sidebarOpen && (
              <div>
                <h3 className={styles.sidebarTitle}>المشرف الأكبر</h3>
                <p className={styles.userRole}>إدارة شاملة للنظام</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={styles.sidebarToggle}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          
          <nav>
            <ul className={styles.navTabs}>
              <li 
                className={`${styles.navTab} ${activeTab === 'dashboard' ? styles.active : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <BarChart3 className={styles.navIcon} />
                {sidebarOpen && 'لوحة المعلومات'}
              </li>
              <li 
                className={`${styles.navTab} ${activeTab === 'users' ? styles.active : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <Users className={styles.navIcon} />
                {sidebarOpen && 'إدارة المستخدمين'}
              </li>
              <li 
                className={`${styles.navTab} ${activeTab === 'plans' ? styles.active : ''}`}
                onClick={() => setActiveTab('plans')}
              >
                <Package className={styles.navIcon} />
                {sidebarOpen && 'إدارة الخطط'}
              </li>
              <li 
                className={`${styles.navTab} ${activeTab === 'pages' ? styles.active : ''}`}
                onClick={() => setActiveTab('pages')}
              >
                <FileText className={styles.navIcon} />
                {sidebarOpen && 'إدارة الصفحات'}
              </li>
              <li 
                className={`${styles.navTab} ${activeTab === 'payment' ? styles.active : ''}`}
                onClick={() => setActiveTab('payment')}
              >
                <CreditCard className={styles.navIcon} />
                {sidebarOpen && 'إعدادات الدفع'}
              </li>
              <li 
                className={`${styles.navTab} ${activeTab === 'navbar' ? styles.active : ''}`}
                onClick={() => setActiveTab('navbar')}
              >
                <Navigation className={styles.navIcon} />
                {sidebarOpen && 'إدارة النافبار'}
              </li>
              <li 
                className={`${styles.navTab} ${activeTab === 'footer' ? styles.active : ''}`}
                onClick={() => setActiveTab('footer')}
              >
                <Layout className={styles.navIcon} />
                {sidebarOpen && 'إدارة الفوتر'}
              </li>
              <li 
                className={`${styles.navTab} ${activeTab === 'homepage' ? styles.active : ''}`}
                onClick={() => setActiveTab('homepage')}
              >
                <Home className={styles.navIcon} />
                {sidebarOpen && 'الصفحة الرئيسية'}
              </li>
              <li 
                className={`${styles.navTab} ${activeTab === 'auth-pages' ? styles.active : ''}`}
                onClick={() => setActiveTab('auth-pages')}
              >
                <UserPlus className={styles.navIcon} />
                {sidebarOpen && 'صفحات التسجيل'}
              </li>
              <li 
                className={`${styles.navTab} ${activeTab === 'content' ? styles.active : ''}`}
                onClick={() => setActiveTab('content')}
              >
                <BookOpen className={styles.navIcon} />
                {sidebarOpen && 'إدارة المحتوى'}
              </li>
              <li 
                className={`${styles.navTab} ${activeTab === 'design' ? styles.active : ''}`}
                onClick={() => setActiveTab('design')}
              >
                <Palette className={styles.navIcon} />
                {sidebarOpen && 'تصميم الواجهات'}
              </li>
              <li 
                className={`${styles.navTab} ${activeTab === 'system' ? styles.active : ''}`}
                onClick={() => setActiveTab('system')}
              >
                <Settings className={styles.navIcon} />
                {sidebarOpen && 'إعدادات النظام'}
              </li>
            </ul>
          </nav>
        </div>

        {/* المحتوى الرئيسي */}
        <div className={styles.mainContent}>
          {/* رأس الصفحة */}
          <div className={styles.header}>
            <div>
              <h1 className={styles.pageTitle}>
                {activeTab === 'dashboard' && 'لوحة المعلومات'}
                {activeTab === 'users' && 'إدارة المستخدمين'}
                {activeTab === 'plans' && 'إدارة الخطط'}
                {activeTab === 'pages' && 'إدارة الصفحات'}
                {activeTab === 'payment' && 'إعدادات الدفع'}
                {activeTab === 'navbar' && 'إدارة النافبار'}
                {activeTab === 'footer' && 'إدارة الفوتر'}
                {activeTab === 'homepage' && 'إدارة الصفحة الرئيسية'}
                {activeTab === 'auth-pages' && 'صفحات التسجيل والحساب'}
                {activeTab === 'content' && 'إدارة المحتوى'}
                {activeTab === 'design' && 'تصميم الواجهات'}
                {activeTab === 'system' && 'إعدادات النظام'}
              </h1>
              <p className={styles.breadcrumb}>
                الرئيسية / المشرف الأكبر / {activeTab === 'dashboard' && 'لوحة المعلومات'}
                {activeTab === 'users' && 'المستخدمين'}
                {activeTab === 'plans' && 'الخطط'}
                {activeTab === 'pages' && 'الصفحات'}
                {activeTab === 'payment' && 'الدفع'}
                {activeTab === 'navbar' && 'النافبار'}
                {activeTab === 'footer' && 'الفوتر'}
                {activeTab === 'homepage' && 'الصفحة الرئيسية'}
                {activeTab === 'auth-pages' && 'صفحات التسجيل'}
                {activeTab === 'content' && 'المحتوى'}
                {activeTab === 'design' && 'التصميم'}
                {activeTab === 'system' && 'النظام'}
              </p>
            </div>
            <div className={styles.headerActions}>
              <button 
                className={styles.refreshButton}
                onClick={() => {
                  if (activeTab === 'dashboard') fetchStats();
                  else if (activeTab === 'users') fetchUsers();
                  else if (activeTab === 'plans') fetchPlans();
                  else if (activeTab === 'pages') fetchPages();
                  else if (activeTab === 'payment') fetchPaymentSettings();
                  else if (activeTab === 'navbar') fetchNavbarData();
                  else if (activeTab === 'footer') fetchFooterData();
                  else if (activeTab === 'homepage') fetchHomepageData();
                }}
              >
                <RefreshCw />
                تحديث
              </button>
            </div>
          </div>

          {/* عرض الأخطاء */}
          {error && (
            <div className={styles.errorMessage}>
              {error}
              <button onClick={() => setError(null)} style={{float: 'left'}}>×</button>
            </div>
          )}

          {/* عرض الإشعارات */}
          {notification && (
            <div className={styles.notification}>
              <span>{notification}</span>
              <button 
                onClick={() => setNotification('')}
                className={styles.notificationClose}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* محتوى التبويب */}
          <div className={styles.tabContent}>
            {/* لوحة المعلومات */}
            {activeTab === 'dashboard' && <DashboardOverview />}
            
            {/* إدارة المستخدمين */}
            {activeTab === 'users' && <UsersManager />}
            
            {/* إدارة الخطط */}
            {activeTab === 'plans' && <PlansManager />}
            
            {/* إدارة الصفحات */}
            {activeTab === 'pages' && <PagesManager />}
            
            {/* إعدادات الدفع */}
            {activeTab === 'payment' && <PaymentManager />}
            
            {/* إدارة النافبار */}
            {activeTab === 'navbar' && <NavbarManager />}
            
            {/* إدارة الفوتر */}
            {activeTab === 'footer' && <FooterManager />}
            
            {/* إدارة الصفحة الرئيسية */}
            {activeTab === 'homepage' && <HomepageManager />}
            
            {/* صفحات التسجيل والحساب */}
            {activeTab === 'auth-pages' && <AuthPagesManager />}
            
            {/* إدارة المحتوى */}
            {activeTab === 'content' && <ContentManager />}
            
            {/* تصميم الواجهات */}
            {activeTab === 'design' && <DesignManager />}
            
            {/* إعدادات النظام */}
            {activeTab === 'system' && <SystemManager />}
          </div>
        </div>

/* ===== نهاية الجزء السابع: الواجهة الرئيسية والسايدبار ===== */
</div>
/* ===== بداية الجزء الثامن: مكونات لوحة المعلومات والمستخدمين ===== */

        {/* مكونات التبويبات */}
        
        // لوحة المعلومات
        const DashboardOverview = () => (
          <div className={styles.fadeIn}>
            <h2 className={styles.sectionTitle}>إحصائيات النظام</h2>
            
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.users}`}>
                <div className={styles.statInfo}>
                  <h3>{stats.totalUsers}</h3>
                  <p>إجمالي المستخدمين</p>
                </div>
                <Users className={styles.statIcon} />
              </div>
              
              <div className={`${styles.statCard} ${styles.subscriptions}`}>
                <div className={styles.statInfo}>
                  <h3>{stats.activeSubscriptions}</h3>
                  <p>الاشتراكات النشطة</p>
                </div>
                <Shield className={styles.statIcon} />
              </div>
              
              <div className={`${styles.statCard} ${styles.revenue}`}>
                <div className={styles.statInfo}>
                  <h3>{stats.monthlyRevenue}</h3>
                  <p>الإيرادات الشهرية (ر.س)</p>
                </div>
                <DollarSign className={styles.statIcon} />
              </div>
              
              <div className={`${styles.statCard} ${styles.health}`}>
                <div className={styles.statInfo}>
                  <h3>{stats.systemHealth}%</h3>
                  <p>صحة النظام</p>
                </div>
                <Database className={styles.statIcon} />
              </div>
            </div>

            <div className={styles.quickActions}>
              <h3>الإجراءات السريعة</h3>
              <div className={styles.actionGrid}>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`${styles.actionButton} ${styles.blue}`}
                >
                  <Users className="w-6 h-6" />
                  <span>إدارة المستخدمين</span>
                </button>
                <button
                  onClick={() => setActiveTab('plans')}
                  className={`${styles.actionButton} ${styles.green}`}
                >
                  <Package className="w-6 h-6" />
                  <span>إدارة الخطط</span>
                </button>
                <button
                  onClick={() => setActiveTab('payment')}
                  className={`${styles.actionButton} ${styles.purple}`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span>إعدادات الدفع</span>
                </button>
                <button
                  onClick={() => setActiveTab('homepage')}
                  className={`${styles.actionButton} ${styles.orange}`}
                >
                  <Home className="w-6 h-6" />
                  <span>الصفحة الرئيسية</span>
                </button>
              </div>
            </div>
          </div>
        );

        // إدارة المستخدمين
        const UsersManager = () => (
          <div className={styles.fadeIn}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>إدارة المستخدمين ({filteredUsers.length})</h2>
              <button 
                className={styles.addButton}
                onClick={() => {
                  setEditingUser(null);
                  resetUserForm();
                  setShowUserModal(true);
                }}
              >
                <Plus />
                إضافة مستخدم جديد
              </button>
            </div>

            {/* شريط البحث والتصفية */}
            <div className={styles.filterBar}>
              <div className={styles.searchBox}>
                <Search />
                <input
                  type="text"
                  placeholder="البحث في المستخدمين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">جميع الأدوار</option>
                {userRoles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>

            {/* جدول المستخدمين */}
            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>المستخدم</th>
                    <th>الدور</th>
                    <th>معلومات إضافية</th>
                    <th>الحالة</th>
                    <th>التحقق</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className={styles.userInfo}>
                          <div className={styles.userAvatar}>
                            {user.role === 'super_admin' && <Crown className="w-5 h-5 text-yellow-500" />}
                            {user.role === 'manager' && <Briefcase className="w-5 h-5 text-purple-500" />}
                            {user.role === 'supervisor' && <Shield className="w-5 h-5 text-blue-500" />}
                            {user.role === 'teacher' && <GraduationCap className="w-5 h-5 text-green-500" />}
                            {user.role === 'student' && <School className="w-5 h-5 text-orange-500" />}
                          </div>
                          <div>
                            <div className={styles.userName}>
                              {user.name}
                              {user.email_verified_at && <Verified className="w-4 h-4 text-green-500" />}
                            </div>
                            <div className={styles.userEmail}>{user.email}</div>
                            <div className={styles.userID}>
                              الهوية: {user.national_id || 'غير محدد'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                          {userRoles.find(r => r.value === user.role)?.label || user.role}
                        </span>
                      </td>
                      <td>
                        <div className={styles.additionalInfo}>
                          <div>📱 {user.phone || 'لا يوجد هاتف'}</div>
                          {user.school_name && <div>🏫 {user.school_name}</div>}
                          {user.level && <div>📚 {user.level}</div>}
                          {user.grade && <div>📖 {user.grade}</div>}
                        </div>
                      </td>
                      <td>
                        <span className={user.is_active ? styles.statusActive : styles.statusInactive}>
                          {user.is_active ? 'نشط' : 'معطل'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.verificationStatus}>
                          {user.email_verified_at ? (
                            <span className={styles.verified}>✓ بريد مؤكد</span>
                          ) : (
                            <span className={styles.unverified}>⚠ بريد غير مؤكد</span>
                          )}
                          {user.phone_verified_at ? (
                            <span className={styles.verified}>✓ هاتف مؤكد</span>
                          ) : (
                            <span className={styles.unverified}>⚠ هاتف غير مؤكد</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => updateUserStatus(user.id, !user.is_active)}
                            className={`${styles.actionBtn} ${user.is_active ? styles.warning : styles.success}`}
                            title={user.is_active ? 'إلغاء التفعيل' : 'تفعيل'}
                          >
                            {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => resetUserPassword(user.id)}
                            className={`${styles.actionBtn} ${styles.info}`}
                            title="إعادة تعيين كلمة المرور"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          {!user.email_verified_at && (
                            <button
                              onClick={() => verifyUserEmail(user.id)}
                              className={`${styles.actionBtn} ${styles.warning}`}
                              title="إرسال رسالة تأكيد البريد الإلكتروني"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          )}
                          {!user.phone_verified_at && user.phone && (
                            <button
                              onClick={() => verifyUserPhone(user.id)}
                              className={`${styles.actionBtn} ${styles.warning}`}
                              title="إرسال رمز تأكيد الهاتف"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleUserEdit(user)}
                            className={`${styles.actionBtn} ${styles.edit}`}
                            title="تعديل"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUserDelete(user.id)}
                            className={`${styles.actionBtn} ${styles.delete}`}
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className={styles.emptyState}>
                  <Users2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>لا توجد مستخدمين مطابقين للبحث</p>
                </div>
              )}
            </div>
          </div>
        );

/* ===== نهاية الجزء الثامن: مكونات لوحة المعلومات والمستخدمين ===== */
</DashboardLayout>

/* ===== بداية الجزء التاسع: مكونات الخطط والصفحات ===== */

        // إدارة الخطط
        const PlansManager = () => (
          <div className={styles.fadeIn}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>إدارة الخطط ({filteredPlans.length})</h2>
              <button 
                className={styles.addButton}
                onClick={() => {
                  setEditingPlan(null);
                  resetPlanForm();
                  setShowPlanModal(true);
                }}
              >
                <Plus />
                إضافة خطة جديدة
              </button>
            </div>

            {/* شريط البحث */}
            <div className={styles.filterBar}>
              <div className={styles.searchBox}>
                <Search />
                <input
                  type="text"
                  placeholder="البحث في الخطط..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* عرض الخطط */}
            <div className={styles.plansGrid}>
              {filteredPlans.map(plan => (
                <div key={plan.id} className={styles.planCard}>
                  <div className={styles.planHeader}>
                    <h3 className={styles.planName}>
                      {plan.name_ar}
                      {plan.is_featured && <Star className="w-5 h-5 text-yellow-500" />}
                    </h3>
                    <div className={styles.planPrice}>
                      {plan.price} ر.س
                    </div>
                  </div>
                  
                  <div className={styles.planContent}>
                    <p className={styles.planDescription}>
                      {plan.description_ar}
                    </p>
                    
                    <div className={styles.planMeta}>
                      <span className={styles.planDuration}>
                        <Clock className="w-4 h-4" />
                        {plan.duration_days} يوم
                      </span>
                      <span className={plan.is_active ? styles.statusActive : styles.statusInactive}>
                        {plan.is_active ? 'نشط' : 'معطل'}
                      </span>
                      {plan.is_featured && (
                        <span className={styles.featuredBadge}>
                          مميز
                        </span>
                      )}
                    </div>

                    {plan.features && plan.features.length > 0 && (
                      <div className={styles.planFeatures}>
                        <h4>الميزات:</h4>
                        <ul>
                          {plan.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.planActions}>
                    <button
                      onClick={() => handlePlanEdit(plan)}
                      className={`${styles.actionBtn} ${styles.edit}`}
                      title="تعديل"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePlanDelete(plan.id)}
                      className={`${styles.actionBtn} ${styles.delete}`}
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredPlans.length === 0 && (
                <div className={styles.emptyState}>
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>لا توجد خطط متاحة</p>
                </div>
              )}
            </div>
          </div>
        );

        // إدارة الصفحات
        const PagesManager = () => (
          <div className={styles.fadeIn}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>إدارة الصفحات</h2>
            </div>

            <div className={styles.pagesGrid}>
              {pageTypes.map(pageType => (
                <div key={pageType.value} className={styles.pageCard}>
                  <div className={styles.pageHeader}>
                    <h3 className={styles.pageName}>{pageType.label}</h3>
                    <button
                      onClick={() => handlePageEdit(pageType.value)}
                      className={`${styles.btn} ${styles.btnSecondary}`}
                    >
                      <Edit3 className="w-4 h-4" />
                      تعديل
                    </button>
                  </div>
                  <div className={styles.pageContent}>
                    <p>
                      {pages[pageType.value]?.content_ar?.substring(0, 150) || 'لم يتم إضافة محتوى بعد...'}
                      {pages[pageType.value]?.content_ar?.length > 150 && '...'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

        // إعدادات الدفع
        const PaymentManager = () => (
          <div className={styles.fadeIn}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>إعدادات الدفع</h2>
              <div className={styles.headerButtons}>
                <button
                  onClick={testPaymentConnection}
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  disabled={loading}
                >
                  <TestTube className="w-4 h-4" />
                  اختبار الاتصال
                </button>
                <button
                  onClick={handlePaymentSettingsSubmit}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={loading}
                >
                  <Save className="w-4 h-4" />
                  حفظ الإعدادات
                </button>
              </div>
            </div>

            <div className={styles.paymentSettings}>
              {/* الإعدادات العامة */}
              <div className={styles.settingsSection}>
                <h3>الإعدادات العامة</h3>
                <div className={styles.settingsGrid}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={paymentSettings.payment_enabled}
                      onChange={(e) => setPaymentSettings(prev => ({ 
                        ...prev, 
                        payment_enabled: e.target.checked 
                      }))}
                    />
                    تفعيل نظام الدفع
                  </label>
                  
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={paymentSettings.payment_test_mode}
                      onChange={(e) => setPaymentSettings(prev => ({ 
                        ...prev, 
                        payment_test_mode: e.target.checked 
                      }))}
                    />
                    وضع الاختبار
                  </label>

                  <div className={styles.formGroup}>
                    <label>بوابة الدفع</label>
                    <select
                      value={paymentSettings.payment_gateway}
                      onChange={(e) => setPaymentSettings(prev => ({ 
                        ...prev, 
                        payment_gateway: e.target.value 
                      }))}
                      className={styles.formInput}
                    >
                      {paymentGateways.map(gateway => (
                        <option key={gateway.value} value={gateway.value}>
                          {gateway.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>العملة</label>
                    <select
                      value={paymentSettings.payment_currency}
                      onChange={(e) => setPaymentSettings(prev => ({ 
                        ...prev, 
                        payment_currency: e.target.value 
                      }))}
                      className={styles.formInput}
                    >
                      {currencies.map(currency => (
                        <option key={currency.value} value={currency.value}>
                          {currency.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* إعدادات Stripe */}
              {paymentSettings.payment_gateway === 'stripe' && (
                <div className={styles.settingsSection}>
                  <h3>إعدادات Stripe</h3>
                  <div className={styles.settingsGrid}>
                    <div className={styles.formGroup}>
                      <label>Stripe Public Key</label>
                      <input
                        type="text"
                        value={paymentSettings.stripe_public_key}
                        onChange={(e) => setPaymentSettings(prev => ({ 
                          ...prev, 
                          stripe_public_key: e.target.value 
                        }))}
                        placeholder="pk_test_..."
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Stripe Secret Key</label>
                      <input
                        type="password"
                        value={paymentSettings.stripe_secret_key}
                        onChange={(e) => setPaymentSettings(prev => ({ 
                          ...prev, 
                          stripe_secret_key: e.target.value 
                        }))}
                        placeholder="sk_test_..."
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* إعدادات PayPal */}
              {paymentSettings.payment_gateway === 'paypal' && (
                <div className={styles.settingsSection}>
                  <h3>إعدادات PayPal</h3>
                  <div className={styles.settingsGrid}>
                    <div className={styles.formGroup}>
                      <label>PayPal Client ID</label>
                      <input
                        type="text"
                        value={paymentSettings.paypal_client_id}
                        onChange={(e) => setPaymentSettings(prev => ({ 
                          ...prev, 
                          paypal_client_id: e.target.value 
                        }))}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>PayPal Client Secret</label>
                      <input
                        type="password"
                        value={paymentSettings.paypal_client_secret}
                        onChange={(e) => setPaymentSettings(prev => ({ 
                          ...prev, 
                          paypal_client_secret: e.target.value 
                        }))}
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* إعدادات التحويل البنكي */}
              {paymentSettings.payment_gateway === 'bank_transfer' && (
                <div className={styles.settingsSection}>
                  <h3>إعدادات التحويل البنكي</h3>
                  <div className={styles.settingsGrid}>
                    <div className={styles.formGroup}>
                      <label>اسم البنك</label>
                      <input
                        type="text"
                        value={paymentSettings.bank_name}
                        onChange={(e) => setPaymentSettings(prev => ({ 
                          ...prev, 
                          bank_name: e.target.value 
                        }))}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>رقم الحساب البنكي</label>
                      <input
                        type="text"
                        value={paymentSettings.bank_account_number}
                        onChange={(e) => setPaymentSettings(prev => ({ 
                          ...prev, 
                          bank_account_number: e.target.value 
                        }))}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>رقم الآيبان (IBAN)</label>
                      <input
                        type="text"
                        value={paymentSettings.iban}
                        onChange={(e) => setPaymentSettings(prev => ({ 
                          ...prev, 
                          iban: e.target.value 
                        }))}
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

/* ===== نهاية الجزء التاسع: مكونات الخطط والصفحات ===== */

/* ===== بداية الجزء العاشر: مكونات النافبار والفوتر والصفحة الرئيسية ===== */

        // إدارة النافبار
        const NavbarManager = () => (
          <div className={styles.fadeIn}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>إدارة النافبار</h2>
              <button
                onClick={handleNavbarSubmit}
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={loading}
              >
                <Save className="w-4 h-4" />
                حفظ التغييرات
              </button>
            </div>

            <div className={styles.navbarSettings}>
              {/* إعدادات الشعار */}
              <div className={styles.settingsSection}>
                <h3>الشعار</h3>
                <div className={styles.formGroup}>
                  <label>مسار الشعار</label>
                  <input
                    type="text"
                    value={navbarData.logo_path}
                    onChange={(e) => setNavbarData(prev => ({ 
                      ...prev, 
                      logo_path: e.target.value 
                    }))}
                    placeholder="/assets/logo.svg"
                    className={styles.formInput}
                  />
                </div>
              </div>

              {/* روابط النافبار */}
              <div className={styles.settingsSection}>
                <div className={styles.sectionHeader}>
                  <h3>روابط النافبار</h3>
                  <button
                    onClick={addNavbarLink}
                    className={`${styles.btn} ${styles.btnSecondary}`}
                  >
                    <Plus className="w-4 h-4" />
                    إضافة رابط
                  </button>
                </div>
                
                <div className={styles.linksList}>
                  {navbarData.links.map((link, index) => (
                    <div key={index} className={styles.linkItem}>
                      <div className={styles.linkFields}>
                        <input
                          type="text"
                          value={link.name_ar}
                          onChange={(e) => updateNavbarLink(index, 'name_ar', e.target.value)}
                          placeholder="اسم الرابط (عربي)"
                          className={styles.formInput}
                        />
                        <input
                          type="text"
                          value={link.name_en}
                          onChange={(e) => updateNavbarLink(index, 'name_en', e.target.value)}
                          placeholder="اسم الرابط (إنجليزي)"
                          className={styles.formInput}
                        />
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => updateNavbarLink(index, 'url', e.target.value)}
                          placeholder="الرابط"
                          className={styles.formInput}
                        />
                        <select
                          value={link.target}
                          onChange={(e) => updateNavbarLink(index, 'target', e.target.value)}
                          className={styles.formInput}
                        >
                          <option value="_self">نفس النافذة</option>
                          <option value="_blank">نافذة جديدة</option>
                        </select>
                        <input
                          type="number"
                          value={link.order}
                          onChange={(e) => updateNavbarLink(index, 'order', parseInt(e.target.value))}
                          placeholder="الترتيب"
                          className={styles.formInput}
                          style={{ width: '80px' }}
                        />
                      </div>
                      <div className={styles.linkControls}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={link.is_active}
                            onChange={(e) => updateNavbarLink(index, 'is_active', e.target.checked)}
                          />
                          نشط
                        </label>
                        <button
                          onClick={() => removeNavbarLink(index)}
                          className={`${styles.actionBtn} ${styles.delete}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

        // إدارة الفوتر
        const FooterManager = () => (
          <div className={styles.fadeIn}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>إدارة الفوتر</h2>
              <button
                onClick={handleFooterSubmit}
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={loading}
              >
                <Save className="w-4 h-4" />
                حفظ التغييرات
              </button>
            </div>

            <div className={styles.footerSettings}>
              {/* المعلومات الأساسية */}
              <div className={styles.settingsSection}>
                <h3>المعلومات الأساسية</h3>
                <div className={styles.settingsGrid}>
                  <div className={styles.formGroup}>
                    <label>مسار شعار الفوتر</label>
                    <input
                      type="text"
                      value={footerData.logo_path}
                      onChange={(e) => setFooterData(prev => ({ 
                        ...prev, 
                        logo_path: e.target.value 
                      }))}
                      placeholder="/assets/logo-footer.svg"
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>وصف الموقع</label>
                    <textarea
                      value={footerData.description}
                      onChange={(e) => setFooterData(prev => ({ 
                        ...prev, 
                        description: e.target.value 
                      }))}
                      placeholder="وصف مختصر عن الموقع..."
                      className={styles.formInput}
                      rows={3}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>نص حقوق الطبع والنشر</label>
                    <input
                      type="text"
                      value={footerData.copyright}
                      onChange={(e) => setFooterData(prev => ({ 
                        ...prev, 
                        copyright: e.target.value 
                      }))}
                      placeholder="© 2024 جميع الحقوق محفوظة"
                      className={styles.formInput}
                    />
                  </div>
                </div>
              </div>

              {/* معلومات التواصل */}
              <div className={styles.settingsSection}>
                <h3>معلومات التواصل</h3>
                <div className={styles.settingsGrid}>
                  <div className={styles.formGroup}>
                    <label>رقم الهاتف</label>
                    <input
                      type="tel"
                      value={footerData.contact.phone}
                      onChange={(e) => setFooterData(prev => ({ 
                        ...prev, 
                        contact: { ...prev.contact, phone: e.target.value }
                      }))}
                      placeholder="+966501234567"
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={footerData.contact.email}
                      onChange={(e) => setFooterData(prev => ({ 
                        ...prev, 
                        contact: { ...prev.contact, email: e.target.value }
                      }))}
                      placeholder="info@example.com"
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>ساعات العمل</label>
                    <input
                      type="text"
                      value={footerData.contact.workHours}
                      onChange={(e) => setFooterData(prev => ({ 
                        ...prev, 
                        contact: { ...prev.contact, workHours: e.target.value }
                      }))}
                      placeholder="الأحد - الخميس: 8:00 ص - 5:00 م"
                      className={styles.formInput}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

        // إدارة الصفحة الرئيسية
        const HomepageManager = () => (
          <div className={styles.fadeIn}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>إدارة الصفحة الرئيسية</h2>
              <button
                onClick={handleHomepageSubmit}
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={loading}
              >
                <Save className="w-4 h-4" />
                حفظ التغييرات
              </button>
            </div>

            <div className={styles.homepageSettings}>
              {/* قسم البطل (Hero Section) */}
              <div className={styles.settingsSection}>
                <h3>قسم البطل (Hero Section)</h3>
                <div className={styles.settingsGrid}>
                  <div className={styles.formGroup}>
                    <label>العنوان الرئيسي</label>
                    <input
                      type="text"
                      value={homepageData.hero_title}
                      onChange={(e) => setHomepageData(prev => ({ 
                        ...prev, 
                        hero_title: e.target.value 
                      }))}
                      placeholder="مرحباً بك في منصتنا التعليمية"
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>العنوان الفرعي</label>
                    <textarea
                      value={homepageData.hero_subtitle}
                      onChange={(e) => setHomepageData(prev => ({ 
                        ...prev, 
                        hero_subtitle: e.target.value 
                      }))}
                      placeholder="وصف مختصر عن المنصة وأهدافها..."
                      className={styles.formInput}
                      rows={3}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>نص زر الدعوة للعمل</label>
                    <input
                      type="text"
                      value={homepageData.hero_cta_text}
                      onChange={(e) => setHomepageData(prev => ({ 
                        ...prev, 
                        hero_cta_text: e.target.value 
                      }))}
                      placeholder="ابدأ الآن"
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>رابط زر الدعوة للعمل</label>
                    <input
                      type="text"
                      value={homepageData.hero_cta_link}
                      onChange={(e) => setHomepageData(prev => ({ 
                        ...prev, 
                        hero_cta_link: e.target.value 
                      }))}
                      placeholder="/register"
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>مسار صورة القسم الرئيسي</label>
                    <input
                      type="text"
                      value={homepageData.hero_image}
                      onChange={(e) => setHomepageData(prev => ({ 
                        ...prev, 
                        hero_image: e.target.value 
                      }))}
                      placeholder="/assets/hero-image.jpg"
                      className={styles.formInput}
                    />
                  </div>
                </div>
              </div>

              {/* الميزات */}
              <div className={styles.settingsSection}>
                <div className={styles.sectionHeader}>
                  <h3>الميزات</h3>
                  <button
                    onClick={addHomepageFeature}
                    className={`${styles.btn} ${styles.btnSecondary}`}
                  >
                    <Plus className="w-4 h-4" />
                    إضافة ميزة
                  </button>
                </div>
                
                <div className={styles.featuresList}>
                  {homepageData.features.map((feature, index) => (
                    <div key={index} className={styles.featureItem}>
                      <div className={styles.featureFields}>
                        <input
                          type="text"
                          value={feature.title_ar}
                          onChange={(e) => updateHomepageFeature(index, 'title_ar', e.target.value)}
                          placeholder="عنوان الميزة (عربي)"
                          className={styles.formInput}
                        />
                        <input
                          type="text"
                          value={feature.title_en}
                          onChange={(e) => updateHomepageFeature(index, 'title_en', e.target.value)}
                          placeholder="عنوان الميزة (إنجليزي)"
                          className={styles.formInput}
                        />
                        <textarea
                          value={feature.description_ar}
                          onChange={(e) => updateHomepageFeature(index, 'description_ar', e.target.value)}
                          placeholder="وصف الميزة (عربي)"
                          className={styles.formInput}
                          rows={2}
                        />
                        <input
                          type="text"
                          value={feature.icon}
                          onChange={(e) => updateHomepageFeature(index, 'icon', e.target.value)}
                          placeholder="أيقونة الميزة"
                          className={styles.formInput}
                        />
                      </div>
                      <button
                        onClick={() => removeHomepageFeature(index)}
                        className={`${styles.actionBtn} ${styles.delete}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

/* ===== نهاية الجزء العاشر: مكونات النافبار والفوتر والصفحة الرئيسية ===== */

/* ===== بداية الجزء الحادي عشر: المكونات المتبقية ===== */

        // صفحات التسجيل والحساب
        const AuthPagesManager = () => (
          <div className={styles.fadeIn}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>صفحات التسجيل والحساب</h2>
            </div>

            <div className={styles.authPagesGrid}>
              <div className={styles.pageCard}>
                <div className={styles.pageHeader}>
                  <h3>صفحة تسجيل الدخول</h3>
                  <button className={`${styles.btn} ${styles.btnSecondary}`}>
                    <Edit3 className="w-4 h-4" />
                    تعديل
                  </button>
                </div>
                <div className={styles.pageContent}>
                  <p>إدارة محتوى وتصميم صفحة تسجيل الدخول</p>
                </div>
              </div>

              <div className={styles.pageCard}>
                <div className={styles.pageHeader}>
                  <h3>صفحة إنشاء الحساب</h3>
                  <button className={`${styles.btn} ${styles.btnSecondary}`}>
                    <Edit3 className="w-4 h-4" />
                    تعديل
                  </button>
                </div>
                <div className={styles.pageContent}>
                  <p>إدارة محتوى وتصميم صفحة إنشاء الحساب</p>
                </div>
              </div>

              <div className={styles.pageCard}>
                <div className={styles.pageHeader}>
                  <h3>صفحة اختيار نوع المستخدم</h3>
                  <button className={`${styles.btn} ${styles.btnSecondary}`}>
                    <Edit3 className="w-4 h-4" />
                    تعديل
                  </button>
                </div>
                <div className={styles.pageContent}>
                  <p>إدارة صفحة اختيار نوع المستخدم (طالب، معلم، مدير، مشرف)</p>
                </div>
              </div>
            </div>
          </div>
        );

        // إدارة المحتوى
        const ContentManager = () => (
          <div className={styles.fadeIn}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>إدارة المحتوى</h2>
            </div>

            <div className={styles.contentGrid}>
              <div className={styles.contentCard}>
                <div className={styles.contentHeader}>
                  <h3>المقالات والأخبار</h3>
                  <button className={`${styles.btn} ${styles.btnSecondary}`}>
                    <Plus className="w-4 h-4" />
                    إضافة مقال
                  </button>
                </div>
                <div className={styles.contentBody}>
                  <p>إدارة المقالات والأخبار المعروضة في الموقع</p>
                </div>
              </div>

              <div className={styles.contentCard}>
                <div className={styles.contentHeader}>
                  <h3>الأسئلة الشائعة</h3>
                  <button className={`${styles.btn} ${styles.btnSecondary}`}>
                    <Plus className="w-4 h-4" />
                    إضافة سؤال
                  </button>
                </div>
                <div className={styles.contentBody}>
                  <p>إدارة الأسئلة الشائعة وإجاباتها</p>
                </div>
              </div>

              <div className={styles.contentCard}>
                <div className={styles.contentHeader}>
                  <h3>المحتوى التعليمي</h3>
                  <button className={`${styles.btn} ${styles.btnSecondary}`}>
                    <Plus className="w-4 h-4" />
                    إضافة محتوى
                  </button>
                </div>
                <div className={styles.contentBody}>
                  <p>إدارة المحتوى التعليمي والدروس</p>
                </div>
              </div>
            </div>
          </div>
        );

        // تصميم الواجهات
        const DesignManager = () => (
          <div className={styles.fadeIn}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>تصميم الواجهات</h2>
            </div>

            <div className={styles.designGrid}>
              <div className={styles.designCard}>
                <div className={styles.designHeader}>
                  <h3>الألوان والخطوط</h3>
                </div>
                <div className={styles.designBody}>
                  <p>إدارة نظام الألوان والخطوط المستخدمة في الموقع</p>
                </div>
              </div>

              <div className={styles.designCard}>
                <div className={styles.designHeader}>
                  <h3>التخطيط والتصميم</h3>
                </div>
                <div className={styles.designBody}>
                  <p>إدارة تخطيط الصفحات وعناصر التصميم</p>
                </div>
              </div>

              <div className={styles.designCard}>
                <div className={styles.designHeader}>
                  <h3>التصميم المتجاوب</h3>
                </div>
                <div className={styles.designBody}>
                  <p>إعدادات التصميم للأجهزة المختلفة (جوال، تابلت، سطح المكتب)</p>
                </div>
              </div>
            </div>
          </div>
        );

        // إعدادات النظام
        const SystemManager = () => (
          <div className={styles.fadeIn}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>إعدادات النظام</h2>
            </div>

            <div className={styles.systemGrid}>
              <div className={styles.systemCard}>
                <div className={styles.systemHeader}>
                  <h3>الإعدادات العامة</h3>
                </div>
                <div className={styles.systemBody}>
                  <div className={styles.settingsGrid}>
                    <div className={styles.formGroup}>
                      <label>اسم الموقع</label>
                      <input
                        type="text"
                        placeholder="منصة مراس التعليمية"
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>وصف الموقع</label>
                      <input
                        type="text"
                        placeholder="منصة تعليمية متقدمة..."
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>البريد الإلكتروني للإدارة</label>
                      <input
                        type="email"
                        placeholder="admin@example.com"
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.systemCard}>
                <div className={styles.systemHeader}>
                  <h3>إعدادات الأمان</h3>
                </div>
                <div className={styles.systemBody}>
                  <div className={styles.securitySettings}>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" />
                      تفعيل المصادقة الثنائية للجميع
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" />
                      تسجيل جميع العمليات
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" />
                      تفعيل حماية من الهجمات
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.systemCard}>
                <div className={styles.systemHeader}>
                  <h3>النسخ الاحتياطي</h3>
                </div>
                <div className={styles.systemBody}>
                  <div className={styles.backupActions}>
                    <button className={`${styles.btn} ${styles.btnPrimary}`}>
                      <Download className="w-4 h-4" />
                      إنشاء نسخة احتياطية
                    </button>
                    <button className={`${styles.btn} ${styles.btnSecondary}`}>
                      <Upload className="w-4 h-4" />
                      استعادة نسخة احتياطية
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

/* ===== نهاية الجزء الحادي عشر: المكونات المتبقية ===== */

/* ===== بداية الجزء الثاني عشر: النوافذ المنبثقة الجزء الأول ===== */

        {/* النوافذ المنبثقة */}
        
        {/* نافذة إضافة/تعديل المستخدم */}
        {showUserModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>{editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                    resetUserForm();
                  }}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleUserSubmit} className={styles.modalForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>الاسم الكامل *</label>
                    <input
                      type="text"
                      value={userForm.name}
                      onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>البريد الإلكتروني *</label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>الدور *</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                      required
                    >
                      {userRoles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>كلمة المرور {!editingUser && '*'}</label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                      required={!editingUser}
                      placeholder={editingUser ? 'اتركها فارغة لعدم التغيير' : ''}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>رقم الهوية</label>
                    <input
                      type="text"
                      value={userForm.national_id}
                      onChange={(e) => setUserForm({...userForm, national_id: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>رقم الهاتف</label>
                    <input
                      type="tel"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>المرحلة التعليمية</label>
                    <input
                      type="text"
                      value={userForm.level}
                      onChange={(e) => setUserForm({...userForm, level: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>الصف</label>
                    <input
                      type="text"
                      value={userForm.grade}
                      onChange={(e) => setUserForm({...userForm, grade: e.target.value})}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>الإدارة التعليمية</label>
                    <input
                      type="text"
                      value={userForm.edu_admin}
                      onChange={(e) => setUserForm({...userForm, edu_admin: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>اسم المدرسة</label>
                    <input
                      type="text"
                      value={userForm.school_name}
                      onChange={(e) => setUserForm({...userForm, school_name: e.target.value})}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>نوع المدرسة</label>
                  <input
                    type="text"
                    value={userForm.school_type}
                    onChange={(e) => setUserForm({...userForm, school_type: e.target.value})}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={userForm.is_active}
                      onChange={(e) => setUserForm({...userForm, is_active: e.target.checked})}
                    />
                    حساب نشط
                  </label>
                </div>

                <div className={styles.modalActions}>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={() => {
                      setShowUserModal(false);
                      setEditingUser(null);
                      resetUserForm();
                    }}
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit" 
                    className={styles.saveButton}
                    disabled={loading}
                  >
                    {loading ? 'جاري الحفظ...' : (editingUser ? 'تحديث' : 'حفظ')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

/* ===== نهاية الجزء الثاني عشر: النوافذ المنبثقة الجزء الأول ===== */

/* ===== بداية الجزء الثالث عشر: النوافذ المنبثقة الجزء الثاني ===== */

        {/* نافذة إضافة/تعديل الخطة */}
        {showPlanModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>{editingPlan ? 'تعديل الخطة' : 'إضافة خطة جديدة'}</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => {
                    setShowPlanModal(false);
                    setEditingPlan(null);
                    resetPlanForm();
                  }}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handlePlanSubmit} className={styles.modalForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>اسم الخطة (عربي) *</label>
                    <input
                      type="text"
                      value={planForm.name_ar}
                      onChange={(e) => setPlanForm({...planForm, name_ar: e.target.value})}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>اسم الخطة (إنجليزي) *</label>
                    <input
                      type="text"
                      value={planForm.name_en}
                      onChange={(e) => setPlanForm({...planForm, name_en: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>السعر *</label>
                    <input
                      type="number"
                      value={planForm.price}
                      onChange={(e) => setPlanForm({...planForm, price: e.target.value})}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>مدة الخطة (يوم) *</label>
                    <input
                      type="number"
                      value={planForm.duration_days}
                      onChange={(e) => setPlanForm({...planForm, duration_days: parseInt(e.target.value)})}
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>وصف الخطة (عربي)</label>
                  <textarea
                    value={planForm.description_ar}
                    onChange={(e) => setPlanForm({...planForm, description_ar: e.target.value})}
                    rows="3"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>وصف الخطة (إنجليزي)</label>
                  <textarea
                    value={planForm.description_en}
                    onChange={(e) => setPlanForm({...planForm, description_en: e.target.value})}
                    rows="3"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>الميزات</label>
                  {planForm.features.map((feature, index) => (
                    <div key={index} className={styles.featureInput}>
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updatePlanFeature(index, e.target.value)}
                        placeholder="ميزة..."
                      />
                      <button
                        type="button"
                        onClick={() => removePlanFeature(index)}
                        className={styles.removeFeatureBtn}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeatureToPlan}
                    className={styles.addFeatureBtn}
                  >
                    <Plus className="w-4 h-4" />
                    إضافة ميزة
                  </button>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={planForm.is_active}
                      onChange={(e) => setPlanForm({...planForm, is_active: e.target.checked})}
                    />
                    خطة نشطة
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={planForm.is_featured}
                      onChange={(e) => setPlanForm({...planForm, is_featured: e.target.checked})}
                    />
                    خطة مميزة
                  </label>
                </div>

                <div className={styles.modalActions}>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={() => {
                      setShowPlanModal(false);
                      setEditingPlan(null);
                      resetPlanForm();
                    }}
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit" 
                    className={styles.saveButton}
                    disabled={loading}
                  >
                    {loading ? 'جاري الحفظ...' : (editingPlan ? 'تحديث' : 'حفظ')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* نافذة إضافة/تعديل الصفحة */}
        {showPageModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>تعديل الصفحة</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => {
                    setShowPageModal(false);
                    setEditingPage(null);
                    resetPageForm();
                  }}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handlePageSubmit} className={styles.modalForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>العنوان (عربي) *</label>
                    <input
                      type="text"
                      value={pageForm.title_ar}
                      onChange={(e) => setPageForm({...pageForm, title_ar: e.target.value})}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>العنوان (إنجليزي)</label>
                    <input
                      type="text"
                      value={pageForm.title_en}
                      onChange={(e) => setPageForm({...pageForm, title_en: e.target.value})}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>المحتوى (عربي) *</label>
                  <textarea
                    value={pageForm.content_ar}
                    onChange={(e) => setPageForm({...pageForm, content_ar: e.target.value})}
                    required
                    rows="10"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>المحتوى (إنجليزي)</label>
                  <textarea
                    value={pageForm.content_en}
                    onChange={(e) => setPageForm({...pageForm, content_en: e.target.value})}
                    rows="10"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>وصف الصفحة للبحث (عربي)</label>
                  <textarea
                    value={pageForm.meta_description_ar}
                    onChange={(e) => setPageForm({...pageForm, meta_description_ar: e.target.value})}
                    rows="2"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>وصف الصفحة للبحث (إنجليزي)</label>
                  <textarea
                    value={pageForm.meta_description_en}
                    onChange={(e) => setPageForm({...pageForm, meta_description_en: e.target.value})}
                    rows="2"
                  />
                </div>

                <div className={styles.modalActions}>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={() => {
                      setShowPageModal(false);
                      setEditingPage(null);
                      resetPageForm();
                    }}
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit" 
                    className={styles.saveButton}
                    disabled={loading}
                  >
                    {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

/* ===== نهاية الجزء الثالث عشر: النوافذ المنبثقة الجزء الثاني ===== */

/* ===== بداية الجزء الرابع عشر والأخير: إغلاق المكون والتصدير ===== */

      </div>
    </DashboardLayout>
  );

}

export default withRoleProtection(SuperAdminDashboard, ['super_admin']);

/* ===== نهاية الجزء الرابع عشر والأخير: إغلاق المكون والتصدير ===== */