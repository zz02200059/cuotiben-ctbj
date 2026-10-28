(() => {
  'use strict';

  /* =========================================================
     常量
     ========================================================= */

  const DB_NAME = 'cuotiben.records';
  const DB_VERSION = 1;
  const DB_STORE = 'records';
  const LEGACY_KEY = 'cuotiben.records.v1';
  const MIGRATION_KEY = 'cuotiben.migrated.v2';
  const LEGACY_TEST_KEY = 'cuotiben.storage.test';
  const MAX_IMAGES = 3;
  const MAX_QUESTION_LENGTH = 5000;
  const SCHEMA_VERSION = 2;

  const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const WEEKDAY_SHORT = ['日', '一', '二', '三', '四', '五', '六'];

  const SUBJECTS = [
    {
      name: '数学一',
      color: '#b95b42',
      soft: '#f6e7e0',
      aliases: ['数学', '数一', '数学一'],
      modules: [
        { name: '高等数学', chapters: ['函数、极限与连续', '一元函数微分学', '一元函数积分学', '多元函数微分学', '二重积分', '曲线曲面积分', '无穷级数', '常微分方程'] },
        { name: '线性代数', chapters: ['行列式', '矩阵', '向量', '线性方程组', '特征值与特征向量', '二次型'] },
        { name: '概率论与数理统计', chapters: ['随机事件与概率', '一维随机变量', '多维随机变量', '数字特征', '大数定律与中心极限定理', '参数估计', '假设检验'] }
      ]
    },
    {
      name: '英语一',
      color: '#4f7395',
      soft: '#e7eef5',
      aliases: ['英语', '英一', '英语一'],
      modules: [
        { name: '阅读', chapters: ['细节题', '推断题', '主旨题', '态度题', '词义句意题'] },
        { name: '完形填空', chapters: ['词义辨析', '逻辑关系', '固定搭配'] },
        { name: '新题型', chapters: ['七选五', '排序题', '小标题匹配'] },
        { name: '翻译', chapters: ['长难句拆分', '词义选择', '语序调整'] },
        { name: '写作', chapters: ['小作文', '大作文'] },
        { name: '语法与长难句', chapters: ['定语从句', '状语从句', '非谓语动词', '倒装与强调', '虚拟语气'] }
      ]
    },
    {
      name: '控制基础',
      color: '#568774',
      soft: '#e5f0eb',
      aliases: ['专业课', '自动控制原理', '控制工程', '控制基础'],
      modules: [
        { name: '自动控制的一般概念', chapters: ['开环与闭环', '控制系统分类', '性能要求'] },
        { name: '数学模型', chapters: ['微分方程', '传递函数', '结构图等效变换', '信号流图'] },
        { name: '时域分析', chapters: ['一阶系统', '二阶系统', '稳定性分析', '稳态误差'] },
        { name: '根轨迹', chapters: ['根轨迹绘制法则', '参数根轨迹', '性能分析'] },
        { name: '频域分析', chapters: ['频率特性', 'Nyquist图', 'Bode图', '稳定裕度'] },
        { name: '系统校正', chapters: ['超前校正', '滞后校正', 'PID控制'] },
        { name: '离散系统', chapters: ['z变换', '脉冲传递函数', '离散系统稳定性'] },
        { name: '非线性系统', chapters: ['描述函数法', '相平面法'] },
        { name: '状态空间', chapters: ['状态方程', '能控性与能观性', '状态反馈'] }
      ]
    },
    {
      name: '政治',
      color: '#84617e',
      soft: '#f0e7ef',
      aliases: ['政治'],
      modules: [
        { name: '马原', chapters: ['唯物论', '辩证法', '认识论', '历史唯物主义', '政治经济学'] },
        { name: '毛中特', chapters: ['新民主主义革命', '社会主义改造', '改革开放', '新时代'] },
        { name: '史纲', chapters: ['近代史', '党史', '新中国史'] },
        { name: '思修法基', chapters: ['人生观', '理想信念', '道德', '法治'] },
        { name: '时政', chapters: ['国内时政', '国际时政'] }
      ]
    },
    {
      name: '其他',
      color: '#7c7468',
      soft: '#efece6',
      aliases: ['其他', '物理', '化学', '生物', '历史', '地理', '语文'],
      modules: [{ name: '其他', chapters: ['其他'] }]
    }
  ];

  const MASTERY_LEVELS = [
    { label: '未复盘', short: '未复盘', interval: 1 },
    { label: '一刷', short: '一刷', interval: 3 },
    { label: '二刷', short: '二刷', interval: 7 },
    { label: '三刷', short: '三刷', interval: 15 },
    { label: '四刷', short: '四刷', interval: 30 },
    { label: '稳了', short: '稳了', interval: null }
  ];

  const STUDY_STAGES = ['基础', '强化', '真题', '冲刺'];
  const SOURCE_TYPES = ['课程例题', '课后题', '习题册', '真题', '模拟题', '其他'];

  const CAUSE_PRESETS = {
    数学一: ['概念不清', '计算失误', '方法不会', '步骤跳步', '审题不清', '时间不够', '其他'],
    英语一: ['生词障碍', '长难句', '定位错误', '同义替换没识别', '主观臆断', '时间不够', '其他'],
    控制基础: ['概念不清', '公式记错', '计算失误', '方法不会', '判据条件用错', '画图错误', '审题不清', '其他'],
    政治: ['概念不清', '记忆模糊', '审题不清', '时政盲区', '时间不够', '其他'],
    其他: ['概念不清', '计算失误', '审题不清', '方法不会', '记忆模糊', '粗心大意', '时间不够', '其他']
  };

  const VIEW_LABELS = { all: '全部错题', due: '今日复习', mastered: '已掌握' };
  const RESULT_LABELS = { correct: '做对了', stuck: '卡住了', blank: '完全不会' };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const els = {
    sidebar: $('#sidebar'),
    sidebarBackdrop: $('#sidebarBackdrop'),
    menuBtn: $('#menuBtn'),
    todayWeekday: $('#todayWeekday'),
    todayYear: $('#todayYear'),
    todayMonth: $('#todayMonth'),
    todayDay: $('#todayDay'),
    todayCount: $('#todayCount'),
    weekStrip: $('#weekStrip'),
    resetSubject: $('#resetSubject'),
    subjectList: $('#subjectList'),
    exportBtn: $('#exportBtn'),
    importBtn: $('#importBtn'),
    importFile: $('#importFile'),
    crumbCurrent: $('#crumbCurrent'),
    dashboardBtn: $('#dashboardBtn'),
    reviewBtn: $('#reviewBtn'),
    reviewCount: $('#reviewCount'),
    addBtn: $('#addBtn'),
    heroTitle: $('#heroTitle'),
    statTotal: $('#statTotal'),
    statTotalFoot: $('#statTotalFoot'),
    statDue: $('#statDue'),
    statDueFoot: $('#statDueFoot'),
    statRate: $('#statRate'),
    statMeter: $('#statMeter'),
    statStreak: $('#statStreak'),
    statStreakFoot: $('#statStreakFoot'),
    searchInput: $('#searchInput'),
    subjectFilter: $('#subjectFilter'),
    moduleFilter: $('#moduleFilter'),
    stageFilter: $('#stageFilter'),
    sortOrder: $('#sortOrder'),
    clearFilters: $('#clearFilters'),
    resultSummary: $('#resultSummary'),
    recordList: $('#recordList'),
    emptyState: $('#emptyState'),
    emptyTitle: $('#emptyTitle'),
    emptyDesc: $('#emptyDesc'),
    emptyActions: $('#emptyActions'),
    emptyTip: $('.empty-tip'),
    recordDialog: $('#recordDialog'),
    recordForm: $('#recordForm'),
    recordDialogTitle: $('#recordDialogTitle'),
    sheetKicker: $('#sheetKicker'),
    sheetSub: $('#sheetSub'),
    closeRecordBtn: $('#closeRecordBtn'),
    cancelRecordBtn: $('#cancelRecordBtn'),
    saveRecordBtn: $('#saveRecordBtn'),
    fDate: $('#fDate'),
    subjectChoices: $('#subjectChoices'),
    fModule: $('#fModule'),
    fChapter: $('#fChapter'),
    fTopic: $('#fTopic'),
    moduleOptions: $('#moduleOptions'),
    chapterOptions: $('#chapterOptions'),
    fSourceType: $('#fSourceType'),
    fSourceDetail: $('#fSourceDetail'),
    stageChoices: $('#stageChoices'),
    fQuestion: $('#fQuestion'),
    dropzone: $('#dropzone'),
    imageInput: $('#imageInput'),
    imagePreview: $('#imagePreview'),
    fMyAnswer: $('#fMyAnswer'),
    fCorrect: $('#fCorrect'),
    fReason: $('#fReason'),
    fKnowledgeAnalysis: $('#fKnowledgeAnalysis'),
    causeChips: $('#causeChips'),
    fTags: $('#fTags'),
    fMastered: $('#fMastered'),
    stageNote: $('#stageNote'),
    reviewDialog: $('#reviewDialog'),
    closeReviewBtn: $('#closeReviewBtn'),
    reviewTimer: $('#reviewTimer'),
    reviewCounter: $('#reviewCounter'),
    reviewProgressBar: $('#reviewProgressBar'),
    reviewContent: $('#reviewContent'),
    dashboardDialog: $('#dashboardDialog'),
    closeDashboardBtn: $('#closeDashboardBtn'),
    dashboardContent: $('#dashboardContent'),
    confirmDialog: $('#confirmDialog'),
    confirmTitle: $('#confirmTitle'),
    confirmMessage: $('#confirmMessage'),
    confirmCancel: $('#confirmCancel'),
    confirmOk: $('#confirmOk'),
    imageDialog: $('#imageDialog'),
    closeImageBtn: $('#closeImageBtn'),
    lightboxImage: $('#lightboxImage'),
    iosInstallHint: $('#iosInstallHint'),
    dismissIosInstall: $('#dismissIosInstall'),
    toast: $('#toast')
  };

  const state = {
    view: 'all',
    subject: 'all',
    module: 'all',
    stage: 'all',
    search: '',
    sort: 'desc',
    expanded: new Set()
  };

  let records = [];
  let db = null;
  let storageMode = 'memory';
  let loadWarning = '';
  let loadWarningType = 'info';
  let editingId = null;
  let selectedSubject = '数学一';
  let selectedStage = '基础';
  let draftCauses = new Set();
  let draftImages = [];
  let imagesProcessing = 0;
  let savingRecord = false;
  let toastTimer = null;
  let toastHideTimer = null;
  let toastToken = 0;
  let confirmResolver = null;
  let searchTimer = null;
  let currentDay = todayKey();

  const review = {
    queue: [],
    index: 0,
    revealed: false,
    busy: false,
    single: false,
    startedAt: 0,
    elapsed: 0,
    timerId: null,
    correct: 0,
    stuck: 0,
    blank: 0
  };

  /* =========================================================
     基础工具
     ========================================================= */

  function pad(number) {
    return String(number).padStart(2, '0');
  }

  function uid(prefix = 'note') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/\n/g, ' ');
  }

  function toDateKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function parseDateKey(key) {
    const parts = String(key).split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function isValidDateKey(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(key))) return false;
    const date = parseDateKey(key);
    return (
      date.getFullYear() === Number(String(key).slice(0, 4)) &&
      date.getMonth() + 1 === Number(String(key).slice(5, 7)) &&
      date.getDate() === Number(String(key).slice(8, 10))
    );
  }

  function todayKey() {
    return toDateKey(new Date());
  }

  function offsetDateKey(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return toDateKey(date);
  }

  function addDaysKey(key, days) {
    const date = parseDateKey(key);
    date.setDate(date.getDate() + days);
    return toDateKey(date);
  }

  function dayDifference(dateKey, compareKey = todayKey()) {
    const a = parseDateKey(dateKey);
    const b = parseDateKey(compareKey);
    const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((utcB - utcA) / 86400000);
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function formatShortDate(key) {
    if (!isValidDateKey(key)) return '';
    const date = parseDateKey(key);
    const now = new Date();
    if (date.getFullYear() === now.getFullYear()) {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function formatDuration(seconds) {
    const safe = Math.max(0, Math.floor(seconds || 0));
    return `${pad(Math.floor(safe / 60))}:${pad(safe % 60)}`;
  }

  function getDateHeading(key) {
    const date = parseDateKey(key);
    const diff = dayDifference(key);
    const monthDay = `${date.getMonth() + 1}月${date.getDate()}日`;
    const weekday = WEEKDAYS[date.getDay()];
    let label = monthDay;
    if (diff === 0) label = '今天';
    if (diff === 1) label = '昨天';
    let sub = weekday;
    if (diff === 0 || diff === 1) sub = `${monthDay} · ${weekday}`;
    if (date.getFullYear() !== new Date().getFullYear()) {
      sub = `${date.getFullYear()}年 · ${sub}`;
    }
    return { label, sub };
  }

  function getDueHeading(key) {
    const diff = dayDifference(key);
    if (diff === 0) return { label: '今天到期', sub: formatShortDate(key) };
    if (diff === 1) return { label: '昨天到期', sub: formatShortDate(key) };
    return { label: `${formatShortDate(key)}到期`, sub: `已逾期 ${Math.max(1, Math.abs(diff))} 天` };
  }

  function getSubjectConfig(name) {
    return SUBJECTS.find((subject) => subject.name === normalizeSubjectName(name)) || SUBJECTS[SUBJECTS.length - 1];
  }

  function getSubjectMeta(name) {
    const config = getSubjectConfig(name);
    return { ...config, name: config.name };
  }

  function normalizeSubjectName(name) {
    const value = String(name || '').trim();
    const exact = SUBJECTS.find((subject) => subject.name === value);
    if (exact) return exact.name;
    const alias = SUBJECTS.find((subject) => subject.aliases.includes(value));
    return alias ? alias.name : '其他';
  }

  function getModuleNames(subjectName) {
    return getSubjectConfig(subjectName).modules.map((module) => module.name);
  }

  function getChapterNames(subjectName, moduleName) {
    const config = getSubjectConfig(subjectName);
    const module = config.modules.find((item) => item.name === moduleName);
    return module ? module.chapters : [];
  }

  function getMasteryMeta(level) {
    const value = Math.max(0, Math.min(5, Number(level) || 0));
    return MASTERY_LEVELS[value];
  }

  function getMasteryClass(level) {
    return `level-${Math.max(0, Math.min(5, Number(level) || 0))}`;
  }

  function isMastered(record) {
    return Number(record.masteryLevel) >= 5;
  }

  function isDue(record) {
    return !isMastered(record) && Boolean(record.dueDate) && record.dueDate <= todayKey();
  }

  function matchesStageFilter(record) {
    if (state.stage === 'all') return true;
    if (state.stage.startsWith('study:')) {
      return record.stage === state.stage.slice(6);
    }
    if (state.stage.startsWith('mastery:')) {
      return String(record.masteryLevel) === state.stage.slice(8);
    }
    return true;
  }

  function getStageFilterLabel(value) {
    if (value.startsWith('study:')) return value.slice(6);
    if (value.startsWith('mastery:')) return getMasteryMeta(Number(value.slice(8))).label;
    return '全部阶段';
  }

  function getDueRecords() {
    return records
      .filter(isDue)
      .slice()
      .sort((left, right) => {
        const dueCompare = String(left.dueDate).localeCompare(String(right.dueDate));
        if (dueCompare !== 0) return dueCompare;
        return left.date.localeCompare(right.date) || left.createdAt - right.createdAt;
      });
  }

  function getDueText(record) {
    if (isMastered(record)) return { text: '已稳了', tone: 'is-mastered' };
    if (!record.dueDate) return { text: '待安排', tone: 'is-future' };
    const diff = dayDifference(record.dueDate);
    if (diff === 0) return { text: '今天到期', tone: 'is-today' };
    if (diff > 0) return { text: `逾期 ${diff} 天`, tone: 'is-overdue' };
    if (diff === -1) return { text: '明天复习', tone: 'is-future' };
    return { text: `下次 ${formatShortDate(record.dueDate)}`, tone: 'is-future' };
  }

  function clipText(value, max) {
    return String(value ?? '').slice(0, max);
  }

  function parseTags(value) {
    const pieces = Array.isArray(value)
      ? value
      : String(value ?? '').split(/[,，、;；#]+/);
    const tags = [];
    pieces.forEach((piece) => {
      const tag = String(piece).replace(/\s+/g, ' ').trim().slice(0, 24);
      if (tag && !tags.includes(tag) && tags.length < 8) tags.push(tag);
    });
    return tags;
  }

  function parseCauses(value) {
    const pieces = Array.isArray(value) ? value : [];
    const causes = [];
    pieces.forEach((piece) => {
      const cause = String(piece).replace(/\s+/g, ' ').trim().slice(0, 20);
      if (cause && !causes.includes(cause) && causes.length < 5) causes.push(cause);
    });
    return causes;
  }

  function parseAttempts(value) {
    if (!Array.isArray(value)) return [];
    return value
      .slice(-40)
      .map((attempt) => {
        if (!attempt || typeof attempt !== 'object') return null;
        const result = ['correct', 'stuck', 'blank'].includes(attempt.result) ? attempt.result : null;
        if (!result) return null;
        const at = Number(attempt.at);
        return {
          at: Number.isFinite(at) && at > 0 ? at : Date.now(),
          result,
          duration: Math.max(0, Math.min(36000, Number(attempt.duration) || 0)),
          previousLevel: Math.max(0, Math.min(5, Number(attempt.previousLevel) || 0)),
          nextLevel: Math.max(0, Math.min(5, Number(attempt.nextLevel) || 0))
        };
      })
      .filter(Boolean);
  }

  function countByDate() {
    const counts = new Map();
    records.forEach((record) => {
      counts.set(record.date, (counts.get(record.date) || 0) + 1);
    });
    return counts;
  }

  function currentStreak() {
    const activeDates = new Set(records.map((record) => record.date));
    records.forEach((record) => {
      record.attempts.forEach((attempt) => {
        if (attempt.at) activeDates.add(toDateKey(new Date(attempt.at)));
      });
    });
    let cursor = new Date();
    if (!activeDates.has(todayKey())) {
      cursor.setDate(cursor.getDate() - 1);
    }
    let streak = 0;
    while (activeDates.has(toDateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  /* =========================================================
     数据清洗
     ========================================================= */

  function sanitizeRecord(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const question = clipText(raw.question, MAX_QUESTION_LENGTH).trim();
    if (!question) return null;

    const rawSubject = clipText(raw.subject, 30).trim();
    const subject = normalizeSubjectName(rawSubject);
    let subjectConfigName = subject;
    if (subject === '其他' && rawSubject && rawSubject !== '其他') {
      subjectConfigName = '其他';
    }

    let date = String(raw.date || '').trim();
    if (!isValidDateKey(date)) date = todayKey();

    let module = clipText(raw.module, 40).trim();
    if (!module && subject === '其他' && rawSubject && rawSubject !== '其他') {
      module = rawSubject;
    }
    if (!module) module = subject === '其他' ? '其他' : '未分类';
    const chapter = clipText(raw.chapter, 40).trim();
    const topic = clipText(raw.topic, 80).trim();
    const stage = STUDY_STAGES.includes(raw.stage) ? raw.stage : '基础';
    const sourceType = SOURCE_TYPES.includes(raw.sourceType) ? raw.sourceType : '其他';
    const sourceDetail = clipText(raw.sourceDetail, 80).trim();

    let createdAt = Number(raw.createdAt);
    if (!Number.isFinite(createdAt) || createdAt <= 0) createdAt = Date.now();
    if (createdAt < 100000000000) createdAt *= 1000;

    let updatedAt = Number(raw.updatedAt);
    if (!Number.isFinite(updatedAt) || updatedAt <= 0) updatedAt = createdAt;

    let masteryLevel = Number(raw.masteryLevel);
    if (!Number.isFinite(masteryLevel)) masteryLevel = raw.mastered === true ? 5 : 0;
    masteryLevel = Math.max(0, Math.min(5, Math.round(masteryLevel)));

    let dueDate = null;
    if (masteryLevel < 5) {
      dueDate = isValidDateKey(raw.dueDate) ? raw.dueDate : todayKey();
    }

    const attempts = parseAttempts(raw.attempts);
    let reviewCount = Number(raw.reviewCount);
    if (!Number.isFinite(reviewCount) || reviewCount < 0) reviewCount = attempts.length;
    reviewCount = Math.max(reviewCount, attempts.length);

    let correctCount = Number(raw.correctCount);
    if (!Number.isFinite(correctCount) || correctCount < 0) {
      correctCount = attempts.filter((attempt) => attempt.result === 'correct').length;
    }

    let wrongCount = Number(raw.wrongCount);
    if (!Number.isFinite(wrongCount) || wrongCount < 0) {
      wrongCount = attempts.filter((attempt) => attempt.result !== 'correct').length;
    }

    let lastReviewedAt = Number(raw.lastReviewedAt);
    if (!Number.isFinite(lastReviewedAt) || lastReviewedAt <= 0) {
      lastReviewedAt = attempts.length ? attempts[attempts.length - 1].at : null;
    }

    const images = Array.isArray(raw.images)
      ? raw.images
          .filter((image) => typeof image === 'string' && image.startsWith('data:image/') && image.length < 3000000)
          .slice(0, MAX_IMAGES)
      : [];

    const id = typeof raw.id === 'string' && /^[A-Za-z0-9_-]{1,90}$/.test(raw.id) ? raw.id : uid();

    return {
      id,
      date,
      subject: subjectConfigName,
      module,
      chapter,
      topic,
      stage,
      sourceType,
      sourceDetail,
      question,
      myAnswer: clipText(raw.myAnswer, 3000).trim(),
      correctAnswer: clipText(raw.correctAnswer, 3000).trim(),
      reason: clipText(raw.reason, 3000).trim(),
      knowledgeAnalysis: clipText(raw.knowledgeAnalysis, 3000).trim(),
      causes: parseCauses(raw.causes),
      tags: parseTags(raw.tags),
      images,
      masteryLevel,
      dueDate,
      reviewCount,
      correctCount,
      wrongCount,
      lastReviewedAt,
      attempts,
      createdAt,
      updatedAt
    };
  }

  function sanitizeMany(list) {
    if (!Array.isArray(list)) return [];
    const result = list.map(sanitizeRecord).filter(Boolean);
    const seen = new Set();
    result.forEach((record) => {
      if (seen.has(record.id)) record.id = uid();
      seen.add(record.id);
    });
    return result;
  }

  /* =========================================================
     存储：IndexedDB + 旧 localStorage 迁移
     ========================================================= */

  function testLocalStorage() {
    try {
      localStorage.setItem(LEGACY_TEST_KEY, 'ok');
      localStorage.removeItem(LEGACY_TEST_KEY);
      return true;
    } catch (error) {
      try {
        localStorage.getItem(LEGACY_KEY);
        return true;
      } catch (readError) {
        return false;
      }
    }
  }

  function migrationAlreadyDone() {
    try {
      return localStorage.getItem(MIGRATION_KEY) === '1';
    } catch (error) {
      return false;
    }
  }

  function markMigrationDone() {
    try {
      localStorage.setItem(MIGRATION_KEY, '1');
    } catch (error) {
      /* 标记失败不影响主流程 */
    }
  }

  function readLegacyStorage() {
    try {
      const raw = localStorage.getItem(LEGACY_KEY) || '';
      if (!raw) return { records: [], warning: '' };
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : parsed && parsed.records;
      if (!Array.isArray(list)) throw new Error('Invalid legacy data');
      return { records: sanitizeMany(list), warning: '' };
    } catch (error) {
      console.error(error);
      return {
        records: [],
        warning: '旧版错题数据读取失败。如果之前有记录，请先检查浏览器本地数据。'
      };
    }
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB unavailable'));
        return;
      }
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(DB_STORE)) {
          database.createObjectStore(DB_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('IndexedDB open failed'));
      request.onblocked = () => reject(new Error('IndexedDB blocked'));
    });
  }

  function idbGetAll() {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(DB_STORE, 'readonly');
      const request = transaction.objectStore(DB_STORE).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error || new Error('IndexedDB read failed'));
    });
  }

  function idbReplaceAll(list) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(DB_STORE, 'readwrite');
      const store = transaction.objectStore(DB_STORE);
      store.clear();
      list.forEach((record) => store.put(record));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('IndexedDB write failed'));
      transaction.onabort = () => reject(transaction.error || new Error('IndexedDB write aborted'));
    });
  }

  function idbWriteChanges(changed, removed) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(DB_STORE, 'readwrite');
      const store = transaction.objectStore(DB_STORE);
      changed.forEach((record) => store.put(record));
      removed.forEach((id) => store.delete(id));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('IndexedDB write failed'));
      transaction.onabort = () => reject(transaction.error || new Error('IndexedDB write aborted'));
    });
  }

  async function initStorage() {
    const legacy = readLegacyStorage();
    const alreadyMigrated = migrationAlreadyDone();

    try {
      db = await openDatabase();
      storageMode = 'idb';
      const stored = sanitizeMany(await idbGetAll());

      if (!stored.length && legacy.records.length && !alreadyMigrated) {
        await idbReplaceAll(legacy.records);
        markMigrationDone();
        return {
          records: legacy.records,
          warning: `已把旧版里的 ${legacy.records.length} 道错题迁移到新的本地图片库。`,
          warningType: 'info'
        };
      }

      if (stored.length && !alreadyMigrated) markMigrationDone();

      return {
        records: stored,
        warning: legacy.warning || '',
        warningType: legacy.warning ? 'error' : 'info'
      };
    } catch (error) {
      console.warn('IndexedDB unavailable, falling back to localStorage.', error);
      db = null;
      if (testLocalStorage()) {
        storageMode = 'local';
        return {
          records: legacy.records,
          warning: legacy.warning || 'IndexedDB 未启用，已回退到旧存储；图片较多时可能空间不足。',
          warningType: legacy.warning ? 'error' : 'info'
        };
      }
      storageMode = 'memory';
      return {
        records: [],
        warning: '浏览器禁用了本地存储，关闭页面后本次记录会丢失。',
        warningType: 'error'
      };
    }
  }

  function storageErrorMessage(error) {
    const name = error && error.name ? error.name : '';
    if (name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED' || error.code === 22) {
      return '本地空间不足。请删除一些带图片的旧错题，或减少图片后再保存。';
    }
    return '保存失败，请检查浏览器是否允许本地存储。';
  }

  async function commit(nextRecords) {
    if (storageMode === 'idb' && db) {
      const oldMap = new Map(records.map((record) => [record.id, record]));
      const nextMap = new Map(nextRecords.map((record) => [record.id, record]));
      const changed = nextRecords.filter((record) => oldMap.get(record.id) !== record);
      const removed = Array.from(oldMap.keys()).filter((id) => !nextMap.has(id));
      try {
        if (changed.length || removed.length) await idbWriteChanges(changed, removed);
        records = nextRecords;
        render();
        return { ok: true, persisted: true };
      } catch (error) {
        console.error(error);
        showToast(storageErrorMessage(error), { type: 'error', duration: 6000 });
        return { ok: false, persisted: false };
      }
    }

    if (storageMode === 'local') {
      try {
        localStorage.setItem(
          LEGACY_KEY,
          JSON.stringify({ version: SCHEMA_VERSION, savedAt: Date.now(), records: nextRecords })
        );
        records = nextRecords;
        render();
        return { ok: true, persisted: true };
      } catch (error) {
        console.error(error);
        showToast(storageErrorMessage(error), { type: 'error', duration: 6000 });
        return { ok: false, persisted: false };
      }
    }

    records = nextRecords;
    render();
    return { ok: true, persisted: false };
  }

  /* =========================================================
     初始化
     ========================================================= */

  function isIosSafari() {
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|MicroMessenger|DingTalk|QQ\//i.test(ua);
    return ios && !otherBrowser;
  }

  function isStandaloneMode() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  function setupPwa() {
    const canRegisterServiceWorker =
      'serviceWorker' in navigator &&
      (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');
    if (canRegisterServiceWorker) {
      const register = () => {
        navigator.serviceWorker.register('./sw.js').catch((error) => {
          console.warn('Service worker registration failed.', error);
        });
      };
      if (document.readyState === 'complete') register();
      else window.addEventListener('load', register, { once: true });
    }

    if (navigator.storage && typeof navigator.storage.persist === 'function') {
      navigator.storage.persist().catch(() => {});
    }

    let hintDismissed = false;
    try {
      hintDismissed = localStorage.getItem('cuotiben.iosInstallDismissed') === '1';
    } catch (error) {
      hintDismissed = false;
    }

    if (
      isIosSafari() &&
      !isStandaloneMode() &&
      !hintDismissed &&
      location.protocol !== 'file:' &&
      els.iosInstallHint
    ) {
      window.setTimeout(() => {
        els.iosInstallHint.hidden = false;
      }, 2200);
    }
  }

  async function init() {
    initFormOptions();
    bindEvents();

    const loaded = await initStorage();
    loadWarning = loaded.warning;
    loadWarningType = loaded.warningType || 'info';
    records = loaded.records;

    const demoRequested = new URLSearchParams(window.location.search).get('demo') === '1';
    if (demoRequested && records.length === 0) {
      records = buildSampleRecords();
    }

    render();
    document.body.dataset.appReady = 'true';
    setupPwa();

    if (loadWarning) {
      window.setTimeout(() => {
        showToast(loadWarning, {
          duration: 6500,
          ...(loadWarningType === 'error' ? { type: 'error' } : {})
        });
      }, 500);
    } else if (storageMode === 'memory') {
      window.setTimeout(() => {
        showToast('浏览器禁用了本地存储，本次记录可能无法在关闭页面后保留。', { type: 'error', duration: 6500 });
      }, 500);
    }

    window.setInterval(() => {
      const today = todayKey();
      if (today !== currentDay) {
        currentDay = today;
        if (!document.querySelector('dialog[open]')) render();
      }
    }, 60000);
  }

  /* =========================================================
     渲染
     ========================================================= */

  function render() {
    ensureFilters();
    renderTodayAndWeek();
    renderNavigation();
    renderSubjectViews();
    renderModuleView();
    syncFilterControls();
    renderStats();
    renderHero();
    renderRecords();
  }

  function ensureFilters() {
    if (state.subject !== 'all' && !records.some((record) => record.subject === state.subject)) {
      state.subject = 'all';
      state.module = 'all';
    }
    if (
      state.module !== 'all' &&
      !records.some((record) => record.module === state.module && (state.subject === 'all' || record.subject === state.subject))
    ) {
      state.module = 'all';
    }
    for (const id of state.expanded) {
      if (!records.some((record) => record.id === id)) state.expanded.delete(id);
    }
  }

  function renderTodayAndWeek() {
    const now = new Date();
    const today = toDateKey(now);
    els.todayWeekday.textContent = WEEKDAYS[now.getDay()];
    els.todayYear.textContent = String(now.getFullYear());
    els.todayMonth.textContent = String(now.getMonth() + 1);
    els.todayDay.textContent = String(now.getDate());
    els.todayCount.textContent = String(records.filter((record) => record.date === today).length);

    const counts = countByDate();
    const pieces = [];
    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - index);
      const key = toDateKey(date);
      const count = counts.get(key) || 0;
      const classes = ['week-day'];
      if (count) classes.push('has-record');
      if (index === 0) classes.push('is-today');
      const title = `${formatShortDate(key)} · ${count ? `${count} 道错题` : '还没有记录'}`;
      pieces.push(`
        <div class="${classes.join(' ')}" title="${escapeAttribute(title)}">
          <span class="weekday">${WEEKDAY_SHORT[date.getDay()]}</span>
          <span class="num">${date.getDate()}</span>
          ${count ? '<span class="week-dot"></span>' : ''}
        </div>
      `);
    }
    els.weekStrip.innerHTML = pieces.join('');
  }

  function renderNavigation() {
    const total = records.length;
    const due = getDueRecords().length;
    const mastered = records.filter(isMastered).length;

    const counts = { all: total, due, mastered };
    $$('.nav-item[data-view]').forEach((button) => {
      const view = button.dataset.view;
      const active = state.view === view;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
      const counter = button.querySelector('.nav-count');
      if (counter) counter.textContent = String(counts[view] ?? 0);
    });

    els.reviewCount.textContent = String(due);
    els.reviewBtn.title = due ? `重做 ${due} 道今日到期错题` : '今天没有到期错题';

    let crumb = VIEW_LABELS[state.view] || VIEW_LABELS.all;
    if (state.subject !== 'all') {
      crumb = state.view === 'all' ? `${state.subject}错题` : `${state.subject} · ${VIEW_LABELS[state.view]}`;
    }
    if (state.module !== 'all') {
      crumb = `${state.subject === 'all' ? '' : `${state.subject} · `}${state.module}`;
    }
    els.crumbCurrent.textContent = crumb;
  }

  function renderSubjectViews() {
    const counts = new Map();
    records.forEach((record) => {
      counts.set(record.subject, (counts.get(record.subject) || 0) + 1);
    });

    const activeSubjects = SUBJECTS.filter((subject) => (counts.get(subject.name) || 0) > 0);
    if (!activeSubjects.length) {
      els.subjectList.innerHTML = '<p class="sidebar-empty">还没有学科记录</p>';
    } else {
      els.subjectList.innerHTML = activeSubjects
        .map((subject) => {
          const active = state.subject === subject.name;
          return `
            <button class="subject-item ${active ? 'is-active' : ''}" type="button" data-subject="${escapeAttribute(subject.name)}" aria-pressed="${active}" style="--dot:${subject.color}">
              <span class="subject-dot"></span>
              <span class="subject-name">${escapeHtml(subject.name)}</span>
              <span class="subject-count">${counts.get(subject.name)}</span>
            </button>
          `;
        })
        .join('');
    }

    els.resetSubject.hidden = state.subject === 'all';

    const options = ['<option value="all">全部学科</option>']
      .concat(
        activeSubjects.map(
          (subject) => `<option value="${escapeAttribute(subject.name)}">${escapeHtml(subject.name)}</option>`
        )
      )
      .join('');
    if (els.subjectFilter.innerHTML !== options) {
      els.subjectFilter.innerHTML = options;
    }
    els.subjectFilter.value = state.subject;
  }

  function renderModuleView() {
    const values = Array.from(
      new Set(
        records
          .filter((record) => state.subject === 'all' || record.subject === state.subject)
          .map((record) => record.module)
          .filter(Boolean)
      )
    ).sort((left, right) => left.localeCompare(right, 'zh-CN'));

    const options = ['<option value="all">全部模块</option>']
      .concat(values.map((name) => `<option value="${escapeAttribute(name)}">${escapeHtml(name)}</option>`))
      .join('');
    if (els.moduleFilter.innerHTML !== options) {
      els.moduleFilter.innerHTML = options;
    }
    els.moduleFilter.value = state.module;
  }

  function syncFilterControls() {
    if (els.searchInput.value !== state.search) els.searchInput.value = state.search;
    if (els.subjectFilter.value !== state.subject) els.subjectFilter.value = state.subject;
    if (els.moduleFilter.value !== state.module) els.moduleFilter.value = state.module;
    if (els.stageFilter.value !== state.stage) els.stageFilter.value = state.stage;
    if (els.sortOrder.value !== state.sort) els.sortOrder.value = state.sort;
    els.clearFilters.hidden = !(
      state.search.trim() ||
      state.subject !== 'all' ||
      state.module !== 'all' ||
      state.stage !== 'all'
    );
  }

  function renderStats() {
    const total = records.length;
    const due = getDueRecords().length;
    const mastered = records.filter(isMastered).length;
    const rate = total ? Math.round((mastered / total) * 100) : 0;
    const subjectCount = new Set(records.map((record) => record.subject)).size;
    const moduleCount = new Set(records.map((record) => `${record.subject}/${record.module}`)).size;
    const streak = currentStreak();

    els.statTotal.textContent = String(total);
    els.statTotalFoot.textContent = total ? `来自 ${subjectCount} 个学科 · ${moduleCount} 个模块` : '从第一道开始';
    els.statDue.textContent = String(due);
    els.statDueFoot.textContent = due
      ? `还有 ${due} 道等你重做`
      : total
        ? '今天清空了，漂亮'
        : '今天的你，准备好了吗';
    els.statRate.textContent = String(rate);
    els.statMeter.style.width = `${rate}%`;
    els.statStreak.textContent = String(streak);
    els.statStreakFoot.textContent = streak
      ? streak === 1
        ? '好开头，明天见'
        : '火苗正旺，别熄灭'
      : '今天也来记一笔吧';
  }

  function renderHero() {
    let lead = '每一道错题，';
    let emphasis = '都是提分线索。';

    if (state.subject !== 'all') {
      lead = `${state.subject}错题，`;
      emphasis = '一道一道吃透。';
    } else if (state.view === 'due') {
      lead = '今天到期的，';
      emphasis = '再把它做一遍。';
    } else if (state.view === 'mastered') {
      lead = '已经攻克的，';
      emphasis = '也值得回头看看。';
    }

    if (state.module !== 'all') {
      lead = `${state.module}，`;
      emphasis = '把错过的题补回来。';
    }

    els.heroTitle.innerHTML = `${escapeHtml(lead)}<em>${escapeHtml(emphasis)}</em>`;
  }

  function filteredRecords() {
    let list = records.slice();

    if (state.view === 'due') list = list.filter(isDue);
    if (state.view === 'mastered') list = list.filter(isMastered);
    if (state.subject !== 'all') list = list.filter((record) => record.subject === state.subject);
    if (state.module !== 'all') list = list.filter((record) => record.module === state.module);
    if (state.stage !== 'all') list = list.filter(matchesStageFilter);

    const terms = state.search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length) {
      list = list.filter((record) => {
        const haystack = [
          record.question,
          record.myAnswer,
          record.correctAnswer,
          record.reason,
          record.knowledgeAnalysis,
          record.subject,
          getSubjectConfig(record.subject).aliases.join(' '),
          record.module,
          record.chapter,
          record.topic,
          record.stage,
          getMasteryMeta(record.masteryLevel).label,
          record.sourceType,
          record.sourceDetail,
          record.date,
          record.tags.join(' '),
          record.causes.join(' ')
        ]
          .join('\n')
          .toLowerCase();
        return terms.every((term) => haystack.includes(term));
      });
    }

    if (state.view === 'due') {
      list.sort((left, right) => {
        const dueCompare = String(left.dueDate).localeCompare(String(right.dueDate));
        if (dueCompare !== 0) return dueCompare;
        return left.date.localeCompare(right.date) || left.createdAt - right.createdAt;
      });
      return list;
    }

    list.sort((left, right) => {
      const dateCompare = left.date.localeCompare(right.date);
      if (dateCompare !== 0) return state.sort === 'desc' ? -dateCompare : dateCompare;
      const timeCompare = left.createdAt - right.createdAt;
      return state.sort === 'desc' ? -timeCompare : timeCompare;
    });

    return list;
  }

  function recordCard(record, index) {
    const subject = getSubjectMeta(record.subject);
    const open = state.expanded.has(record.id);
    const levelMeta = getMasteryMeta(record.masteryLevel);
    const due = getDueText(record);
    const firstCause = record.causes[0] || '';
    const classification = [record.module, record.chapter].filter(Boolean).join(' / ');
    const sourceText = record.sourceDetail
      ? `${record.sourceType} · ${record.sourceDetail}`
      : record.sourceType;
    const knowledgeAnalysis = record.knowledgeAnalysis || '';

    const statusTags = []
      .concat(record.tags.map((tag) => `<span class="detail-tag">#${escapeHtml(tag)}</span>`))
      .concat(record.causes.map((cause) => `<span class="detail-tag is-cause">${escapeHtml(cause)}</span>`))
      .join('');

    const imageHtml = record.images.length
      ? `<div class="record-images">${record.images
          .map(
            (source, imageIndex) => `
              <button class="record-thumb" type="button" data-action="image" data-index="${imageIndex}" aria-label="查看第 ${imageIndex + 1} 张题目图片">
                <img src="${escapeAttribute(source)}" alt="题目图片 ${imageIndex + 1}" loading="lazy">
              </button>
            `
          )
          .join('')}</div>`
      : '';

    const attempts = record.attempts.slice(-3).reverse();
    const attemptHtml = attempts.length
      ? `<div class="attempt-history">
          <p class="attempt-title">最近重做</p>
          <div class="attempt-list">
            ${attempts
              .map(
                (attempt) => `
                  <span class="attempt-item is-${attempt.result}">
                    <b>${RESULT_LABELS[attempt.result]}</b>
                    <em>${formatShortDate(toDateKey(new Date(attempt.at)))}</em>
                    <small>${formatDuration(attempt.duration)}</small>
                  </span>
                `
              )
              .join('')}
          </div>
        </div>`
      : '';

    return `
      <article class="record ${open ? 'is-open' : ''} ${isMastered(record) ? 'is-mastered' : ''}" data-id="${escapeAttribute(record.id)}" style="--subject:${subject.color}; --subject-soft:${subject.soft}; --i:${index}">
        <div class="record-head">
          <span class="subject-pill">${escapeHtml(record.subject)}</span>
          ${
            classification
              ? `<span class="meta-tag meta-classification" title="${escapeAttribute(classification)}">${escapeHtml(classification)}</span>`
              : ''
          }
          ${record.stage !== '基础' ? `<span class="meta-tag meta-stage">${escapeHtml(record.stage)}</span>` : ''}
          ${record.sourceType === '真题' ? '<span class="meta-tag meta-exam">真题</span>' : ''}
          ${firstCause ? `<span class="meta-tag meta-cause">${escapeHtml(firstCause)}</span>` : ''}
          <div class="record-toolbar">
            <span class="record-time">${formatTime(record.createdAt)}</span>
            <button class="icon-btn" type="button" data-action="rework" aria-label="重做这道错题" title="重做这道题">
              <svg><use href="#i-play"></use></svg>
            </button>
            <button class="icon-btn ${isMastered(record) ? 'is-mastered' : ''}" type="button" data-action="mastered" aria-label="${isMastered(record) ? '移回复习中' : '标记为稳了'}" title="${isMastered(record) ? '移回复习中' : '标记为稳了'}">
              <svg><use href="#i-check-circle"></use></svg>
            </button>
            <button class="icon-btn" type="button" data-action="edit" aria-label="编辑这道错题" title="编辑">
              <svg><use href="#i-edit"></use></svg>
            </button>
            <button class="icon-btn is-danger" type="button" data-action="delete" aria-label="删除这道错题" title="删除">
              <svg><use href="#i-trash"></use></svg>
            </button>
          </div>
        </div>
        <h3 class="record-title">${escapeHtml(record.question)}</h3>
        <div class="record-foot">
          <button class="reveal-btn" type="button" data-action="reveal" aria-expanded="${open}" aria-controls="detail-${escapeAttribute(record.id)}">
            <span>${open ? '收起解析' : '查看解析'}</span>
            <svg><use href="#i-chevron-down"></use></svg>
          </button>
          <div class="record-foot-right">
            ${record.images.length ? `<span>${record.images.length} 张图</span>` : ''}
            <span class="stage-pill ${getMasteryClass(record.masteryLevel)}">${levelMeta.label}</span>
            <span class="due-pill ${due.tone}">${escapeHtml(due.text)}</span>
          </div>
        </div>
        <div class="record-detail" id="detail-${escapeAttribute(record.id)}" aria-hidden="${!open}">
          <div class="record-detail-inner">
            <div class="detail-content">
              <div class="detail-info">
                <span><b>学习阶段</b>${escapeHtml(record.stage)}</span>
                ${record.topic ? `<span><b>考点</b>${escapeHtml(record.topic)}</span>` : ''}
                <span><b>来源</b>${escapeHtml(sourceText)}</span>
                <span><b>复习</b>${record.reviewCount ? `已重做 ${record.reviewCount} 次` : '还没重做过'}</span>
              </div>
              <div class="answer-grid">
                <div class="answer-card">
                  <div class="answer-label"><svg><use href="#i-edit"></use></svg>我的答案</div>
                  <p class="answer-text ${record.myAnswer ? '' : 'is-empty'}">${record.myAnswer ? escapeHtml(record.myAnswer) : '当时没有写下答案。'}</p>
                </div>
                <div class="answer-card is-correct">
                  <div class="answer-label"><svg><use href="#i-check"></use></svg>正确答案 / 解法</div>
                  <p class="answer-text ${record.correctAnswer ? '' : 'is-empty'}">${record.correctAnswer ? escapeHtml(record.correctAnswer) : '还没补上正确答案。'}</p>
                </div>
              </div>
              ${
                record.reason
                  ? `<div class="reason-card">
                      <svg><use href="#i-quote"></use></svg>
                      <div>
                        <p class="reason-label">错因复盘</p>
                        <p class="reason-text">${escapeHtml(record.reason)}</p>
                      </div>
                    </div>`
                  : ''
              }
              ${
                knowledgeAnalysis
                  ? `<div class="knowledge-analysis-card">
                      <svg><use href="#i-layers"></use></svg>
                      <div>
                        <p class="knowledge-analysis-label">知识点分析</p>
                        <p class="reason-text">${escapeHtml(knowledgeAnalysis)}</p>
                      </div>
                    </div>`
                  : ''
              }
              ${statusTags ? `<div class="detail-tags">${statusTags}</div>` : ''}
              ${attemptHtml}
              ${imageHtml}
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderRecords() {
    const visible = filteredRecords();
    const total = records.length;

    if (!visible.length) {
      els.recordList.innerHTML = '';
      els.emptyState.hidden = false;
      renderEmptyState();
    } else {
      els.emptyState.hidden = true;
      const groups = new Map();
      visible.forEach((record) => {
        const key = state.view === 'due' ? record.dueDate || record.date : record.date;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(record);
      });

      let cardIndex = 0;
      const html = Array.from(groups.entries())
        .map(([date, group]) => {
          const heading = state.view === 'due' ? getDueHeading(date) : getDateHeading(date);
          const cards = group
            .map((record) => {
              cardIndex += 1;
              return recordCard(record, cardIndex);
            })
            .join('');
          return `
            <section class="date-group" aria-label="${escapeAttribute(heading.label)}的错题">
              <div class="date-divider">
                <div class="date-leading">
                  <span class="date-label">${escapeHtml(heading.label)}</span>
                  <span class="date-sub">${escapeHtml(heading.sub)}</span>
                </div>
                <span class="date-rule"></span>
                <span class="date-count">${group.length} 道</span>
              </div>
              <div class="records">${cards}</div>
            </section>
          `;
        })
        .join('');

      els.recordList.innerHTML = html;
    }

    updateResultSummary(visible.length, total);
  }

  function updateResultSummary(visibleCount, total) {
    let text = `共 ${total} 道错题`;
    if (!total) {
      text = '共 0 道错题';
    } else if (state.search.trim()) {
      text = `找到 ${visibleCount} 道 · 共 ${total} 道`;
    } else if (state.module !== 'all') {
      text = `${state.module} ${visibleCount} 道 · 共 ${total} 道`;
    } else if (state.subject !== 'all') {
      text = `${state.subject} ${visibleCount} 道 · 共 ${total} 道`;
    } else if (state.stage !== 'all') {
      text = `${getStageFilterLabel(state.stage)} ${visibleCount} 道 · 共 ${total} 道`;
    } else if (state.view !== 'all') {
      text = `${VIEW_LABELS[state.view]} ${visibleCount} 道 · 共 ${total} 道`;
    }
    els.resultSummary.textContent = text;
  }

  function renderEmptyState() {
    const hasFilters =
      Boolean(state.search.trim()) ||
      state.subject !== 'all' ||
      state.module !== 'all' ||
      state.stage !== 'all';

    let title = '这里还空着，等你写下第一道错题。';
    let desc = '把它留下来，拆开看看是哪里卡住了。下次重做时，你会知道该盯着哪一步。';
    let actions = `
      <button class="btn btn-primary" type="button" data-empty-action="add">
        <svg><use href="#i-plus"></use></svg>记下第一道错题
      </button>
      <button class="btn btn-ghost" type="button" data-empty-action="sample">
        <svg><use href="#i-sparkle"></use></svg>载入示例看看
      </button>
    `;
    let tip = '记录和图片只保存在你的浏览器里，不会上传到任何服务器。';

    if (records.length > 0 && hasFilters) {
      title = '没有找到匹配的错题。';
      desc = '换一个关键词，或者把学科、模块、阶段筛选放宽一点。';
      actions = `
        <button class="btn btn-primary" type="button" data-empty-action="clear">
          <svg><use href="#i-reload"></use></svg>清除筛选
        </button>
        <button class="btn btn-ghost" type="button" data-empty-action="add">
          <svg><use href="#i-plus"></use></svg>记一道错题
        </button>
      `;
      tip = '搜索会匹配题目、答案、错因、章节和来源。';
    } else if (records.length > 0 && state.view === 'due') {
      title = '今天没有到期错题。';
      desc = '按间隔复习的节奏，今天可以轻松一点。也可以去「全部错题」提前重做，或者把今天课程里的新错题记下来。';
      actions = `
        <button class="btn btn-primary" type="button" data-empty-action="view-all">
          <svg><use href="#i-book"></use></svg>看看全部错题
        </button>
        <button class="btn btn-ghost" type="button" data-empty-action="add">
          <svg><use href="#i-plus"></use></svg>记一道错题
        </button>
      `;
      tip = '间隔复习不是为了每天做很多，而是为了在快忘的时候再见一面。';
    } else if (records.length > 0 && state.view === 'mastered') {
      title = '还没有标记为稳了的错题。';
      desc = '当你连续重做都能做对，就可以把它收进这里。它不是永别，只是下一次快速回顾。';
      actions = `
        <button class="btn btn-primary" type="button" data-empty-action="view-due">
          <svg><use href="#i-clock"></use></svg>去今日复习
        </button>
        <button class="btn btn-ghost" type="button" data-empty-action="add">
          <svg><use href="#i-plus"></use></svg>记一道错题
        </button>
      `;
      tip = '「稳了」不代表不再看，而是可以更快地回顾。';
    }

    els.emptyTitle.textContent = title;
    els.emptyDesc.textContent = desc;
    els.emptyActions.innerHTML = actions;
    if (els.emptyTip) els.emptyTip.textContent = tip;
  }

  /* =========================================================
     表单与分类
     ========================================================= */

  function initFormOptions() {
    els.subjectChoices.innerHTML = SUBJECTS.map(
      (subject) => `
        <button class="subject-choice" type="button" data-subject="${escapeAttribute(subject.name)}" aria-pressed="false" style="--dot:${subject.color}">
          ${escapeHtml(subject.name)}
        </button>
      `
    ).join('');

    els.fSourceType.innerHTML = SOURCE_TYPES.map(
      (source) => `<option value="${escapeAttribute(source)}">${escapeHtml(source)}</option>`
    ).join('');

    els.stageChoices.innerHTML = STUDY_STAGES.map(
      (stage) => `<button class="stage-choice" type="button" data-stage="${escapeAttribute(stage)}" aria-pressed="false">${escapeHtml(stage)}</button>`
    ).join('');

    setSelectedSubject('数学一', { resetClassification: false });
    setSelectedStage('基础');
  }

  function setSelectedSubject(name, options = {}) {
    const previous = selectedSubject;
    selectedSubject = normalizeSubjectName(name);
    $$('.subject-choice', els.subjectChoices).forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.subject === selectedSubject));
    });
    if (options.resetClassification && previous !== selectedSubject) {
      els.fModule.value = '';
      els.fChapter.value = '';
    }
    syncClassificationDatalists();
    renderCauseChips();
  }

  function setSelectedStage(stage) {
    selectedStage = STUDY_STAGES.includes(stage) ? stage : '基础';
    $$('.stage-choice', els.stageChoices).forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.stage === selectedStage));
    });
  }

  function syncClassificationDatalists() {
    const modules = getModuleNames(selectedSubject).slice();
    records
      .filter((record) => record.subject === selectedSubject)
      .forEach((record) => {
        if (record.module && !modules.includes(record.module)) modules.push(record.module);
      });
    els.moduleOptions.innerHTML = modules
      .map((module) => `<option value="${escapeAttribute(module)}"></option>`)
      .join('');
    updateChapterDatalist();
  }

  function updateChapterDatalist() {
    const module = els.fModule.value.trim();
    const chapters = getChapterNames(selectedSubject, module).slice();
    if (!chapters.length) {
      getSubjectConfig(selectedSubject).modules.forEach((item) => {
        item.chapters.forEach((chapter) => {
          if (!chapters.includes(chapter)) chapters.push(chapter);
        });
      });
    }
    records
      .filter((record) => record.subject === selectedSubject && (!module || record.module === module))
      .forEach((record) => {
        if (record.chapter && !chapters.includes(record.chapter)) chapters.push(record.chapter);
      });

    els.chapterOptions.innerHTML = chapters
      .map((chapter) => `<option value="${escapeAttribute(chapter)}"></option>`)
      .join('');
  }

  function getCausesForSubject(subject) {
    return CAUSE_PRESETS[normalizeSubjectName(subject)] || CAUSE_PRESETS['其他'];
  }

  function renderCauseChips() {
    const presets = getCausesForSubject(selectedSubject);
    const extras = Array.from(draftCauses).filter((cause) => !presets.includes(cause));
    const causes = presets.concat(extras);
    els.causeChips.innerHTML = causes
      .map(
        (cause) =>
          `<button class="cause-chip" type="button" data-cause="${escapeAttribute(cause)}" aria-pressed="${draftCauses.has(cause)}">${escapeHtml(cause)}</button>`
      )
      .join('');
  }

  function openRecordDialog(record = null) {
    if (els.recordDialog.open) return;

    editingId = record ? record.id : null;
    selectedSubject = record ? record.subject : '数学一';
    selectedStage = record && STUDY_STAGES.includes(record.stage) ? record.stage : '基础';
    draftCauses = new Set(record ? record.causes : []);
    draftImages = record ? record.images.slice() : [];

    els.recordForm.reset();
    els.fDate.value = record ? record.date : todayKey();
    els.fModule.value = record ? record.module : '';
    els.fChapter.value = record ? record.chapter : '';
    els.fTopic.value = record ? record.topic : '';
    els.fSourceType.value = record && SOURCE_TYPES.includes(record.sourceType) ? record.sourceType : '课程例题';
    els.fSourceDetail.value = record ? record.sourceDetail : '';
    els.fQuestion.value = record ? record.question : '';
    els.fMyAnswer.value = record ? record.myAnswer : '';
    els.fCorrect.value = record ? record.correctAnswer : '';
    els.fReason.value = record ? record.reason : '';
    els.fKnowledgeAnalysis.value = record ? record.knowledgeAnalysis : '';
    els.fTags.value = record ? record.tags.join('，') : '';
    els.fMastered.checked = Boolean(record && isMastered(record));
    els.fQuestion.setCustomValidity('');
    els.imageInput.value = '';

    els.recordDialogTitle.textContent = record ? '编辑这道错题' : '记一道错题';
    els.sheetKicker.textContent = record ? 'EDIT MISTAKE NOTE' : 'NEW MISTAKE NOTE';
    els.sheetSub.textContent = record
      ? '把分类和复盘补完整，下一次重做会更有的放矢。'
      : '记下题目，也记下当时为什么卡住。';
    els.saveRecordBtn.textContent = record ? '保存修改' : '保存错题';

    $$('.subject-choice', els.subjectChoices).forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.subject === selectedSubject));
    });
    setSelectedStage(selectedStage);
    renderCauseChips();
    syncClassificationDatalists();
    renderImagePreviews();
    updateStageNote(record);

    els.recordDialog.showModal();
    window.requestAnimationFrame(() => {
      els.fQuestion.focus({ preventScroll: true });
      const body = $('.sheet-body', els.recordDialog);
      if (body) body.scrollTop = 0;
    });
  }

  function closeRecordDialog() {
    if (els.recordDialog.open) els.recordDialog.close();
  }

  function updateStageNote(record = null) {
    const editingRecord = record || (editingId ? records.find((item) => item.id === editingId) : null);
    if (!editingRecord) {
      els.stageNote.hidden = true;
      els.stageNote.textContent = '';
      return;
    }

    els.stageNote.hidden = false;
    if (els.fMastered.checked) {
      els.stageNote.textContent = '保存后会标记为「稳了」，不再进入今日复习。';
      return;
    }
    if (isMastered(editingRecord)) {
      els.stageNote.textContent = '保存后会回到「未复盘」，并重新安排复习。';
      return;
    }
    const due = getDueText(editingRecord);
    els.stageNote.textContent = `当前阶段：${getMasteryMeta(editingRecord.masteryLevel).label} · ${due.text} · 已重做 ${editingRecord.reviewCount} 次`;
  }

  function renderImagePreviews() {
    els.imagePreview.innerHTML = draftImages
      .map(
        (source, index) => `
          <div class="image-item">
            <img src="${escapeAttribute(source)}" alt="待保存的题目图片 ${index + 1}">
            <button class="image-remove" type="button" data-image-index="${index}" aria-label="移除第 ${index + 1} 张图片" title="移除">
              <svg><use href="#i-close"></use></svg>
            </button>
          </div>
        `
      )
      .join('');

    const full = draftImages.length >= MAX_IMAGES;
    els.dropzone.classList.toggle('is-full', full);
    els.dropzone.title = full ? `最多只能添加 ${MAX_IMAGES} 张图片` : '';
  }

  async function saveRecord(event) {
    event.preventDefault();
    if (imagesProcessing > 0) {
      showToast('图片还在处理中，稍等一下。');
      return;
    }
    if (savingRecord) return;

    const question = els.fQuestion.value.trim();
    if (!question) {
      els.fQuestion.setCustomValidity('请先写下题目。');
      els.fQuestion.reportValidity();
      els.fQuestion.focus();
      return;
    }
    els.fQuestion.setCustomValidity('');
    savingRecord = true;
    els.saveRecordBtn.disabled = true;

    const date = isValidDateKey(els.fDate.value) ? els.fDate.value : todayKey();
    const existing = editingId ? records.find((record) => record.id === editingId) : null;
    const masterChecked = els.fMastered.checked;

    let masteryLevel = 0;
    let dueDate = addDaysKey(todayKey(), MASTERY_LEVELS[0].interval);
    let reviewCount = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let lastReviewedAt = null;
    let attempts = [];

    if (existing) {
      masteryLevel = existing.masteryLevel;
      dueDate = existing.dueDate;
      reviewCount = existing.reviewCount;
      correctCount = existing.correctCount;
      wrongCount = existing.wrongCount;
      lastReviewedAt = existing.lastReviewedAt;
      attempts = existing.attempts;
      if (masterChecked) {
        masteryLevel = 5;
        dueDate = null;
      } else if (isMastered(existing)) {
        masteryLevel = 0;
        dueDate = todayKey();
      } else if (!dueDate) {
        dueDate = todayKey();
      }
    } else if (masterChecked) {
      masteryLevel = 5;
      dueDate = null;
    }

    const candidate = {
      id: existing ? existing.id : uid(),
      date,
      subject: normalizeSubjectName(selectedSubject),
      module: clipText(els.fModule.value.trim(), 40) || (selectedSubject === '其他' ? '其他' : '未分类'),
      chapter: clipText(els.fChapter.value.trim(), 40),
      topic: clipText(els.fTopic.value.trim(), 80),
      stage: selectedStage,
      sourceType: SOURCE_TYPES.includes(els.fSourceType.value) ? els.fSourceType.value : '其他',
      sourceDetail: clipText(els.fSourceDetail.value.trim(), 80),
      question: clipText(question, MAX_QUESTION_LENGTH),
      myAnswer: clipText(els.fMyAnswer.value.trim(), 3000),
      correctAnswer: clipText(els.fCorrect.value.trim(), 3000),
      reason: clipText(els.fReason.value.trim(), 3000),
      knowledgeAnalysis: clipText(els.fKnowledgeAnalysis.value.trim(), 3000),
      causes: Array.from(draftCauses),
      tags: parseTags(els.fTags.value),
      images: draftImages.slice(0, MAX_IMAGES),
      masteryLevel,
      dueDate,
      reviewCount,
      correctCount,
      wrongCount,
      lastReviewedAt,
      attempts,
      createdAt: existing ? existing.createdAt : Date.now(),
      updatedAt: Date.now()
    };

    let next;
    if (existing) {
      next = records.map((record) => (record.id === existing.id ? candidate : record));
    } else {
      next = [candidate, ...records];
      if (state.view === 'due' && !isDue(candidate)) state.view = 'all';
      if (state.view === 'mastered' && !isMastered(candidate)) state.view = 'all';
      if (state.stage !== 'all' && !matchesStageFilter(candidate)) state.stage = 'all';
      if (state.subject !== 'all' && state.subject !== candidate.subject) state.subject = 'all';
      if (state.module !== 'all' && state.module !== candidate.module) state.module = 'all';
    }

    const result = await commit(next);
    savingRecord = false;
    if (els.recordDialog.open) els.saveRecordBtn.disabled = false;
    if (!result.ok) return;

    els.recordDialog.close();
    if (existing) {
      showToast('修改已保存');
    } else if (masterChecked) {
      showToast('已收进错题本，并标记为稳了');
    } else {
      showToast('已收进错题本，明天进入复习');
    }

    window.setTimeout(() => {
      const card = Array.from(els.recordList.querySelectorAll('.record')).find(
        (item) => item.dataset.id === candidate.id
      );
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('is-just-saved');
        window.setTimeout(() => card.classList.remove('is-just-saved'), 1600);
      }
    }, 120);
  }

  /* =========================================================
     图片处理
     ========================================================= */

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('不是图片文件'));
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        reject(new Error('图片超过 25MB'));
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        try {
          const maxDimension = 1280;
          const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
          const width = Math.max(1, Math.round(image.naturalWidth * scale));
          const height = Math.max(1, Math.round(image.naturalHeight * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d');
          if (!context) throw new Error('无法处理图片');
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, width, height);
          context.drawImage(image, 0, 0, width, height);
          let dataUrl = canvas.toDataURL('image/jpeg', 0.76);
          if (dataUrl.length > 1500000) dataUrl = canvas.toDataURL('image/jpeg', 0.62);
          if (dataUrl.length > 2800000) throw new Error('图片压缩后仍然过大');
          URL.revokeObjectURL(objectUrl);
          resolve(dataUrl);
        } catch (error) {
          URL.revokeObjectURL(objectUrl);
          reject(error);
        }
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('图片读取失败'));
      };
      image.src = objectUrl;
    });
  }

  async function addImages(files) {
    if (imagesProcessing > 0) {
      showToast('上一张图片还在处理中，稍等一下。');
      return;
    }

    const incoming = Array.from(files || []).filter((file) => file && file.type.startsWith('image/'));
    if (!incoming.length) {
      showToast('请选择图片文件。', { type: 'error' });
      return;
    }

    const available = MAX_IMAGES - draftImages.length;
    if (available <= 0) {
      showToast(`每道错题最多保存 ${MAX_IMAGES} 张图片。`);
      return;
    }
    if (incoming.length > available) {
      showToast(`最多还能添加 ${available} 张，已自动保留前 ${available} 张。`);
    }

    imagesProcessing += 1;
    els.dropzone.classList.add('is-loading');
    els.saveRecordBtn.disabled = true;

    try {
      for (const file of incoming.slice(0, available)) {
        try {
          const source = await compressImage(file);
          if (!els.recordDialog.open) return;
          draftImages.push(source);
          renderImagePreviews();
        } catch (error) {
          showToast(
            error && error.message === '图片超过 25MB'
              ? '这张图片太大了，请压缩后再试。'
              : '有图片没能处理成功，请换一张试试。',
            { type: 'error' }
          );
        }
      }
    } finally {
      imagesProcessing -= 1;
      els.dropzone.classList.remove('is-loading');
      els.saveRecordBtn.disabled = false;
      els.imageInput.value = '';
    }
  }

  /* =========================================================
     记录操作
     ========================================================= */

  async function handleRecordListClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button || !els.recordList.contains(button)) return;

    const card = button.closest('.record');
    if (!card) return;
    const id = card.dataset.id;
    const record = records.find((item) => item.id === id);
    if (!record) return;

    const action = button.dataset.action;

    if (action === 'reveal') {
      const open = !state.expanded.has(id);
      if (open) state.expanded.add(id);
      else state.expanded.delete(id);
      card.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      const label = button.querySelector('span');
      if (label) label.textContent = open ? '收起解析' : '查看解析';
      const detail = $(`#detail-${id}`, card);
      if (detail) detail.setAttribute('aria-hidden', String(!open));
      return;
    }

    if (action === 'edit') {
      openRecordDialog(record);
      return;
    }

    if (action === 'rework') {
      startSingleRework(record.id);
      return;
    }

    if (action === 'delete') {
      await deleteRecord(id);
      return;
    }

    if (action === 'mastered') {
      await toggleMastered(id);
      return;
    }

    if (action === 'image') {
      const imageIndex = Number(button.dataset.index);
      const source = record.images[imageIndex];
      if (source) openLightbox(source);
    }
  }

  async function toggleMastered(id) {
    const record = records.find((item) => item.id === id);
    if (!record) return;
    const before = {
      masteryLevel: record.masteryLevel,
      dueDate: record.dueDate
    };
    const nextLevel = isMastered(record) ? 0 : 5;
    const nextDue = nextLevel === 5 ? null : todayKey();
    const next = records.map((item) =>
      item.id === id ? { ...item, masteryLevel: nextLevel, dueDate: nextDue, updatedAt: Date.now() } : item
    );
    const result = await commit(next);
    if (!result.ok) return;

    showToast(isMastered(record) ? '已移回复习中' : '已标记为稳了，漂亮', {
      actionText: '撤销',
      duration: 5000,
      onAction: async () => {
        const current = records.find((item) => item.id === id);
        if (!current) return;
        const restored = records.map((item) =>
          item.id === id
            ? { ...item, masteryLevel: before.masteryLevel, dueDate: before.dueDate, updatedAt: Date.now() }
            : item
        );
        const undo = await commit(restored);
        if (undo.ok) showToast('已撤销');
      }
    });
  }

  async function deleteRecord(id) {
    const index = records.findIndex((item) => item.id === id);
    if (index < 0) return;
    const removed = records[index];
    const next = records.filter((item) => item.id !== id);
    const result = await commit(next);
    if (!result.ok) return;

    showToast('已删除这道错题', {
      actionText: '撤销',
      duration: 5200,
      onAction: async () => {
        const restored = records.slice();
        restored.splice(Math.min(index, restored.length), 0, removed);
        const undo = await commit(restored);
        if (undo.ok) showToast('已恢复这道错题');
      }
    });
  }

  /* =========================================================
     筛选与导航
     ========================================================= */

  function setView(view) {
    if (!VIEW_LABELS[view]) return;
    state.view = view;
    render();
    closeSidebar();
    scrollPageTop();
  }

  function setSubject(subject) {
    state.subject = subject || 'all';
    state.module = 'all';
    state.stage = 'all';
    render();
    closeSidebar();
    scrollPageTop();
  }

  function clearAllFilters() {
    state.view = 'all';
    state.subject = 'all';
    state.module = 'all';
    state.stage = 'all';
    state.search = '';
    render();
    scrollPageTop();
  }

  function scrollPageTop() {
    if (window.scrollY < 90) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function openSidebar() {
    els.sidebar.classList.add('is-open');
    els.sidebarBackdrop.hidden = false;
    els.menuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
  }

  function closeSidebar() {
    els.sidebar.classList.remove('is-open');
    els.sidebarBackdrop.hidden = true;
    els.menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }

  /* =========================================================
     重做模式
     ========================================================= */

  function startQuestionTimer() {
    stopQuestionTimer();
    review.startedAt = Date.now();
    review.elapsed = 0;
    updateReviewTimer();
    review.timerId = window.setInterval(updateReviewTimer, 1000);
  }

  function stopQuestionTimer() {
    if (review.timerId) {
      window.clearInterval(review.timerId);
      review.timerId = null;
    }
  }

  function freezeQuestionTimer() {
    if (review.startedAt) {
      review.elapsed = Math.max(0, Math.floor((Date.now() - review.startedAt) / 1000));
    }
    stopQuestionTimer();
    updateReviewTimer();
  }

  function updateReviewTimer() {
    const value = review.revealed
      ? review.elapsed
      : review.startedAt
        ? Math.floor((Date.now() - review.startedAt) / 1000)
        : 0;
    const target = els.reviewTimer.querySelector('b');
    if (target) target.textContent = formatDuration(value);
  }

  function startReview() {
    if (els.reviewDialog.open) return;
    const due = getDueRecords();
    if (!due.length) {
      showToast(records.length ? '今天没有到期错题，可以提前重做，或者先记新题。' : '还没有错题，先记一道吧。');
      return;
    }

    review.queue = due;
    review.index = 0;
    review.revealed = false;
    review.busy = false;
    review.single = false;
    review.correct = 0;
    review.stuck = 0;
    review.blank = 0;
    review.elapsed = 0;
    review.startedAt = 0;

    els.reviewDialog.showModal();
    renderReview();
    startQuestionTimer();
    window.requestAnimationFrame(() => els.reviewContent.focus({ preventScroll: true }));
  }

  function startSingleRework(id) {
    if (els.reviewDialog.open) return;
    const record = records.find((item) => item.id === id);
    if (!record) return;

    review.queue = [record];
    review.index = 0;
    review.revealed = false;
    review.busy = false;
    review.single = true;
    review.correct = 0;
    review.stuck = 0;
    review.blank = 0;
    review.elapsed = 0;
    review.startedAt = 0;

    els.reviewDialog.showModal();
    renderReview();
    startQuestionTimer();
    window.requestAnimationFrame(() => els.reviewContent.focus({ preventScroll: true }));
  }

  function renderReview() {
    if (review.index >= review.queue.length) {
      renderReviewComplete();
      return;
    }

    const record = review.queue[review.index];
    const subject = getSubjectMeta(record.subject);
    const total = review.queue.length;
    els.reviewCounter.textContent = `${review.index + 1} / ${total}`;
    els.reviewProgressBar.style.width = `${((review.index + 1) / total) * 100}%`;

    const meta = `
      <div class="review-meta">
        <span class="subject-pill" style="--subject:${subject.color}; --subject-soft:${subject.soft}">${escapeHtml(record.subject)}</span>
        ${record.module ? `<span class="meta-tag">${escapeHtml(record.module)}${record.chapter ? ` / ${escapeHtml(record.chapter)}` : ''}</span>` : ''}
        ${record.topic ? `<span class="meta-tag">${escapeHtml(record.topic)}</span>` : ''}
        <span class="stage-pill ${getMasteryClass(record.masteryLevel)}">${getMasteryMeta(record.masteryLevel).label}</span>
        <span class="meta-tag">${escapeHtml(record.sourceType)}</span>
      </div>
    `;

    const question = `<h3 class="review-question">${escapeHtml(record.question)}</h3>`;

    if (!review.revealed) {
      els.reviewContent.innerHTML = `
        ${meta}
        ${question}
        <div class="review-hint">
          <svg><use href="#i-eye"></use></svg>
          <span>把答案遮住，先自己完整做一遍。写好之后再揭晓答案，判断这次是真的会了，还是只是看懂了。</span>
        </div>
        <div class="review-actions">
          <span class="review-keys">按 <kbd>空格</kbd> 看答案</span>
          <button class="btn btn-primary" type="button" data-review-action="reveal">
            <svg><use href="#i-eye"></use></svg>
            我写完了，看答案
          </button>
        </div>
      `;
      els.reviewContent.scrollTop = 0;
      return;
    }

    const myAnswer = record.myAnswer || '当时没有写下答案。';
    const correctAnswer = record.correctAnswer || '还没有补充正确答案，可以稍后回到错题本完善。';
    const reasonHtml = record.reason
      ? `<div class="review-reason">
          <div class="reason-card">
            <svg><use href="#i-quote"></use></svg>
            <div>
              <p class="reason-label">错因复盘</p>
              <p class="reason-text">${escapeHtml(record.reason)}</p>
            </div>
          </div>
        </div>`
      : '';

    const analysisHtml = record.knowledgeAnalysis
      ? `<div class="review-analysis">
          <div class="knowledge-analysis-card">
            <svg><use href="#i-layers"></use></svg>
            <div>
              <p class="knowledge-analysis-label">知识点分析</p>
              <p class="reason-text">${escapeHtml(record.knowledgeAnalysis)}</p>
            </div>
          </div>
        </div>`
      : '';

    const tagsHtml = record.tags.length
      ? `<div class="review-tags">${record.tags.map((tag) => `<span class="detail-tag">#${escapeHtml(tag)}</span>`).join('')}</div>`
      : '';

    els.reviewContent.innerHTML = `
      ${meta}
      ${question}
      <div class="review-answer-grid">
        <div class="answer-card">
          <div class="answer-label"><svg><use href="#i-edit"></use></svg>上次我的答案</div>
          <p class="answer-text ${record.myAnswer ? '' : 'is-empty'}">${escapeHtml(myAnswer)}</p>
        </div>
        <div class="answer-card is-correct">
          <div class="answer-label"><svg><use href="#i-check"></use></svg>正确答案 / 解法</div>
          <p class="answer-text ${record.correctAnswer ? '' : 'is-empty'}">${escapeHtml(correctAnswer)}</p>
        </div>
      </div>
      ${reasonHtml}
      ${analysisHtml}
      ${tagsHtml}
      <div class="review-result-box">
        <p class="review-result-question">这次是真的做出来了吗？</p>
        <div class="review-result-actions">
          <button class="result-btn is-correct" type="button" data-review-action="correct">
            <svg><use href="#i-check"></use></svg>
            <span><b>做对了</b><small>进入下一阶段</small></span>
          </button>
          <button class="result-btn is-stuck" type="button" data-review-action="stuck">
            <span><b>卡住了</b><small>明天再来一次</small></span>
          </button>
          <button class="result-btn is-blank" type="button" data-review-action="blank">
            <span><b>完全不会</b><small>回到未复盘</small></span>
          </button>
        </div>
        <p class="review-keys result-keys">按 <kbd>1</kbd> 做对 · <kbd>2</kbd> 卡住 · <kbd>3</kbd> 完全不会</p>
      </div>
    `;
    els.reviewContent.scrollTop = 0;
  }

  function renderReviewComplete() {
    stopQuestionTimer();
    const remaining = getDueRecords().length;
    els.reviewCounter.textContent = `${review.queue.length} / ${review.queue.length}`;
    els.reviewProgressBar.style.width = '100%';
    const b = els.reviewTimer.querySelector('b');
    if (b) b.textContent = '00:00';

    const description = review.single
      ? '这道题的重做结果已经记下来了。下一次复习时间会按照这次的表现自动调整。'
      : remaining
        ? `这一轮重做完成。还有 ${remaining} 道今天到期的题，可以再来一轮，也可以先休息一下。`
        : '今天到期的错题都处理完了。下一次会在合适的时候再提醒你，不用一次把所有东西都做完。';

    els.reviewContent.innerHTML = `
      <div class="review-complete">
        <div class="complete-seal"><svg><use href="#i-check"></use></svg></div>
        <h3>${review.single ? '这道题重做完了' : '这一轮重做完成'}</h3>
        <p>${escapeHtml(description)}</p>
        <div class="complete-stats">
          <div class="complete-stat is-good">
            <strong>${review.correct}</strong>
            <span>做对了</span>
          </div>
          <div class="complete-stat is-warn">
            <strong>${review.stuck}</strong>
            <span>卡住了</span>
          </div>
          <div class="complete-stat is-bad">
            <strong>${review.blank}</strong>
            <span>完全不会</span>
          </div>
          <div class="complete-stat">
            <strong>${remaining}</strong>
            <span>今日剩余到期</span>
          </div>
        </div>
        <div class="review-actions" style="justify-content:center">
          ${
            remaining && !review.single
              ? '<button class="btn btn-primary" type="button" data-review-action="restart"><svg><use href="#i-reload"></use></svg>再重做一轮</button>'
              : ''
          }
          <button class="btn ${remaining && !review.single ? 'btn-ghost' : 'btn-primary'}" type="button" data-review-action="close">${remaining && !review.single ? '先休息一下' : '收好，回去啦'}</button>
        </div>
      </div>
    `;
  }

  async function handleReviewClick(event) {
    const button = event.target.closest('[data-review-action]');
    if (!button) return;
    const action = button.dataset.reviewAction;

    if (action === 'reveal') {
      if (review.busy || review.revealed) return;
      freezeQuestionTimer();
      review.revealed = true;
      renderReview();
      return;
    }

    if (action === 'correct' || action === 'stuck' || action === 'blank') {
      await recordReviewResult(action);
      return;
    }

    if (action === 'restart') {
      const due = getDueRecords();
      if (!due.length) {
        showToast('今天已经没有到期错题了。');
        return;
      }
      review.queue = due;
      review.index = 0;
      review.revealed = false;
      review.busy = false;
      review.single = false;
      review.correct = 0;
      review.stuck = 0;
      review.blank = 0;
      renderReview();
      startQuestionTimer();
      return;
    }

    if (action === 'close') {
      els.reviewDialog.close();
    }
  }

  async function recordReviewResult(result) {
    if (review.busy || !review.revealed) return;
    const record = review.queue[review.index];
    const fresh = record ? records.find((item) => item.id === record.id) : null;
    if (!fresh) return;

    review.busy = true;
    $$('.review-result-actions button', els.reviewContent).forEach((button) => {
      button.disabled = true;
    });

    const previousLevel = fresh.masteryLevel;
    let nextLevel;
    let nextDue = null;
    if (result === 'correct') {
      nextLevel = Math.min(5, previousLevel + 1);
      nextDue = nextLevel >= 5 ? null : addDaysKey(todayKey(), MASTERY_LEVELS[nextLevel].interval);
    } else if (result === 'stuck') {
      nextLevel = Math.max(0, previousLevel - 1);
      nextDue = addDaysKey(todayKey(), 1);
    } else {
      nextLevel = 0;
      nextDue = addDaysKey(todayKey(), 1);
    }

    const attempt = {
      at: Date.now(),
      result,
      duration: Math.max(0, review.elapsed),
      previousLevel,
      nextLevel
    };

    const next = records.map((item) =>
      item.id === fresh.id
        ? {
            ...item,
            masteryLevel: nextLevel,
            dueDate: nextDue,
            reviewCount: item.reviewCount + 1,
            correctCount: item.correctCount + (result === 'correct' ? 1 : 0),
            wrongCount: item.wrongCount + (result === 'correct' ? 0 : 1),
            lastReviewedAt: attempt.at,
            attempts: item.attempts.concat(attempt).slice(-40),
            updatedAt: attempt.at
          }
        : item
    );

    const commitResult = await commit(next);
    review.busy = false;
    if (!commitResult.ok) {
      $$('.review-result-actions button', els.reviewContent).forEach((button) => {
        button.disabled = false;
      });
      return;
    }

    if (result === 'correct') review.correct += 1;
    else if (result === 'stuck') review.stuck += 1;
    else review.blank += 1;

    review.index += 1;
    review.revealed = false;
    review.elapsed = 0;
    review.startedAt = 0;

    if (review.index >= review.queue.length) {
      renderReviewComplete();
    } else {
      renderReview();
      startQuestionTimer();
      window.requestAnimationFrame(() => els.reviewContent.focus({ preventScroll: true }));
    }
  }

  /* =========================================================
     学习看板
     ========================================================= */

  function openDashboard() {
    renderDashboard();
    els.dashboardDialog.showModal();
    window.requestAnimationFrame(() => els.dashboardContent.focus({ preventScroll: true }));
  }

  function renderDashboard() {
    if (!records.length) {
      els.dashboardContent.innerHTML = `
        <div class="dashboard-empty">
          <div class="complete-seal"><svg><use href="#i-chart"></use></svg></div>
          <h3>还没有足够的数据</h3>
          <p>先记录几道错题，看板会告诉你哪个章节最该补、哪种错因出现得最多。</p>
          <button class="btn btn-primary" type="button" data-dash-action="add">
            <svg><use href="#i-plus"></use></svg>记第一道错题
          </button>
        </div>
      `;
      return;
    }

    const total = records.length;
    const due = getDueRecords();
    const overdue = due.filter((record) => record.dueDate < todayKey()).length;
    const mastered = records.filter(isMastered).length;
    const learning = total - mastered;
    const dueIds = new Set(due.map((record) => record.id));
    const unmastered = records.filter((record) => !isMastered(record));

    const weakMap = new Map();
    unmastered.forEach((record) => {
      const chapter = record.chapter || record.topic || '未分类';
      const key = `${record.subject}|${record.module}|${chapter}`;
      if (!weakMap.has(key)) {
        weakMap.set(key, {
          subject: record.subject,
          module: record.module,
          chapter,
          count: 0
        });
      }
      weakMap.get(key).count += 1;
    });
    const weak = Array.from(weakMap.values())
      .sort((left, right) => right.count - left.count)
      .slice(0, 5);
    const maxWeak = weak.length ? Math.max(2, weak[0].count) : 1;

    const causeMap = new Map();
    unmastered.forEach((record) => {
      record.causes.forEach((cause) => {
        causeMap.set(cause, (causeMap.get(cause) || 0) + 1);
      });
    });
    const causes = Array.from(causeMap.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 6);
    const maxCause = causes.length ? Math.max(2, causes[0][1]) : 1;

    const days = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = toDateKey(date);
      const added = records.filter((record) => record.date === key).length;
      const reviewed = records.reduce((sum, record) => {
        return sum + record.attempts.filter((attempt) => toDateKey(new Date(attempt.at)) === key).length;
      }, 0);
      days.push({ key, added, reviewed, label: WEEKDAY_SHORT[date.getDay()] });
    }
    const maxActivity = Math.max(1, ...days.map((day) => Math.max(day.added, day.reviewed)));

    els.dashboardContent.innerHTML = `
      <div class="dash-hero ${due.length ? 'has-due' : ''}">
        <div class="dash-hero-copy">
          <p class="dash-kicker"><svg><use href="#i-clock"></use></svg>今日复习</p>
          <p class="dash-big"><strong>${due.length}</strong><span>道到期</span></p>
          <p>${due.length ? (overdue ? `其中 ${overdue} 道已逾期。先处理最旧的，再补新错题。` : '都在今天到期，先挑最不熟的一道开始。') : '今天没有到期错题，可以提前重做，或者整理今天的新错题。'}</p>
        </div>
        <div class="dash-hero-actions">
          <button class="btn btn-primary" type="button" data-dash-action="review" ${due.length ? '' : 'disabled'}>
            <svg><use href="#i-play"></use></svg>开始重做
          </button>
          <button class="btn btn-ghost" type="button" data-dash-action="all">查看全部</button>
        </div>
      </div>

      <div class="dash-overview">
        <div class="dash-mini">
          <span>总错题</span>
          <strong>${total}</strong>
          <small>${new Set(records.map((record) => record.subject)).size} 个学科</small>
        </div>
        <div class="dash-mini">
          <span>复习中</span>
          <strong>${learning}</strong>
          <small>还没稳的题</small>
        </div>
        <div class="dash-mini">
          <span>已稳了</span>
          <strong>${mastered}</strong>
          <small>掌握率 ${total ? Math.round((mastered / total) * 100) : 0}%</small>
        </div>
        <div class="dash-mini">
          <span>今日新增</span>
          <strong>${records.filter((record) => record.date === todayKey()).length}</strong>
          <small>道错题</small>
        </div>
      </div>

      <div class="dash-grid">
        <section class="dash-panel dash-panel-wide">
          <header class="dash-panel-head">
            <div><h3>薄弱章节</h3><p>按未掌握错题数量排序</p></div>
            <svg class="dash-panel-icon"><use href="#i-layers"></use></svg>
          </header>
          ${
            weak.length
              ? `<div class="weak-list">${weak
                  .map(
                    (item) => `
                      <div class="weak-row">
                        <div class="weak-copy">
                          <span>${escapeHtml(item.subject)} · ${escapeHtml(item.module)}</span>
                          <strong>${escapeHtml(item.chapter)}</strong>
                        </div>
                        <div class="weak-bar"><i style="width:${Math.max(8, Math.round((item.count / maxWeak) * 100))}%"></i></div>
                        <em>${item.count}</em>
                      </div>
                    `
                  )
                  .join('')}</div>`
              : '<p class="dash-empty-text">还没有未掌握的错题，保持住。</p>'
          }
        </section>

        <section class="dash-panel">
          <header class="dash-panel-head">
            <div><h3>错因分布</h3><p>未掌握错题的标签</p></div>
            <svg class="dash-panel-icon"><use href="#i-target"></use></svg>
          </header>
          ${
            causes.length
              ? `<div class="cause-list">${causes
                  .map(
                    ([cause, count]) => `
                      <div class="cause-row">
                        <span>${escapeHtml(cause)}</span>
                        <div class="cause-bar"><i style="width:${Math.round((count / maxCause) * 100)}%"></i></div>
                        <em>${count}</em>
                      </div>
                    `
                  )
                  .join('')}</div>`
              : '<p class="dash-empty-text">还没有给未掌握错题打错因标签。</p>'
          }
        </section>

        <section class="dash-panel dash-panel-wide">
          <header class="dash-panel-head">
            <div><h3>近 7 天学习活动</h3><p>新增错题与重做次数</p></div>
            <div class="dash-legend"><span class="is-new">新增</span><span class="is-review">重做</span></div>
          </header>
          <div class="week-activity">
            ${days
              .map(
                (day) => `
                  <div class="week-col ${day.key === todayKey() ? 'is-today' : ''}">
                    <div class="week-bars">
                      <i class="week-bar is-new" style="height:${day.added ? Math.max(4, Math.round((day.added / maxActivity) * 100)) : 0}%" title="新增 ${day.added} 道"></i>
                      <i class="week-bar is-review" style="height:${day.reviewed ? Math.max(4, Math.round((day.reviewed / maxActivity) * 100)) : 0}%" title="重做 ${day.reviewed} 次"></i>
                    </div>
                    <span>${day.label}</span>
                    <em>${parseDateKey(day.key).getDate()}</em>
                  </div>
                `
              )
              .join('')}
          </div>
        </section>

        <section class="dash-panel">
          <header class="dash-panel-head">
            <div><h3>今天先做</h3><p>到期队列的前几道</p></div>
            <svg class="dash-panel-icon"><use href="#i-flag"></use></svg>
          </header>
          ${
            due.length
              ? `<div class="due-mini-list">${due
                  .slice(0, 4)
                  .map(
                    (record) => `
                      <button class="due-mini-row" type="button" data-dash-record="${escapeAttribute(record.id)}">
                        <span class="due-mini-subject" style="--subject:${getSubjectMeta(record.subject).color};--subject-soft:${getSubjectMeta(record.subject).soft}">${escapeHtml(record.subject)}</span>
                        <span class="due-mini-title">${escapeHtml(record.chapter || record.topic || record.question)}</span>
                        <em>${escapeHtml(getDueText(record).text)}</em>
                      </button>
                    `
                  )
                  .join('')}</div>`
              : '<p class="dash-empty-text">今天没有到期错题。</p>'
          }
        </section>
      </div>
    `;
  }

  function handleDashboardClick(event) {
    const recordButton = event.target.closest('[data-dash-record]');
    if (recordButton) {
      const id = recordButton.dataset.dashRecord;
      els.dashboardDialog.close();
      window.setTimeout(() => startSingleRework(id), 80);
      return;
    }

    const actionButton = event.target.closest('[data-dash-action]');
    if (!actionButton) return;
    const action = actionButton.dataset.dashAction;
    if (action === 'review') {
      if (!getDueRecords().length) return;
      els.dashboardDialog.close();
      window.setTimeout(startReview, 80);
    } else if (action === 'all') {
      els.dashboardDialog.close();
      clearAllFilters();
    } else if (action === 'add') {
      els.dashboardDialog.close();
      window.setTimeout(() => openRecordDialog(), 80);
    }
  }

  /* =========================================================
     导入导出
     ========================================================= */

  function exportBackup() {
    if (!records.length) {
      showToast('还没有错题可以导出。');
      return;
    }

    const payload = {
      app: '错题手账',
      version: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      records
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `错题手账-备份-${todayKey()}.json`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast('备份已导出');
  }

  async function importBackup(file) {
    if (!file) return;
    try {
      const text = await file.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        throw new Error('JSON 格式不正确');
      }

      const rawList = Array.isArray(data) ? data : data && data.records;
      if (!Array.isArray(rawList) || !rawList.length) {
        throw new Error('没有找到错题数据');
      }

      const imported = sanitizeMany(rawList);
      if (!imported.length) throw new Error('没有可用的错题');

      if (records.length) {
        const confirmed = await askConfirm({
          title: '导入并覆盖当前错题？',
          message: `备份里有 ${imported.length} 道错题，当前有 ${records.length} 道。\n导入后会覆盖当前内容，建议先导出一份备份。`,
          confirmText: '导入并覆盖'
        });
        if (!confirmed) return;
      }

      state.view = 'all';
      state.subject = 'all';
      state.module = 'all';
      state.stage = 'all';
      state.search = '';
      state.expanded.clear();
      const result = await commit(imported);
      if (result.ok) showToast(`已导入 ${imported.length} 道错题`);
    } catch (error) {
      console.error(error);
      showToast(error && error.message ? `导入失败：${error.message}` : '导入失败，请检查备份文件。', {
        type: 'error',
        duration: 5000
      });
    } finally {
      els.importFile.value = '';
    }
  }

  /* =========================================================
     确认框、提示、图片查看
     ========================================================= */

  function askConfirm({ title, message, confirmText = '确认' }) {
    if (els.confirmDialog.open) return Promise.resolve(false);
    els.confirmTitle.textContent = title || '确认操作';
    els.confirmMessage.textContent = message || '';
    els.confirmOk.textContent = confirmText;
    els.confirmDialog.showModal();
    return new Promise((resolve) => {
      confirmResolver = resolve;
    });
  }

  function settleConfirm(value) {
    if (!confirmResolver) return;
    const resolve = confirmResolver;
    confirmResolver = null;
    els.confirmDialog.close();
    resolve(value);
  }

  function showToast(message, options = {}) {
    window.clearTimeout(toastTimer);
    window.clearTimeout(toastHideTimer);
    toastToken += 1;
    const token = toastToken;

    els.toast.className = `toast${options.type === 'error' ? ' is-error' : ''}`;
    els.toast.replaceChildren();

    const messageEl = document.createElement('span');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;
    els.toast.appendChild(messageEl);

    if (options.actionText && typeof options.onAction === 'function') {
      const action = document.createElement('button');
      action.type = 'button';
      action.className = 'toast-action';
      action.textContent = options.actionText;
      action.addEventListener('click', () => {
        hideToast();
        options.onAction();
      });
      els.toast.appendChild(action);
    }

    els.toast.hidden = false;
    window.requestAnimationFrame(() => {
      if (token === toastToken) els.toast.classList.add('is-visible');
    });

    toastTimer = window.setTimeout(hideToast, options.duration || 3600);
  }

  function hideToast() {
    window.clearTimeout(toastTimer);
    window.clearTimeout(toastHideTimer);
    toastToken += 1;
    const token = toastToken;
    els.toast.classList.remove('is-visible');
    toastHideTimer = window.setTimeout(() => {
      if (token === toastToken) els.toast.hidden = true;
    }, 280);
  }

  function openLightbox(source) {
    if (!source) return;
    els.lightboxImage.src = source;
    els.lightboxImage.alt = '题目图片';
    els.imageDialog.showModal();
  }

  /* =========================================================
     示例数据
     ========================================================= */

  function buildSampleRecords() {
    const now = Date.now();
    const olderTimestamp = (daysAgo, hour, minute) => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(hour, minute, 0, 0);
      return date.getTime();
    };

    return [
      {
        id: 'sample_math_derivative',
        date: todayKey(),
        subject: '数学一',
        module: '高等数学',
        chapter: '中值定理',
        topic: '闭区间最值',
        stage: '基础',
        sourceType: '课程例题',
        sourceDetail: '高数基础 · 第3章',
        question: '已知函数 f(x) = x³ − 3x² + 2，求 f(x) 在区间 [0, 4] 上的最大值和最小值。',
        myAnswer: '求导得 f′(x) = 3x² − 6x，令 f′(x) = 0，得到 x = 0 或 x = 2。代入后 f(0) = 2，f(2) = −2，所以最大值是 2，最小值是 −2。',
        correctAnswer: '闭区间上还要比较端点：f(0) = 2，f(2) = −2，f(4) = 18。所以最大值为 18（x = 4），最小值为 −2（x = 2）。',
        reason: '只检查了导数为零的点，漏掉了区间端点 x = 4。求闭区间最值时，候选点要包括驻点和两个端点，最后再比较。',
        knowledgeAnalysis: '核心是“闭区间最值”的完整流程：先求导找驻点，再把驻点和两个端点一起代入比较。看到“闭区间”三个字，就要条件反射检查端点。',
        causes: ['方法不会', '步骤跳步'],
        tags: ['导数', '闭区间最值'],
        images: [],
        masteryLevel: 0,
        dueDate: todayKey(),
        reviewCount: 1,
        correctCount: 0,
        wrongCount: 1,
        lastReviewedAt: olderTimestamp(1, 20, 15),
        attempts: [{ at: olderTimestamp(1, 20, 15), result: 'stuck', duration: 184, previousLevel: 0, nextLevel: 0 }],
        createdAt: now - 32 * 60 * 1000,
        updatedAt: now - 32 * 60 * 1000
      },
      {
        id: 'sample_english_inversion',
        date: offsetDateKey(-1),
        subject: '英语一',
        module: '语法与长难句',
        chapter: '倒装与强调',
        topic: 'hardly...when 倒装',
        stage: '基础',
        sourceType: '课程例题',
        sourceDetail: '语法基础 · 例2',
        question: 'Hardly ______ the classroom when the bell rang.\nA. he had entered\nB. had he entered\nC. he entered\nD. did he enter',
        myAnswer: 'A. he had entered',
        correctAnswer: 'B. had he entered',
        reason: 'hardly / scarcely / no sooner 放在句首时，主句要用部分倒装，把助动词提前。当时只注意到时态，没有识别出倒装结构。',
        knowledgeAnalysis: '这是“倒装 + 过去完成时”的组合：hardly 放句首，主句部分倒装，助动词 had 提到主语前；when 从句用一般过去时。先识别句型，再判断时态。',
        causes: ['长难句', '审题不清'],
        tags: ['倒装句', '过去完成时'],
        images: [],
        masteryLevel: 1,
        dueDate: todayKey(),
        reviewCount: 1,
        correctCount: 1,
        wrongCount: 0,
        lastReviewedAt: olderTimestamp(1, 19, 42),
        attempts: [{ at: olderTimestamp(1, 19, 42), result: 'correct', duration: 95, previousLevel: 0, nextLevel: 1 }],
        createdAt: olderTimestamp(1, 19, 42),
        updatedAt: olderTimestamp(1, 19, 42)
      },
      {
        id: 'sample_control_overshoot',
        date: offsetDateKey(-3),
        subject: '控制基础',
        module: '时域分析',
        chapter: '二阶系统',
        topic: '超调量计算',
        stage: '基础',
        sourceType: '课程例题',
        sourceDetail: '起点控制基础 · 第3讲',
        question: '单位反馈系统的开环传递函数为 G(s) = 16 / [s(s + 4)]。求单位阶跃响应的最大超调量。',
        myAnswer: '系统是二阶系统，阻尼比 ζ = 0.25，所以超调量约为 44%。',
        correctAnswer: '闭环传递函数为 16 / (s² + 4s + 16)，因此 ωn = 4，2ζωn = 4，ζ = 0.5。超调量 σ% = e^(−πζ / √(1−ζ²)) × 100% ≈ 16.3%。',
        reason: '把 2ζωn 直接看成了 ζωn，导致阻尼比算成 0.25。先写标准形式，再对照系数，能避免这类错误。',
        knowledgeAnalysis: '二阶系统标准形式是 ωn² / (s² + 2ζωn s + ωn²)。先从分母对照出 ωn 和 2ζωn，再算 ζ，最后代入超调量公式。所有公式都建立在标准形式上。',
        causes: ['公式记错', '计算失误'],
        tags: ['二阶系统', '超调量'],
        images: [],
        masteryLevel: 2,
        dueDate: offsetDateKey(-1),
        reviewCount: 2,
        correctCount: 1,
        wrongCount: 1,
        lastReviewedAt: olderTimestamp(2, 21, 5),
        attempts: [
          { at: olderTimestamp(3, 21, 5), result: 'stuck', duration: 240, previousLevel: 1, nextLevel: 0 },
          { at: olderTimestamp(2, 21, 5), result: 'correct', duration: 140, previousLevel: 1, nextLevel: 2 }
        ],
        createdAt: olderTimestamp(3, 21, 5),
        updatedAt: olderTimestamp(2, 21, 5)
      },
      {
        id: 'sample_control_first_order',
        date: offsetDateKey(-5),
        subject: '控制基础',
        module: '时域分析',
        chapter: '一阶系统',
        topic: '调节时间',
        stage: '基础',
        sourceType: '课后题',
        sourceDetail: '课后题 3-2',
        question: '一阶系统 G(s) = 1 / (Ts + 1) 在单位阶跃输入下，5% 误差带的调节时间约为多少？',
        myAnswer: '调节时间约为 4T。',
        correctAnswer: '一阶系统单位阶跃响应为 1 − e^(−t/T)。进入 5% 误差带时 e^(−t/T) = 0.05，解得 ts ≈ 3T。',
        reason: '把 2% 误差带的 4T 和 5% 误差带的 3T 记混了。记结论时要把误差带一起记。',
        knowledgeAnalysis: '一阶系统单位阶跃响应是 1 − e^(−t/T)。调节时间取决于允许的误差带：5% 时 ts≈3T，2% 时 ts≈4T。记结论时必须把误差带和系数绑定。',
        causes: ['记忆模糊'],
        tags: ['一阶系统', '调节时间'],
        images: [],
        masteryLevel: 5,
        dueDate: null,
        reviewCount: 4,
        correctCount: 4,
        wrongCount: 1,
        lastReviewedAt: olderTimestamp(1, 20, 30),
        attempts: [
          { at: olderTimestamp(5, 20, 30), result: 'correct', duration: 90, previousLevel: 0, nextLevel: 1 },
          { at: olderTimestamp(3, 20, 30), result: 'correct', duration: 70, previousLevel: 1, nextLevel: 2 },
          { at: olderTimestamp(2, 20, 30), result: 'correct', duration: 60, previousLevel: 2, nextLevel: 3 },
          { at: olderTimestamp(1, 20, 30), result: 'correct', duration: 52, previousLevel: 3, nextLevel: 4 }
        ],
        createdAt: olderTimestamp(5, 20, 30),
        updatedAt: olderTimestamp(1, 20, 30)
      }
    ];
  }

  async function loadSamples() {
    if (records.length) return;
    const result = await commit(buildSampleRecords());
    if (!result.ok) return;
    state.view = 'all';
    state.subject = 'all';
    state.module = 'all';
    state.stage = 'all';
    state.search = '';
    render();
    showToast('已载入 4 道考研示例错题，可以随时编辑或删除。');
  }

  /* =========================================================
     事件绑定
     ========================================================= */

  function bindEvents() {
    els.menuBtn.addEventListener('click', () => {
      if (els.sidebar.classList.contains('is-open')) closeSidebar();
      else openSidebar();
    });
    els.sidebarBackdrop.addEventListener('click', closeSidebar);

    $$('.nav-item[data-view]').forEach((button) => {
      button.addEventListener('click', () => setView(button.dataset.view));
    });

    els.resetSubject.addEventListener('click', () => setSubject('all'));

    els.subjectList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-subject]');
      if (!button) return;
      setSubject(state.subject === button.dataset.subject ? 'all' : button.dataset.subject);
    });

    els.subjectFilter.addEventListener('change', () => setSubject(els.subjectFilter.value));
    els.moduleFilter.addEventListener('change', () => {
      state.module = els.moduleFilter.value;
      render();
    });
    els.stageFilter.addEventListener('change', () => {
      state.stage = els.stageFilter.value;
      render();
    });

    els.sortOrder.addEventListener('change', () => {
      state.sort = els.sortOrder.value;
      render();
    });

    els.searchInput.addEventListener('input', () => {
      state.search = els.searchInput.value;
      els.clearFilters.hidden = !(
        state.search.trim() ||
        state.subject !== 'all' ||
        state.module !== 'all' ||
        state.stage !== 'all'
      );
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(render, 80);
    });

    els.clearFilters.addEventListener('click', clearAllFilters);

    els.addBtn.addEventListener('click', () => openRecordDialog());
    els.reviewBtn.addEventListener('click', startReview);
    els.dashboardBtn.addEventListener('click', openDashboard);

    els.exportBtn.addEventListener('click', exportBackup);
    els.importBtn.addEventListener('click', () => els.importFile.click());
    els.importFile.addEventListener('change', () => {
      const file = els.importFile.files && els.importFile.files[0];
      if (file) importBackup(file);
    });

    els.recordList.addEventListener('click', handleRecordListClick);

    els.emptyActions.addEventListener('click', (event) => {
      const button = event.target.closest('[data-empty-action]');
      if (!button) return;
      const action = button.dataset.emptyAction;
      if (action === 'add') {
        openRecordDialog();
      } else if (action === 'sample') {
        loadSamples();
      } else if (action === 'clear') {
        clearAllFilters();
      } else if (action === 'view-all') {
        setView('all');
      } else if (action === 'view-due') {
        setView('due');
      }
    });

    els.closeRecordBtn.addEventListener('click', closeRecordDialog);
    els.cancelRecordBtn.addEventListener('click', closeRecordDialog);
    els.recordForm.addEventListener('submit', saveRecord);
    els.fQuestion.addEventListener('input', () => {
      if (els.fQuestion.value.trim()) els.fQuestion.setCustomValidity('');
    });

    els.subjectChoices.addEventListener('click', (event) => {
      const button = event.target.closest('[data-subject]');
      if (!button) return;
      setSelectedSubject(button.dataset.subject, { resetClassification: true });
    });

    els.stageChoices.addEventListener('click', (event) => {
      const button = event.target.closest('[data-stage]');
      if (!button) return;
      setSelectedStage(button.dataset.stage);
    });

    els.fModule.addEventListener('input', updateChapterDatalist);
    els.fMastered.addEventListener('change', () => updateStageNote());

    els.causeChips.addEventListener('click', (event) => {
      const button = event.target.closest('[data-cause]');
      if (!button) return;
      const cause = button.dataset.cause;
      if (draftCauses.has(cause)) draftCauses.delete(cause);
      else if (draftCauses.size < 5) draftCauses.add(cause);
      else showToast('最多选择 5 个错因标签。');
      renderCauseChips();
    });

    els.dropzone.addEventListener('click', () => {
      if (draftImages.length >= MAX_IMAGES) {
        showToast(`每道错题最多保存 ${MAX_IMAGES} 张图片。`);
        return;
      }
      els.imageInput.click();
    });
    els.imageInput.addEventListener('change', () => addImages(els.imageInput.files));

    els.imagePreview.addEventListener('click', (event) => {
      const button = event.target.closest('[data-image-index]');
      if (!button) return;
      const index = Number(button.dataset.imageIndex);
      draftImages.splice(index, 1);
      renderImagePreviews();
    });

    ['dragenter', 'dragover'].forEach((eventName) => {
      els.dropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        if (draftImages.length < MAX_IMAGES) els.dropzone.classList.add('is-dragover');
      });
    });
    ['dragleave', 'drop'].forEach((eventName) => {
      els.dropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        els.dropzone.classList.remove('is-dragover');
      });
    });
    els.dropzone.addEventListener('drop', (event) => {
      if (event.dataTransfer && event.dataTransfer.files.length) {
        addImages(event.dataTransfer.files);
      }
    });

    els.recordDialog.addEventListener('paste', (event) => {
      if (!els.recordDialog.open || !event.clipboardData) return;
      const files = Array.from(event.clipboardData.items)
        .filter((item) => item.type.startsWith('image/'))
        .map((item) => item.getAsFile())
        .filter(Boolean);
      if (files.length) {
        event.preventDefault();
        addImages(files);
      }
    });

    els.recordDialog.addEventListener('close', () => {
      editingId = null;
      draftImages = [];
      draftCauses.clear();
      savingRecord = false;
      els.saveRecordBtn.disabled = false;
      els.imageInput.value = '';
    });

    els.recordDialog.addEventListener('click', (event) => {
      if (event.target === els.recordDialog) closeRecordDialog();
    });

    els.closeReviewBtn.addEventListener('click', () => els.reviewDialog.close());
    els.reviewContent.addEventListener('click', handleReviewClick);
    els.reviewDialog.addEventListener('click', (event) => {
      if (event.target === els.reviewDialog) els.reviewDialog.close();
    });
    els.reviewDialog.addEventListener('close', () => {
      stopQuestionTimer();
      review.revealed = false;
      review.busy = false;
      review.startedAt = 0;
      review.elapsed = 0;
    });

    els.reviewDialog.addEventListener('keydown', (event) => {
      if (event.target.closest('button, a, input, textarea, select')) return;
      if (event.key === ' ' && !review.revealed && review.index < review.queue.length) {
        event.preventDefault();
        freezeQuestionTimer();
        review.revealed = true;
        renderReview();
      } else if (review.revealed && ['1', '2', '3'].includes(event.key)) {
        event.preventDefault();
        const result = event.key === '1' ? 'correct' : event.key === '2' ? 'stuck' : 'blank';
        recordReviewResult(result);
      }
    });

    els.closeDashboardBtn.addEventListener('click', () => els.dashboardDialog.close());
    els.dashboardContent.addEventListener('click', handleDashboardClick);
    els.dashboardDialog.addEventListener('click', (event) => {
      if (event.target === els.dashboardDialog) els.dashboardDialog.close();
    });

    els.confirmCancel.addEventListener('click', () => settleConfirm(false));
    els.confirmOk.addEventListener('click', () => settleConfirm(true));
    els.confirmDialog.addEventListener('close', () => {
      if (confirmResolver) {
        const resolve = confirmResolver;
        confirmResolver = null;
        resolve(false);
      }
    });
    els.confirmDialog.addEventListener('click', (event) => {
      if (event.target === els.confirmDialog) settleConfirm(false);
    });

    els.closeImageBtn.addEventListener('click', () => els.imageDialog.close());
    els.imageDialog.addEventListener('click', (event) => {
      if (event.target === els.imageDialog) els.imageDialog.close();
    });
    els.imageDialog.addEventListener('close', () => {
      els.lightboxImage.removeAttribute('src');
    });

    if (els.dismissIosInstall) {
      els.dismissIosInstall.addEventListener('click', () => {
        els.iosInstallHint.hidden = true;
        try {
          localStorage.setItem('cuotiben.iosInstallDismissed', '1');
        } catch (error) {
          /* 无法记录关闭状态时忽略 */
        }
      });
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeSidebar();
    });

    document.addEventListener('keydown', (event) => {
      const openDialog = document.querySelector('dialog[open]');
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      const typing =
        /^(INPUT|TEXTAREA|SELECT)$/.test(activeTag) ||
        (document.activeElement && document.activeElement.isContentEditable);

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        if (openDialog) return;
        event.preventDefault();
        closeSidebar();
        els.searchInput.focus();
        els.searchInput.select();
        return;
      }

      if (event.key === 'Escape' && els.sidebar.classList.contains('is-open')) {
        closeSidebar();
        return;
      }

      if (openDialog || typing) return;
      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault();
        closeSidebar();
        openRecordDialog();
      } else if (event.key === '/') {
        event.preventDefault();
        els.searchInput.focus();
        els.searchInput.select();
      }
    });
  }

  init().catch((error) => {
    console.error(error);
    render();
    document.body.dataset.appReady = 'true';
    showToast('页面初始化失败，请刷新后再试。', { type: 'error', duration: 6000 });
  });
})();
