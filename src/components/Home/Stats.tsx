import React, { useEffect, useState } from 'react';
import { Users, FileText, CheckCircle, TrendingUp, Award, Clock, Star, Target } from 'lucide-react';

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
      value: 2847,
      suffix: '+',
      icon: <Users className="w-8 h-8" />,
      color: 'text-blue-600'
    },
    {
      id: 'claims',
      label: 'مطالبة تم معالجتها',
      value: 1256,
      suffix: '+',
      icon: <FileText className="w-8 h-8" />,
      color: 'text-green-600'
    },
    {
      id: 'success',
      label: 'معدل النجاح',
      value: 96,
      suffix: '%',
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'text-emerald-600'
    },
    {
      id: 'satisfaction',
      label: 'رضا العملاء',
      value: 99,
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
    <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-200 rounded-full opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            إنجازاتنا المتميزة
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            إنجازاتنا في أرقام
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            أرقام تعكس التزامنا بخدمة المجتمع وحماية حقوق المؤمنين في موريتانيا
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="card-modern p-8 text-center group animate-slide-up"
              style={{animationDelay: `${stats.indexOf(stat) * 0.2}s`}}
            >
              <div className={`${stat.color} flex justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-full shadow-lg">
                  {stat.icon}
                </div>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {animatedValues[stat.id] || 0}
                </span>
                <span className={`${stat.color} text-3xl`}>{stat.suffix}</span>
              </div>
              <div className="text-gray-600 font-semibold text-lg">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Additional metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="card-glass p-6 text-center animate-slide-up" style={{animationDelay: '1s'}}>
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-full">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">24/7</div>
            <div className="text-gray-600 font-medium">خدمة العملاء</div>
          </div>
          
          <div className="card-glass p-6 text-center animate-slide-up" style={{animationDelay: '1.2s'}}>
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-green-500 to-teal-500 p-3 rounded-full">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">5+</div>
            <div className="text-gray-600 font-medium">سنوات خبرة</div>
          </div>
          
          <div className="card-glass p-6 text-center animate-slide-up" style={{animationDelay: '1.4s'}}>
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-full">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">100%</div>
            <div className="text-gray-600 font-medium">شفافية</div>
          </div>
        </div>

        {/* Testimonial section */}
        <div className="text-center animate-slide-up" style={{animationDelay: '1.6s'}}>
          <div className="card-glass p-12 max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full">
                <Star className="w-8 h-8 text-white" />
              </div>
            </div>
            <blockquote className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text mb-6">
              "التأمين وعي... والتعويض حق"
            </blockquote>
            <p className="text-xl text-gray-600 mb-6">
              شعارنا الذي يجسد رسالتنا في خدمة المجتمع الموريتاني
            </p>
            <div className="flex justify-center items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">ONG A.A.S</div>
                <div className="text-sm text-gray-600">جمعية مدنية مرخصة</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;