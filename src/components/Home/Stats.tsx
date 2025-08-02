import React, { useEffect, useState } from 'react';
import { Users, FileText, CheckCircle, TrendingUp } from 'lucide-react';

interface StatItem {
  id: string;
  label: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
  color: string;
}

const Stats: React.FC = () => {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

  const stats: StatItem[] = [
    {
      id: 'members',
      label: 'أعضاء مسجلين',
      value: 1500,
      suffix: '+',
      icon: <Users className="w-8 h-8" />,
      color: 'text-blue-600'
    },
    {
      id: 'claims',
      label: 'مطالبة تم معالجتها',
      value: 450,
      suffix: '+',
      icon: <FileText className="w-8 h-8" />,
      color: 'text-green-600'
    },
    {
      id: 'success',
      label: 'معدل النجاح',
      value: 92,
      suffix: '%',
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'text-emerald-600'
    },
    {
      id: 'satisfaction',
      label: 'رضا العملاء',
      value: 98,
      suffix: '%',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'text-purple-600'
    }
  ];

  useEffect(() => {
    const animateCounters = () => {
      stats.forEach((stat) => {
        let current = 0;
        const increment = stat.value / 100;
        const timer = setInterval(() => {
          current += increment;
          if (current >= stat.value) {
            current = stat.value;
            clearInterval(timer);
          }
          setAnimatedValues(prev => ({
            ...prev,
            [stat.id]: Math.floor(current)
          }));
        }, 20);
      });
    };

    // Start animation after component mounts
    const timeout = setTimeout(animateCounters, 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            إنجازاتنا في أرقام
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            أرقام تعكس التزامنا بخدمة المجتمع وحماية حقوق المؤمنين في موريتانيا
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`${stat.color} flex justify-center mb-4`}>
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {animatedValues[stat.id] || 0}
                <span className={stat.color}>{stat.suffix}</span>
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Quote Section */}
        <div className="text-center mt-16">
          <blockquote className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">
            "التأمين وعي... والتعويض حق"
          </blockquote>
          <p className="text-lg text-gray-600">
            شعارنا الذي يجسد رسالتنا في خدمة المجتمع الموريتاني
          </p>
        </div>
      </div>
    </section>
  );
};

export default Stats;