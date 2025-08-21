'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import { api, auth, ApiError } from '@/lib/api';
import { config } from '@/lib/config';
import TotpModal from '@/components/TotpModal';
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  Navigation, 
  Layout, 
  Edit3, 
  Save, 
  Plus, 
  Trash2,
  BarChart3,
  LogOut,
  Menu,
  X,
  Globe,
  ImageIcon,
  Phone,
  Mail,
  Users,
  Database,
  Settings,
  CreditCard,
  FileText,
  Package,
  UserCheck,
  DollarSign,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const SuperAdminPage = () => {
  // حالات التطبيق
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notification, setNotification] = useState('');

  // حالات تسجيل الدخول
  const [loginStep, setLoginStep] = useState(1);
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    totpCode: '',
    sessionToken: ''
  });
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const otpInputs = useRef([]);

  // بيانات النظام
  const [navbarData, setNavbarData] = useState({
    logo_path: '/assets/miras-logo.svg',
    links: []
  });
  
  const [footerData, setFooterData] = useState({
    logo_path: '/assets/miras-logo-footer.svg',
    quickLinks: [],
    legalPages: [],
    contact: { phone: '', email: '', workHours: '' },
    socialMedia: [],
    copyright: '',
    description: ''
  });

  const [stats, setStats] = useState({
    totalUsers: 1250,
    activeSubscriptions: 890,
    monthlyRevenue: 45000,
    systemHealth: 98.5
  });

  // بيانات جديدة للتبويبات
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [pages, setPages] = useState({});
  const [paymentSettings, setPaymentSettings] = useState({
    payment_enabled: true,
    payment_gateway: 'stripe',
    payment_test_mode: true,
    payment_currency: 'SAR'
  });

  // التحقق من الجلسة عند التحميل
  useEffect(() => {
    const token = localStorage.getItem(config.session.tokenKey);
    if (token) {
      verifySession();
    }
  }, []);

  // منع المحاولات المتكررة
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // جلب البيانات حسب التبويب النشط
  useEffect(() => {
    if (isAuthenticated) {
      fetchTabData(activeTab);
    }
  }, [activeTab, isAuthenticated]);

  // التحقق من صحة الجلسة
  const verifySession = async () => {
    try {
      await auth.verify();
      setIsAuthenticated(true);
      await fetchAllData();
    } catch (error) {
      console.error('Session verification failed:', error);
      localStorage.removeItem(config.session.tokenKey);
      setIsAuthenticated(false);
    }
  };

  // جلب جميع البيانات عبر الجلسة
  const fetchAllData = async () => {
    try {
      // جلب بيانات النافبار
      const navData = await api.get(config.endpoints.navbar);
      setNavbarData(navData);

      // جلب بيانات الفوتر
      const footData = await api.get(config.endpoints.footer);
      setFooterData(footData);

      // جلب الإحصائيات
      const statsData = await api.get(config.endpoints.stats);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem(config.session.tokenKey);
      }
    }
  };

  // جلب بيانات التبويب المحدد
  const fetchTabData = async (tab) => {
    try {
      switch (tab) {
        case 'users':
          const usersData = await api.get(config.endpoints.users.base);
          setUsers(usersData.data || usersData);
          break;
        case 'plans':
          const plansData = await api.get(config.endpoints.plans.base);
          setPlans(plansData.plans || plansData);
          break;
        case 'pages':
          // جلب صفحات محددة
          const privacyPage = await api.get(config.endpoints.pages.get('privacy-policy')).catch(() => ({}));
          const termsPage = await api.get(config.endpoints.pages.get('terms-of-service')).catch(() => ({}));
          setPages({ privacy: privacyPage, terms: termsPage });
          break;
        case 'payment':
          const paymentData = await api.get(config.endpoints.payment.settings);
          setPaymentSettings(paymentData);
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error);
    }
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    if (attempts >= 3 && timeLeft > 0) {
      setLoginError(`❌ تم تجاوز الحد المسموح. حاول بعد ${timeLeft} ثانية`);
      setLoading(false);
      return;
    }

    try {
      const data = await auth.verifyCredentials(loginForm.username, loginForm.password);
      setLoginForm(prev => ({ 
        ...prev, 
        sessionToken: data.session_token 
      }));
      setLoginStep(2);
      setAttempts(0);
    } catch (error) {
      setLoginError(error.message || '❌ بيانات الدخول غير صحيحة');
      setAttempts(prev => prev + 1);
      if (attempts >= 2) {
        setTimeLeft(300);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTotpSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const data = await auth.login(
        loginForm.username,
        loginForm.password,
        loginForm.totpCode,
        loginForm.sessionToken
      );
      
      // خزن التوكن للتوافق (الاعتماد فعلياً على الكوكي)
      localStorage.setItem(config.session.tokenKey, data.token);
      
      setIsAuthenticated(true);
      await fetchAllData();
      setNotification('✅ تم تسجيل الدخول بنجاح');
    } catch (error) {
      setLoginError(error.message || '❌ رمز التحقق غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(config.session.tokenKey);
      setIsAuthenticated(false);
      setLoginStep(1);
      setLoginForm({ username: '', password: '', totpCode: '', sessionToken: '' });
      setLoginError('');
      setNotification('تم تسجيل الخروج بنجاح');
    }
  };

  const handleOtpInput = (index, value) => {
    if (!/^\d$/.test(value) && value !== '') return;

    const newCode = loginForm.totpCode.split('');
    newCode[index] = value;
    
    setLoginForm(prev => ({
      ...prev,
      totpCode: newCode.join('')
    }));

    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const cleanPaste = paste.replace(/\D/g, '').slice(0, 6);
    
    if (cleanPaste.length === 6) {
      setLoginForm(prev => ({ ...prev, totpCode: cleanPaste }));
      cleanPaste.split('').forEach((digit, index) => {
        if (otpInputs.current[index]) {
          otpInputs.current[index].value = digit;
        }
      });
      otpInputs.current[5]?.focus();
    }
  };

  const saveChanges = async (dataType, data) => {
    setLoading(true);
    try {
      await api.put(config.endpoints[dataType], data);
      setNotification('✅ تم حفظ التغييرات بنجاح');
      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      setNotification('❌ ' + (error.message || 'حدث خطأ في الحفظ'));
    } finally {
      setLoading(false);
    }
  };

  // دوال إدارة المستخدمين
  const createUser = async (userData) => {
    try {
      await api.post(config.endpoints.users.base, userData);
      setNotification('✅ تم إنشاء المستخدم بنجاح');
      fetchTabData('users');
    } catch (error) {
      setNotification('❌ ' + (error.message || 'خطأ في إنشاء المستخدم'));
    }
  };

  const updateUser = async (id, userData) => {
    try {
      await api.put(`${config.endpoints.users.base}/${id}`, userData);
      setNotification('✅ تم تحديث المستخدم بنجاح');
      fetchTabData('users');
    } catch (error) {
      setNotification('❌ ' + (error.message || 'خطأ في تحديث المستخدم'));
    }
  };

  const deleteUser = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        await api.delete(`${config.endpoints.users.base}/${id}`);
        setNotification('✅ تم حذف المستخدم بنجاح');
        fetchTabData('users');
      } catch (error) {
        setNotification('❌ ' + (error.message || 'خطأ في حذف المستخدم'));
      }
    }
  };

  // دوال إدارة الخطط
  const createPlan = async (planData) => {
    try {
      await api.post(config.endpoints.plans.base, planData);
      setNotification('✅ تم إنشاء الخطة بنجاح');
      fetchTabData('plans');
    } catch (error) {
      setNotification('❌ ' + (error.message || 'خطأ في إنشاء الخطة'));
    }
  };

  const updatePlan = async (id, planData) => {
    try {
      await api.put(`${config.endpoints.plans.base}/${id}`, planData);
      setNotification('✅ تم تحديث الخطة بنجاح');
      fetchTabData('plans');
    } catch (error) {
      setNotification('❌ ' + (error.message || 'خطأ في تحديث الخطة'));
    }
  };

  // دوال إدارة الصفحات
  const updatePage = async (slug, pageData) => {
    try {
      await api.put(config.endpoints.pages.update(slug), pageData);
      setNotification('✅ تم تحديث الصفحة بنجاح');
      fetchTabData('pages');
    } catch (error) {
      setNotification('❌ ' + (error.message || 'خطأ في تحديث الصفحة'));
    }
  };

  // دوال إدارة الدفع
  const updatePaymentSettings = async (settings) => {
    try {
      await api.put(config.endpoints.payment.settings, settings);
      setNotification('✅ تم تحديث إعدادات الدفع بنجاح');
    } catch (error) {
      setNotification('❌ ' + (error.message || 'خطأ في تحديث الإعدادات'));
    }
  };

  const testPaymentConnection = async () => {
    setLoading(true);
    try {
      const result = await api.post(config.endpoints.payment.testConnection);
      setNotification(result.success ? '✅ تم اختبار الاتصال بنجاح' : '❌ فشل اختبار الاتصال');
    } catch (error) {
      setNotification('❌ ' + (error.message || 'خطأ في اختبار الاتصال'));
    } finally {
      setLoading(false);
    }
  };

  const LoginComponent = () => (
    <div className={styles.loginBackground}>
      <div className={styles.particlesContainer}>
        {[...Array(9)].map((_, i) => (
          <div key={i} className={styles.particle}></div>
        ))}
      </div>

      <div className={styles.securityWarning}>
        <AlertTriangle className="w-5 h-5" />
        <span>منطقة محظورة - مخصصة للإدارة العليا فقط</span>
      </div>

      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <div className={`${styles.loginIcon} ${styles.iconGlow}`}>
              <Shield className="w-12 h-12 text-white" />
            </div>
            <h1 className={styles.loginTitle}>لوحة المشرف الأكبر</h1>
            <p className={styles.loginSubtitle}>دخول آمن ومشفر</p>
          </div>

          <div className={styles.progressIndicator}>
            <div className={`${styles.progressStep} ${loginStep >= 1 ? styles.active : styles.inactive}`}>
              1
            </div>
            <div className={`${styles.progressLine} ${loginStep >= 2 ? styles.active : styles.inactive}`}></div>
            <div className={`${styles.progressStep} ${loginStep >= 2 ? styles.active : styles.inactive}`}>
              2
            </div>
          </div>
          <div className={styles.progressLabel}>
            {loginStep === 1 ? 'بيانات الدخول' : 'التحقق بخطوتين'}
          </div>

          {loginStep === 1 ? (
            <form onSubmit={handleCredentialsSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>اسم المستخدم</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  className={styles.formInput}
                  placeholder="أدخل اسم المستخدم"
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>كلمة المرور</label>
                <div className={styles.passwordField}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className={styles.formInput}
                    placeholder="أدخل كلمة المرور"
                    required
                    disabled={loading}
                    style={{ paddingLeft: '3rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className={styles.errorMessage}>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (attempts >= 3 && timeLeft > 0)}
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
              >
                {loading ? (
                  <>
                    <div className={styles.loadingSpinner}></div>
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    متابعة
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTotpSubmit}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <Smartphone className={`w-12 h-12 mx-auto mb-4 ${styles.iconBounce}`} style={{ color: 'var(--primary-color)' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-900)' }}>
                  رمز التحقق بخطوتين
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                  أدخل الرمز المكون من 6 أرقام من تطبيق Google Authenticator
                </p>
              </div>

              <div className={styles.otpContainer}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={loginForm.totpCode[index] || ''}
                    onChange={(e) => handleOtpInput(index, e.target.value)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    className={`${styles.otpInput} ${loginForm.totpCode[index] ? styles.filled : ''}`}
                    disabled={loading}
                  />
                ))}
              </div>

              {loginError && (
                <div className={styles.errorMessage}>
                  {loginError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setLoginStep(1)}
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  رجوع
                </button>
                <button
                  type="submit"
                  disabled={loading || loginForm.totpCode.length !== 6}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  style={{ flex: 1 }}
                >
                  {loading ? (
                    <>
                      <div className={styles.loadingSpinner}></div>
                      جاري الدخول...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      دخول آمن
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          <p>🔒 جميع البيانات مشفرة ومحمية</p>
          <p>📊 جميع عمليات الدخول مراقبة ومسجلة</p>
        </div>
      </div>
    </div>
  );

  const DashboardComponent = () => (
    <div className={styles.dashboard}>
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          {sidebarOpen && (
            <h2 className={styles.sidebarTitle}>المشرف الأكبر</h2>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={styles.sidebarToggle}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className={styles.navMenu}>
          {[
            { id: 'dashboard', icon: BarChart3, label: 'لوحة التحكم' },
            { id: 'users', icon: Users, label: 'إدارة المستخدمين' },
            { id: 'plans', icon: Package, label: 'إدارة الخطط' },
            { id: 'pages', icon: FileText, label: 'إدارة الصفحات' },
            { id: 'payment', icon: CreditCard, label: 'إعدادات الدفع' },
            { id: 'navbar', icon: Navigation, label: 'إدارة النافبار' },
            { id: 'footer', icon: Layout, label: 'إدارة الفوتر' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
            >
              <item.icon className={styles.navIcon} />
              {sidebarOpen && (
                <span className={styles.navLabel}>
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className={styles.logoutSection}>
            <button 
              onClick={handleLogout}
              className={styles.logoutBtn}
            >
              <LogOut className="w-5 h-5" />
              <span className={styles.navLabel}>تسجيل الخروج</span>
            </button>
          </div>
        )}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.pageTitle}>
                {activeTab === 'dashboard' && 'لوحة التحكم الرئيسية'}
                {activeTab === 'users' && 'إدارة المستخدمين'}
                {activeTab === 'plans' && 'إدارة الخطط'}
                {activeTab === 'pages' && 'إدارة الصفحات'}
                {activeTab === 'payment' && 'إعدادات الدفع'}
                {activeTab === 'navbar' && 'إدارة النافبار'}
                {activeTab === 'footer' && 'إدارة الفوتر'}
              </h1>
              <p className={styles.pageSubtitle}>مرحباً بك في لوحة التحكم المحمية</p>
            </div>
            
            <div className={styles.headerActions}>
              <div className={styles.statusBadge}>
                <div className={styles.statusDot}></div>
                نظام آمن
              </div>
            </div>
          </div>
        </div>

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

        <div className={styles.pageContent}>
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'users' && <UsersManager />}
          {activeTab === 'plans' && <PlansManager />}
          {activeTab === 'pages' && <PagesManager />}
          {activeTab === 'payment' && <PaymentManager />}
          {activeTab === 'navbar' && <NavbarManager />}
          {activeTab === 'footer' && <FooterManager />}
        </div>
      </div>
    </div>
  );

  const DashboardOverview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BarChart3 className="w-8 h-8" />
        إحصائيات النظام
      </h3>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <h3>إجمالي المستخدمين</h3>
              <p className={styles.statValue}>{stats.totalUsers?.toLocaleString() || '0'}</p>
            </div>
            <Users className={styles.statIcon} />
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.green}`}>
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <h3>الاشتراكات النشطة</h3>
              <p className={styles.statValue}>{stats.activeSubscriptions?.toLocaleString() || '0'}</p>
            </div>
            <Shield className={styles.statIcon} />
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.purple}`}>
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <h3>الإيرادات الشهرية</h3>
              <p className={styles.statValue}>{stats.monthlyRevenue?.toLocaleString() || '0'} ر.س</p>
            </div>
            <DollarSign className={styles.statIcon} />
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.orange}`}>
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <h3>حالة النظام</h3>
              <p className={styles.statValue}>{stats.systemHealth || '0'}%</p>
            </div>
            <Database className={styles.statIcon} />
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h4 className={styles.cardTitle}>إعدادات سريعة</h4>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.quickActions}>
            <button
              onClick={() => setActiveTab('users')}
              className={styles.quickActionBtn}
            >
              <Users className="w-6 h-6" />
              <span>إدارة المستخدمين</span>
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`${styles.quickActionBtn} ${styles.green}`}
            >
              <Package className="w-6 h-6" />
              <span>إدارة الخطط</span>
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`${styles.quickActionBtn} ${styles.purple}`}
            >
              <CreditCard className="w-6 h-6" />
              <span>إعدادات الدفع</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const UsersManager = () => {
    const [editingUser, setEditingUser] = useState(null);
    const [newUser, setNewUser] = useState({
      name: '',
      email: '',
      role: 'student',
      password: '',
      national_id: '',
      phone: ''
    });

    const handleCreateUser = async (e) => {
      e.preventDefault();
      await createUser(newUser);
      setNewUser({ name: '', email: '', role: 'student', password: '', national_id: '', phone: '' });
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className={styles.managementHeader}>
          <h3 className={styles.sectionTitle}>
            <Users className="w-6 h-6" />
            إدارة المستخدمين
          </h3>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
           <h4 className={styles.cardTitle}>إضافة مستخدم جديد</h4>
         </div>
         <div className={styles.cardContent}>
           <form onSubmit={handleCreateUser}>
             <div className={styles.formGrid}>
               <input
                 type="text"
                 value={newUser.name}
                 onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                 placeholder="الاسم الكامل"
                 className={styles.formInput}
                 required
               />
               <input
                 type="email"
                 value={newUser.email}
                 onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                 placeholder="البريد الإلكتروني"
                 className={styles.formInput}
                 required
               />
               <select
                 value={newUser.role}
                 onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                 className={styles.formInput}
               >
                 <option value="student">طالب</option>
                 <option value="teacher">معلم</option>
                 <option value="manager">مدير مدرسة</option>
                 <option value="supervisor">مشرف</option>
               </select>
               <input
                 type="password"
                 value={newUser.password}
                 onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                 placeholder="كلمة المرور"
                 className={styles.formInput}
                 required
               />
               <input
                 type="text"
                 value={newUser.national_id}
                 onChange={(e) => setNewUser(prev => ({ ...prev, national_id: e.target.value }))}
                 placeholder="رقم الهوية"
                 className={styles.formInput}
               />
               <input
                 type="tel"
                 value={newUser.phone}
                 onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                 placeholder="رقم الهاتف"
                 className={styles.formInput}
               />
             </div>
             <button
               type="submit"
               className={`${styles.btn} ${styles.btnPrimary}`}
               disabled={loading}
             >
               <Plus className="w-4 h-4" />
               إنشاء المستخدم
             </button>
           </form>
         </div>
       </div>

       <div className={styles.card}>
         <div className={styles.cardHeader}>
           <h4 className={styles.cardTitle}>قائمة المستخدمين</h4>
         </div>
         <div className={styles.cardContent}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
             {users.map((user) => (
               <div key={user.id} className={styles.listItem}>
                 <div className={styles.itemContent}>
                   <div className={styles.itemInfo}>
                     <UserCheck className="w-5 h-5 text-blue-500" />
                     <div className={styles.itemDetails}>
                       <h4>{user.name}</h4>
                       <p>{user.email} • {user.role}</p>
                     </div>
                     <span className={user.is_active ? styles.statusBadgeActive : styles.statusBadgeInactive}>
                       {user.is_active ? 'نشط' : 'معطل'}
                     </span>
                   </div>
                   <div className={styles.itemActions}>
                     <button
                       onClick={() => setEditingUser(user)}
                       className={`${styles.actionBtn} ${styles.edit}`}
                     >
                       <Edit3 className="w-4 h-4" />
                     </button>
                     <button
                       onClick={() => deleteUser(user.id)}
                       className={`${styles.actionBtn} ${styles.delete}`}
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>
     </div>
   );
 };

 const PlansManager = () => {
   const [editingPlan, setEditingPlan] = useState(null);
   const [newPlan, setNewPlan] = useState({
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

   const handleCreatePlan = async (e) => {
     e.preventDefault();
     await createPlan(newPlan);
     setNewPlan({
       name_ar: '', name_en: '', description_ar: '', description_en: '',
       price: '', duration_days: 30, features: [], is_active: true, is_featured: false
     });
   };

   const addFeature = (planSetter, plan) => {
     planSetter(prev => ({
       ...prev,
       features: [...prev.features, '']
     }));
   };

   const updateFeature = (planSetter, plan, index, value) => {
     planSetter(prev => ({
       ...prev,
       features: prev.features.map((feature, i) => i === index ? value : feature)
     }));
   };

   const removeFeature = (planSetter, plan, index) => {
     planSetter(prev => ({
       ...prev,
       features: prev.features.filter((_, i) => i !== index)
     }));
   };

   return (
     <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
       <div className={styles.managementHeader}>
         <h3 className={styles.sectionTitle}>
           <Package className="w-6 h-6" />
           إدارة الخطط
         </h3>
       </div>

       <div className={styles.card}>
         <div className={styles.cardHeader}>
           <h4 className={styles.cardTitle}>إضافة خطة جديدة</h4>
         </div>
         <div className={styles.cardContent}>
           <form onSubmit={handleCreatePlan}>
             <div className={styles.formGrid}>
               <input
                 type="text"
                 value={newPlan.name_ar}
                 onChange={(e) => setNewPlan(prev => ({ ...prev, name_ar: e.target.value }))}
                 placeholder="اسم الخطة (عربي)"
                 className={styles.formInput}
                 required
               />
               <input
                 type="text"
                 value={newPlan.name_en}
                 onChange={(e) => setNewPlan(prev => ({ ...prev, name_en: e.target.value }))}
                 placeholder="اسم الخطة (إنجليزي)"
                 className={styles.formInput}
                 required
               />
               <input
                 type="number"
                 value={newPlan.price}
                 onChange={(e) => setNewPlan(prev => ({ ...prev, price: e.target.value }))}
                 placeholder="السعر"
                 className={styles.formInput}
                 required
               />
               <input
                 type="number"
                 value={newPlan.duration_days}
                 onChange={(e) => setNewPlan(prev => ({ ...prev, duration_days: parseInt(e.target.value) }))}
                 placeholder="مدة الخطة (أيام)"
                 className={styles.formInput}
                 required
               />
             </div>
             
             <div style={{ marginTop: '1rem' }}>
               <textarea
                 value={newPlan.description_ar}
                 onChange={(e) => setNewPlan(prev => ({ ...prev, description_ar: e.target.value }))}
                 placeholder="وصف الخطة (عربي)"
                 className={styles.formInput}
                 rows={3}
               />
             </div>

             <div style={{ marginTop: '1rem' }}>
               <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>الميزات</label>
               {newPlan.features.map((feature, index) => (
                 <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                   <input
                     type="text"
                     value={feature}
                     onChange={(e) => updateFeature(setNewPlan, newPlan, index, e.target.value)}
                     placeholder="ميزة..."
                     className={styles.formInput}
                     style={{ flex: 1 }}
                   />
                   <button
                     type="button"
                     onClick={() => removeFeature(setNewPlan, newPlan, index)}
                     className={`${styles.actionBtn} ${styles.delete}`}
                   >
                     <X className="w-4 h-4" />
                   </button>
                 </div>
               ))}
               <button
                 type="button"
                 onClick={() => addFeature(setNewPlan, newPlan)}
                 className={`${styles.btn} ${styles.btnSecondary}`}
               >
                 <Plus className="w-4 h-4" />
                 إضافة ميزة
               </button>
             </div>

             <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
               <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <input
                   type="checkbox"
                   checked={newPlan.is_active}
                   onChange={(e) => setNewPlan(prev => ({ ...prev, is_active: e.target.checked }))}
                 />
                 نشط
               </label>
               <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <input
                   type="checkbox"
                   checked={newPlan.is_featured}
                   onChange={(e) => setNewPlan(prev => ({ ...prev, is_featured: e.target.checked }))}
                 />
                 مميز
               </label>
             </div>

             <button
               type="submit"
               className={`${styles.btn} ${styles.btnPrimary}`}
               disabled={loading}
               style={{ marginTop: '1rem' }}
             >
               <Plus className="w-4 h-4" />
               إنشاء الخطة
             </button>
           </form>
         </div>
       </div>

       <div className={styles.card}>
         <div className={styles.cardHeader}>
           <h4 className={styles.cardTitle}>الخطط الحالية</h4>
         </div>
         <div className={styles.cardContent}>
           <div style={{ display: 'grid', gap: '1rem' }}>
             {plans.map((plan) => (
               <div key={plan.id} className={styles.planCard}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                   <div>
                     <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                       {plan.name_ar}
                     </h4>
                     <p style={{ color: 'var(--gray-600)', marginBottom: '1rem' }}>
                       {plan.description_ar}
                     </p>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                         {plan.price} ر.س
                       </span>
                       <span style={{ color: 'var(--gray-600)' }}>
                         {plan.duration_days} يوم
                       </span>
                       <span className={plan.is_active ? styles.statusBadgeActive : styles.statusBadgeInactive}>
                         {plan.is_active ? 'نشط' : 'معطل'}
                       </span>
                       {plan.is_featured && (
                         <span style={{ 
                           background: 'linear-gradient(45deg, #f59e0b, #d97706)', 
                           color: 'white', 
                           padding: '0.25rem 0.5rem', 
                           borderRadius: '0.25rem', 
                           fontSize: '0.75rem' 
                         }}>
                           مميز
                         </span>
                       )}
                     </div>
                   </div>
                   <div className={styles.itemActions}>
                     <button
                       onClick={() => setEditingPlan(plan)}
                       className={`${styles.actionBtn} ${styles.edit}`}
                     >
                       <Edit3 className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>
     </div>
   );
 };

 const PagesManager = () => {
   const [editingPage, setEditingPage] = useState(null);
   const [pageData, setPageData] = useState({
     title_ar: '',
     title_en: '',
     content_ar: '',
     content_en: '',
     meta_description_ar: '',
     meta_description_en: ''
   });

   const handlePageEdit = (pageKey) => {
     const page = pages[pageKey];
     if (page) {
       setPageData(page);
       setEditingPage(pageKey);
     }
   };

   const handlePageSave = async () => {
     const slug = editingPage === 'privacy' ? 'privacy-policy' : 'terms-of-service';
     await updatePage(slug, pageData);
     setEditingPage(null);
   };

   return (
     <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
       <div className={styles.managementHeader}>
         <h3 className={styles.sectionTitle}>
           <FileText className="w-6 h-6" />
           إدارة الصفحات
         </h3>
       </div>

       <div style={{ display: 'grid', gap: '1rem' }}>
         <div className={styles.card}>
           <div className={styles.cardHeader}>
             <h4 className={styles.cardTitle}>سياسة الخصوصية</h4>
             <button
               onClick={() => handlePageEdit('privacy')}
               className={`${styles.btn} ${styles.btnSecondary}`}
             >
               <Edit3 className="w-4 h-4" />
               تعديل
             </button>
           </div>
           <div className={styles.cardContent}>
             <p style={{ color: 'var(--gray-600)' }}>
               {pages.privacy?.content_ar?.substring(0, 150) || 'لم يتم إضافة محتوى بعد...'}...
             </p>
           </div>
         </div>

         <div className={styles.card}>
           <div className={styles.cardHeader}>
             <h4 className={styles.cardTitle}>شروط الخدمة</h4>
             <button
               onClick={() => handlePageEdit('terms')}
               className={`${styles.btn} ${styles.btnSecondary}`}
             >
               <Edit3 className="w-4 h-4" />
               تعديل
             </button>
           </div>
           <div className={styles.cardContent}>
             <p style={{ color: 'var(--gray-600)' }}>
               {pages.terms?.content_ar?.substring(0, 150) || 'لم يتم إضافة محتوى بعد...'}...
             </p>
           </div>
         </div>
       </div>

       {editingPage && (
         <div className={styles.card}>
           <div className={styles.cardHeader}>
             <h4 className={styles.cardTitle}>
               تعديل {editingPage === 'privacy' ? 'سياسة الخصوصية' : 'شروط الخدمة'}
             </h4>
           </div>
           <div className={styles.cardContent}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <input
                 type="text"
                 value={pageData.title_ar}
                 onChange={(e) => setPageData(prev => ({ ...prev, title_ar: e.target.value }))}
                 placeholder="العنوان (عربي)"
                 className={styles.formInput}
               />
               <input
                 type="text"
                 value={pageData.title_en}
                 onChange={(e) => setPageData(prev => ({ ...prev, title_en: e.target.value }))}
                 placeholder="العنوان (إنجليزي)"
                 className={styles.formInput}
               />
               <textarea
                 value={pageData.content_ar}
                 onChange={(e) => setPageData(prev => ({ ...prev, content_ar: e.target.value }))}
                 placeholder="المحتوى (عربي)"
                 className={styles.formInput}
                 rows={10}
               />
               <textarea
                 value={pageData.meta_description_ar}
                 onChange={(e) => setPageData(prev => ({ ...prev, meta_description_ar: e.target.value }))}
                 placeholder="وصف الصفحة للبحث (عربي)"
                 className={styles.formInput}
                 rows={2}
               />
               <div style={{ display: 'flex', gap: '0.75rem' }}>
                 <button
                   onClick={handlePageSave}
                   className={`${styles.btn} ${styles.btnPrimary}`}
                   disabled={loading}
                 >
                   <Save className="w-4 h-4" />
                   حفظ التغييرات
                 </button>
                 <button
                   onClick={() => setEditingPage(null)}
                   className={`${styles.btn} ${styles.btnSecondary}`}
                 >
                   إلغاء
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

 const PaymentManager = () => {
   const handleSettingsSave = async () => {
     await updatePaymentSettings(paymentSettings);
   };

   return (
     <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
       <div className={styles.managementHeader}>
         <h3 className={styles.sectionTitle}>
           <CreditCard className="w-6 h-6" />
           إعدادات الدفع
         </h3>
       </div>

       <div className={styles.card}>
         <div className={styles.cardHeader}>
           <h4 className={styles.cardTitle}>الإعدادات العامة</h4>
         </div>
         <div className={styles.cardContent}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <input
                 type="checkbox"
                 checked={paymentSettings.payment_enabled}
                 onChange={(e) => setPaymentSettings(prev => ({ ...prev, payment_enabled: e.target.checked }))}
               />
               تفعيل نظام الدفع
             </label>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
               <select
                 value={paymentSettings.payment_gateway}
                 onChange={(e) => setPaymentSettings(prev => ({ ...prev, payment_gateway: e.target.value }))}
                 className={styles.formInput}
               >
                 <option value="stripe">Stripe</option>
                 <option value="paypal">PayPal</option>
                 <option value="tap">Tap Payments</option>
               </select>

               <select
                 value={paymentSettings.payment_currency}
                 onChange={(e) => setPaymentSettings(prev => ({ ...prev, payment_currency: e.target.value }))}
                 className={styles.formInput}
               >
                 <option value="SAR">ريال سعودي (SAR)</option>
                 <option value="USD">دولار أمريكي (USD)</option>
                 <option value="EUR">يورو (EUR)</option>
               </select>
             </div>

             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <input
                 type="checkbox"
                 checked={paymentSettings.payment_test_mode}
                 onChange={(e) => setPaymentSettings(prev => ({ ...prev, payment_test_mode: e.target.checked }))}
               />
               وضع الاختبار
             </label>
           </div>
         </div>
       </div>

       <div className={styles.card}>
         <div className={styles.cardHeader}>
           <h4 className={styles.cardTitle}>اختبار الاتصال</h4>
         </div>
         <div className={styles.cardContent}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <button
               onClick={testPaymentConnection}
               className={`${styles.btn} ${styles.btnSecondary}`}
               disabled={loading}
             >
               {loading ? (
                 <>
                   <div className={styles.loadingSpinner}></div>
                   جاري الاختبار...
                 </>
               ) : (
                 <>
                   <TestTube className="w-4 h-4" />
                   اختبار الاتصال
                 </>
               )}
             </button>
             <span style={{ color: 'var(--gray-600)' }}>
               اختبر الاتصال مع بوابة الدفع المحددة
             </span>
           </div>
         </div>
       </div>

       <button
         onClick={handleSettingsSave}
         className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
         disabled={loading}
       >
         {loading ? (
           <>
             <div className={styles.loadingSpinner}></div>
             جاري الحفظ...
           </>
         ) : (
           <>
             <Save className="w-5 h-5" />
             حفظ إعدادات الدفع
           </>
         )}
       </button>
     </div>
   );
 };

 const NavbarManager = () => {
   const [editingLink, setEditingLink] = useState(null);

   const addNewLink = () => {
     const newLink = {
       id: Date.now(),
       title_ar: '',
       url: '',
       icon: 'home',
       order: navbarData.links.length + 1,
       isActive: true
     };
     setNavbarData(prev => ({
       ...prev,
       links: [...prev.links, newLink]
     }));
     setEditingLink(newLink.id);
   };

   const updateLink = (id, field, value) => {
     setNavbarData(prev => ({
       ...prev,
       links: prev.links.map(link => 
         link.id === id ? { ...link, [field]: value } : link
       )
     }));
   };

   const deleteLink = (id) => {
     setNavbarData(prev => ({
       ...prev,
       links: prev.links.filter(link => link.id !== id)
     }));
   };

   const iconOptions = [
     { value: 'home', label: '🏠 الرئيسية' },
     { value: 'info', label: 'ℹ️ معلومات' },
     { value: 'settings', label: '⚙️ إعدادات' },
     { value: 'book', label: '📚 كتاب' },
     { value: 'phone', label: '📞 هاتف' },
     { value: 'users', label: '👥 مستخدمين' }
   ];

   return (
     <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
       <div className={styles.managementHeader}>
         <h3 className={styles.sectionTitle}>
           <Navigation className="w-6 h-6" />
           إدارة النافبار
         </h3>
         <button
           onClick={addNewLink}
           className={styles.addBtn}
         >
           <Plus className="w-4 h-4" />
           إضافة رابط
         </button>
       </div>

       <div className={styles.card}>
         <div className={styles.cardHeader}>
           <h4 className={styles.cardTitle}>
             <ImageIcon className="w-5 h-5" />
             شعار النافبار
           </h4>
         </div>
         <div className={styles.cardContent}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <img 
               src={navbarData.logo_path} 
               alt="Logo" 
               style={{ width: '3rem', height: '3rem', objectFit: 'contain', background: 'white', borderRadius: '0.5rem' }}
             />
             <input
               type="text"
               value={navbarData.logo_path}
               onChange={(e) => setNavbarData(prev => ({ ...prev, logo_path: e.target.value }))}
               placeholder="مسار الشعار"
               className={styles.formInput}
               style={{ flex: 1 }}
             />
           </div>
         </div>
       </div>

       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
         {navbarData.links.map((link) => (
           <div key={link.id} className={styles.listItem}>
             {editingLink === link.id ? (
               <div className={styles.editForm}>
                 <div className={styles.formGrid}>
                   <input
                     type="text"
                     value={link.title_ar}
                     onChange={(e) => updateLink(link.id, 'title_ar', e.target.value)}
                     placeholder="عنوان الرابط"
                     className={styles.formInput}
                   />
                   <input
                     type="text"
                     value={link.url}
                     onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                     placeholder="المسار (مثل: /about)"
                     className={styles.formInput}
                   />
                   <select
                     value={link.icon}
                     onChange={(e) => updateLink(link.id, 'icon', e.target.value)}
                     className={styles.formInput}
                   >
                     {iconOptions.map(option => (
                       <option key={option.value} value={option.value}>
                         {option.label}
                       </option>
                     ))}
                   </select>
                   <input
                     type="number"
                     value={link.order}
                     onChange={(e) => updateLink(link.id, 'order', parseInt(e.target.value))}
                     placeholder="الترتيب"
                     className={styles.formInput}
                   />
                 </div>
                 <div className={styles.formActions}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-700)' }}>
                     <input
                       type="checkbox"
                       checked={link.isActive}
                       onChange={(e) => updateLink(link.id, 'isActive', e.target.checked)}
                     />
                     نشط
                   </label>
                   <button
                     onClick={() => setEditingLink(null)}
                     className={styles.saveBtn}
                   >
                     <Save className="w-4 h-4" />
                     حفظ
                   </button>
                 </div>
               </div>
             ) : (
               <div className={styles.itemContent}>
                 <div className={styles.itemInfo}>
                   <span style={{ fontSize: '1.5rem' }}>{iconOptions.find(opt => opt.value === link.icon)?.label.split(' ')[0]}</span>
                   <div className={styles.itemDetails}>
                     <h4>{link.title_ar}</h4>
                     <p>{link.url}</p>
                   </div>
                   <span className={link.isActive ? styles.statusBadgeActive : styles.statusBadgeInactive}>
                     {link.isActive ? 'نشط' : 'معطل'}
                   </span>
                 </div>
                 <div className={styles.itemActions}>
                   <button
                     onClick={() => setEditingLink(link.id)}
                     className={`${styles.actionBtn} ${styles.edit}`}
                   >
                     <Edit3 className="w-4 h-4" />
                   </button>
                   <button
                     onClick={() => deleteLink(link.id)}
                     className={`${styles.actionBtn} ${styles.delete}`}
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               </div>
             )}
           </div>
         ))}
       </div>

       <button
         onClick={() => saveChanges('navbar', navbarData)}
         disabled={loading}
         className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
       >
         {loading ? (
           <>
             <div className={styles.loadingSpinner}></div>
             جاري الحفظ...
           </>
         ) : (
           <>
             <Save className="w-5 h-5" />
             حفظ تغييرات النافبار
           </>
         )}
       </button>
     </div>
   );
 };

 const FooterManager = () => {
   const addSocialMedia = () => {
     const newSocial = {
       id: Date.now(),
       platform: 'facebook',
       url: '',
       icon: 'FaFacebook',
       isActive: true
     };
     setFooterData(prev => ({
       ...prev,
       socialMedia: [...prev.socialMedia, newSocial]
     }));
   };

const updateSocialMedia = (id, field, value) => {
     setFooterData(prev => ({
       ...prev,
       socialMedia: prev.socialMedia.map(social => 
         social.id === id ? { ...social, [field]: value } : social
       )
     }));
   };

   const deleteSocialMedia = (id) => {
     setFooterData(prev => ({
       ...prev,
       socialMedia: prev.socialMedia.filter(social => social.id !== id)
     }));
   };

   const socialPlatforms = [
     { value: 'facebook', label: 'Facebook', icon: 'FaFacebook' },
     { value: 'twitter', label: 'Twitter', icon: 'FaTwitter' },
     { value: 'instagram', label: 'Instagram', icon: 'FaInstagram' },
     { value: 'linkedin', label: 'LinkedIn', icon: 'FaLinkedin' },
     { value: 'whatsapp', label: 'WhatsApp', icon: 'FaWhatsapp' },
     { value: 'youtube', label: 'YouTube', icon: 'FaYoutube' }
   ];

   return (
     <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
       <div className={styles.managementHeader}>
         <h3 className={styles.sectionTitle}>
           <Layout className="w-6 h-6" />
           إدارة الفوتر
         </h3>
       </div>

       <div className={styles.card}>
         <div className={styles.cardHeader}>
           <h4 className={styles.cardTitle}>
             <Phone className="w-5 h-5" />
             معلومات الاتصال
           </h4>
         </div>
         <div className={styles.cardContent}>
           <div className={styles.formGrid}>
             <input
               type="text"
               value={footerData.contact?.phone || ''}
               onChange={(e) => setFooterData(prev => ({
                 ...prev,
                 contact: { ...prev.contact, phone: e.target.value }
               }))}
               placeholder="رقم الهاتف"
               className={styles.formInput}
             />
             <input
               type="email"
               value={footerData.contact?.email || ''}
               onChange={(e) => setFooterData(prev => ({
                 ...prev,
                 contact: { ...prev.contact, email: e.target.value }
               }))}
               placeholder="البريد الإلكتروني"
               className={styles.formInput}
             />
             <input
               type="text"
               value={footerData.contact?.workHours || ''}
               onChange={(e) => setFooterData(prev => ({
                 ...prev,
                 contact: { ...prev.contact, workHours: e.target.value }
               }))}
               placeholder="ساعات العمل"
               className={styles.formInput}
             />
           </div>
         </div>
       </div>

       <div className={styles.card}>
         <div className={styles.cardHeader}>
           <h4 className={styles.cardTitle}>
             <Globe className="w-5 h-5" />
             وسائل التواصل الاجتماعي
           </h4>
           <button
             onClick={addSocialMedia}
             className={styles.addBtn}
             style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
           >
             <Plus className="w-4 h-4" />
             إضافة
           </button>
         </div>
         <div className={styles.cardContent}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
             {footerData.socialMedia?.map((social) => (
               <div key={social.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <select
                   value={social.platform}
                   onChange={(e) => {
                     const platform = socialPlatforms.find(p => p.value === e.target.value);
                     updateSocialMedia(social.id, 'platform', e.target.value);
                     updateSocialMedia(social.id, 'icon', platform?.icon);
                   }}
                   className={styles.formInput}
                   style={{ minWidth: '150px' }}
                 >
                   {socialPlatforms.map(platform => (
                     <option key={platform.value} value={platform.value}>
                       {platform.label}
                     </option>
                   ))}
                 </select>
                 <input
                   type="url"
                   value={social.url}
                   onChange={(e) => updateSocialMedia(social.id, 'url', e.target.value)}
                   placeholder="رابط الحساب"
                   className={styles.formInput}
                   style={{ flex: 1 }}
                 />
                 <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-700)', whiteSpace: 'nowrap' }}>
                   <input
                     type="checkbox"
                     checked={social.isActive}
                     onChange={(e) => updateSocialMedia(social.id, 'isActive', e.target.checked)}
                   />
                   نشط
                 </label>
                 <button
                   onClick={() => deleteSocialMedia(social.id)}
                   className={`${styles.actionBtn} ${styles.delete}`}
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             ))}
           </div>
         </div>
       </div>

       <div className={styles.card}>
         <div className={styles.cardHeader}>
           <h4 className={styles.cardTitle}>نص حقوق الطبع والنشر</h4>
         </div>
         <div className={styles.cardContent}>
           <textarea
             value={footerData.copyright || ''}
             onChange={(e) => setFooterData(prev => ({ ...prev, copyright: e.target.value }))}
             placeholder="نص حقوق الطبع والنشر"
             rows={3}
             className={styles.formInput}
             style={{ resize: 'vertical', minHeight: '80px' }}
           />
         </div>
       </div>

       <button
         onClick={() => saveChanges('footer', footerData)}
         disabled={loading}
         className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
       >
         {loading ? (
           <>
             <div className={styles.loadingSpinner}></div>
             جاري الحفظ...
           </>
         ) : (
           <>
             <Save className="w-5 h-5" />
             حفظ تغييرات الفوتر
           </>
         )}
       </button>
     </div>
   );
 };

 return isAuthenticated ? <DashboardComponent /> : <LoginComponent />;
};

export default SuperAdminPage;