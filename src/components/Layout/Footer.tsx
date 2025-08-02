import React from 'react';
import { Phone, MapPin, Calendar, FileText, Target, Users, Mail, Globe, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-500 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-purple-500 rounded-full opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="animate-slide-up">
            <div className="flex items-center mb-6">
              <img 
                src="https://i.postimg.cc/nzFw0fRf/5.png" 
                alt="ONG A.A.S" 
                className="h-16 w-auto"
              />
              <div className="ml-4">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ONG A.A.S
                </h3>
                <p className="text-sm text-blue-300 font-medium">جمعية مدنية غير ربحية</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              جمعية مدنية غير ربحية للتوعية التأمينية والدفاع عن حقوق المؤمنين
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <a href="#" className="bg-blue-600 p-3 rounded-full hover:bg-blue-700 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="bg-blue-400 p-3 rounded-full hover:bg-blue-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="bg-pink-600 p-3 rounded-full hover:bg-pink-700 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="bg-blue-800 p-3 rounded-full hover:bg-blue-900 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* License Info */}
          <div className="animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h4 className="text-xl font-bold mb-6 flex items-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg ml-3">
                <FileText className="w-5 h-5" />
              </div>
              معلومات الترخيص
            </h4>
            <div className="space-y-4 text-gray-300">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="font-semibold text-white mb-1">مرخصة من:</p>
                <p>وزارة الداخلية</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="font-semibold text-white mb-1">رقم الترخيص:</p>
                <p className="font-mono text-blue-300">FA010000360307202511232</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="font-semibold text-white mb-1">تاريخ الترخيص:</p>
                <p>04/07/2025</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg flex items-center">
                <MapPin className="w-5 h-5 ml-2 text-red-400" />
                <div>
                  <p className="font-semibold text-white">المقر:</p>
                  <p>نواكشوط، موريتانيا</p>
                </div>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="animate-slide-up" style={{animationDelay: '0.4s'}}>
            <h4 className="text-xl font-bold mb-6 flex items-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg ml-3">
                <Target className="w-5 h-5" />
              </div>
              أهدافنا
            </h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center bg-slate-700/30 p-3 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full ml-3"></div>
                نشر الوعي التأميني
              </li>
              <li className="flex items-center bg-slate-700/30 p-3 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full ml-3"></div>
                حماية المؤمنين من الغش والتأخير
              </li>
              <li className="flex items-center bg-slate-700/30 p-3 rounded-lg">
                <div className="w-2 h-2 bg-yellow-400 rounded-full ml-3"></div>
                دعم المتضررين
              </li>
              <li className="flex items-center bg-slate-700/30 p-3 rounded-lg">
                <div className="w-2 h-2 bg-purple-400 rounded-full ml-3"></div>
                دفع الشركات لتحسين خدماتها
              </li>
              <li className="flex items-center bg-slate-700/30 p-3 rounded-lg">
                <div className="w-2 h-2 bg-red-400 rounded-full ml-3"></div>
                تعزيز الشفافية
              </li>
            </ul>
          </div>

          {/* Contact & Projects */}
          <div className="animate-slide-up" style={{animationDelay: '0.6s'}}>
            <h4 className="text-xl font-bold mb-6 flex items-center">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg ml-3">
                <Phone className="w-5 h-5" />
              </div>
              التواصل والمشاريع
            </h4>
            <div className="space-y-4 text-gray-300">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="font-semibold text-white mb-2 flex items-center">
                  <Phone className="w-4 h-4 ml-2 text-green-400" />
                  الهاتف والواتساب:
                </p>
                <p className="text-green-400 font-bold text-lg">+222 34 14 14 97</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="font-semibold text-white mb-2 flex items-center">
                  <Mail className="w-4 h-4 ml-2 text-blue-400" />
                  البريد الإلكتروني:
                </p>
                <p className="text-blue-400">info@ongaas.mr</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="font-semibold text-white mb-2 flex items-center">
                  <Users className="w-4 h-4 ml-2 text-purple-400" />
                  العضوية:
                </p>
                <p>مفتوحة عبر النموذج الإلكتروني</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="font-semibold text-white mb-2 flex items-center">
                  <Globe className="w-4 h-4 ml-2 text-yellow-400" />
                  المشروع الجاري:
                </p>
                <p>إطلاق منصة لتسهيل المطالبات</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-right mb-6 md:mb-0 animate-slide-up" style={{animationDelay: '0.8s'}}>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                "التأمين وعي... والتعويض حق"
              </p>
              <p className="text-gray-400">شعار ONG A.A.S</p>
            </div>
            <div className="text-center md:text-left animate-slide-up" style={{animationDelay: '1s'}}>
              <p className="text-gray-400 mb-2">
                © 2025 ONG A.A.S. جميع الحقوق محفوظة
              </p>
              <p className="text-sm text-gray-500">
                جمعية مدنية مرخصة من وزارة الداخلية الموريتانية
              </p>
            </div>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="text-center animate-slide-up" style={{animationDelay: '1.2s'}}>
            <p className="text-gray-400 mb-4">
              موقع إلكتروني متطور لخدمة المجتمع الموريتاني
            </p>
            <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
              <span>سياسة الخصوصية</span>
              <span>•</span>
              <span>شروط الاستخدام</span>
              <span>•</span>
              <span>اتصل بنا</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;