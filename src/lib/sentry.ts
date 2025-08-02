import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';

// تهيئة Sentry بدون Replay Integration لتجنب الأخطاء
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN || '', // يمكن تركه فارغ للتطوير
  environment: process.env.NODE_ENV || 'development',
  integrations: [
    new BrowserTracing({
      // تتبع التنقل التلقائي
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      ),
    }),
    // تم إزالة Replay Integration لحل مشكلة "You are using replayIntegration() even though this bundle does not include replay"
  ],
  // معدل أخذ العينات للتتبع (منخفض للتطوير)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0,
  // تعطيل التتبع في بيئة التطوير
  enabled: process.env.NODE_ENV === 'production',
  // تصفية الأخطاء غير المهمة
  beforeSend(event) {
    // تجاهل أخطاء Sentry الداخلية
    if (event.exception?.values?.[0]?.value?.includes('getReplayId is not a function')) {
      return null;
    }
    // تجاهل أخطاء الشبكة العادية
    if (event.exception?.values?.[0]?.value?.includes('Failed to fetch')) {
      return null;
    }
    return event;
  },
});

export default Sentry;