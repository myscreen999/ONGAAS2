import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';

// تهيئة Sentry بدون Replay Integration لتجنب الأخطاء
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || '', // يمكن تركه فارغ للتطوير
  environment: import.meta.env.NODE_ENV || 'development',
  integrations: [
    new BrowserTracing({
      // تتبع التنقل التلقائي - إزالة React Router integration لتجنب الأخطاء
    }),
    // تم إزالة Replay Integration تماماً لحل مشكلة "getReplayId is not a function"
  ],
  // معدل أخذ العينات للتتبع (منخفض للتطوير)
  tracesSampleRate: import.meta.env.NODE_ENV === 'production' ? 0.01 : 0,
  // تعطيل التتبع في بيئة التطوير
  enabled: import.meta.env.NODE_ENV === 'production',
  // تصفية الأخطاء غير المهمة
  beforeSend(event) {
    // تجاهل أخطاء Sentry الداخلية
    if (event.exception?.values?.[0]?.value?.includes('getReplayId is not a function')) {
      return null;
    }
    // تجاهل أخطاء Replay
    if (event.exception?.values?.[0]?.value?.includes('replayIntegration')) {
      return null;
    }
    // تجاهل أخطاء الشبكة العادية
    if (event.exception?.values?.[0]?.value?.includes('Failed to fetch')) {
      return null;
    }
    return event;
  },
  // تعطيل جميع ميزات Replay تماماً
  beforeSendTransaction(event) {
    // إزالة أي معلومات متعلقة بـ Replay
    if (event.contexts?.replay) {
      delete event.contexts.replay;
    }
    return event;
  },
});

export default Sentry;