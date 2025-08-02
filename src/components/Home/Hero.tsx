import React from 'react';
import { Shield, Users, TrendingUp, Award } from 'lucide-react';

interface HeroProps {
  onShowAuth: (mode?: 'signup') => void;
}

const Hero: React.FC<HeroProps> = ({ onShowAuth }) => {
  const handleJoinMembership = () => {
    onShowAuth('signup');
  };

  const handleExploreServices = () => {
    // Scroll to services section
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-slate-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-white bg-opacity-10 rounded-full p-6 backdrop-blur-sm">
              <img 
                src="https://i.postimg.cc/nzFw0fRf/5.png" 
                alt="ONG A.A.S" 
                className="h-20 w-auto"
              />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="block">ONG A.A.S</span>
            <span className="block text-blue-300 text-2xl md:text-3xl font-normal mt-2">
              جمعية مدنية للتوعية التأمينية ومواكبة المطالبات
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
            نحن جمعية مدنية غير ربحية مكرسة لنشر الوعي التأميني وحماية حقوق المؤمنين 
            ومساعدتهم في الحصول على تعويضاتهم المستحقة
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={handleJoinMembership}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg btn-hover-effect"
            >
              انضم لعضويتنا
            </button>
            <button 
              onClick={handleExploreServices}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors btn-hover-effect"
            >
              تعرف على خدماتنا
            </button>
          </div>

          {/* Features Grid */}
          <div id="services" className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
              <Shield className="w-12 h-12 text-blue-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">حماية الحقوق</h3>
              <p className="text-blue-100 text-sm">نحمي حقوق المؤمنين ونساعدهم في الحصول على تعويضاتهم</p>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
              <Users className="w-12 h-12 text-blue-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">التوعية المجتمعية</h3>
              <p className="text-blue-100 text-sm">نرفع مستوى الوعي التأميني في المجتمع الموريتاني</p>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
              <TrendingUp className="w-12 h-12 text-blue-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">تحسين الخدمات</h3>
              <p className="text-blue-100 text-sm">ندفع شركات التأمين لتحسين خدماتها وزيادة الشفافية</p>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
              <Award className="w-12 h-12 text-blue-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">الخبرة والمهنية</h3>
              <p className="text-blue-100 text-sm">فريق من الخبراء المتخصصين في مجال التأمين</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;