import React from 'react';
import { Shield, Users, TrendingUp, Award, ArrowDown, Sparkles, CheckCircle } from 'lucide-react';

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
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden min-h-screen flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black opacity-30"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-scale">
            <div className="glass-effect rounded-full p-8 shadow-2xl">
              <img 
                src="https://i.postimg.cc/nzFw0fRf/5.png" 
                alt="ONG A.A.S" 
                className="h-24 w-auto"
                onError={(e) => {
                  console.log('Logo failed to load');
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
            <span className="block bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              ONG A.A.S
            </span>
            <span className="block text-blue-200 text-2xl md:text-4xl font-normal mt-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
              جمعية مدنية للتوعية التأمينية ومواكبة المطالبات
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.4s'}}>
            نحن جمعية مدنية غير ربحية مكرسة لنشر الوعي التأميني وحماية حقوق المؤمنين 
            ومساعدتهم في الحصول على تعويضاتهم المستحقة
          </p>

          {/* Key Features */}
          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-slide-up" style={{animationDelay: '0.6s'}}>
            <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium">مرخصة رسمياً</span>
            </div>
            <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium">خدمات متطورة</span>
            </div>
            <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium">حماية شاملة</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-slide-up" style={{animationDelay: '0.8s'}}>
            <button 
              onClick={handleJoinMembership}
              className="btn-primary text-lg px-10 py-4 shadow-2xl hover:scale-105 transform transition-all duration-300"
            >
              <Users className="w-5 h-5 inline ml-2" />
              انضم لعضويتنا
            </button>
            <button 
              onClick={handleExploreServices}
              className="px-10 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-all duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105 text-lg"
            >
              <ArrowDown className="w-5 h-5 inline ml-2" />
              تعرف على خدماتنا
            </button>
          </div>

          {/* Features Grid */}
          <div id="services" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card-glass p-8 hover:scale-105 transition-all duration-300 animate-slide-up" style={{animationDelay: '1s'}}>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">حماية الحقوق</h3>
              <p className="text-gray-600 leading-relaxed">نحمي حقوق المؤمنين ونساعدهم في الحصول على تعويضاتهم المستحقة بكل شفافية</p>
            </div>
            
            <div className="card-glass p-8 hover:scale-105 transition-all duration-300 animate-slide-up" style={{animationDelay: '1.2s'}}>
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">التوعية المجتمعية</h3>
              <p className="text-gray-600 leading-relaxed">نرفع مستوى الوعي التأميني في المجتمع الموريتاني من خلال برامج تثقيفية متخصصة</p>
            </div>
            
            <div className="card-glass p-8 hover:scale-105 transition-all duration-300 animate-slide-up" style={{animationDelay: '1.4s'}}>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">تحسين الخدمات</h3>
              <p className="text-gray-600 leading-relaxed">ندفع شركات التأمين لتحسين خدماتها وزيادة الشفافية في التعامل مع العملاء</p>
            </div>
            
            <div className="card-glass p-8 hover:scale-105 transition-all duration-300 animate-slide-up" style={{animationDelay: '1.6s'}}>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">الخبرة والمهنية</h3>
              <p className="text-gray-600 leading-relaxed">فريق من الخبراء المتخصصين في مجال التأمين مع سنوات من الخبرة العملية</p>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ArrowDown className="w-6 h-6 text-white opacity-70" />
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};

export default Hero;