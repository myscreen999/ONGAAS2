import React from 'react';
import { Phone, MapPin, Calendar, FileText, Target, Users } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="https://i.postimg.cc/nzFw0fRf/5.png" 
                alt="ONG A.A.S" 
                className="h-12 w-auto"
              />
              <div className="ml-3">
                <h3 className="text-lg font-bold">ONG A.A.S</h3>
                <p className="text-sm text-gray-300">جمعية مدنية غير ربحية</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              جمعية مدنية غير ربحية للتوعية التأمينية والدفاع عن حقوق المؤمنين
            </p>
          </div>

          {/* License Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 ml-2" />
              معلومات الترخيص
            </h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p><strong>مرخصة من:</strong> وزارة الداخلية</p>
              <p><strong>رقم الترخيص:</strong> FA010000360307202511232</p>
              <p><strong>تاريخ الترخيص:</strong> 04/07/2025</p>
              <p className="flex items-center">
                <MapPin className="w-4 h-4 ml-1" />
                <strong>المقر:</strong> نواكشوط، موريتانيا
              </p>
            </div>
          </div>

          {/* Goals */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="w-5 h-5 ml-2" />
              أهدافنا
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• نشر الوعي التأميني</li>
              <li>• حماية المؤمنين من الغش والتأخير</li>
              <li>• دعم المتضررين</li>
              <li>• دفع الشركات لتحسين خدماتها</li>
              <li>• تعزيز الشفافية</li>
            </ul>
          </div>

          {/* Contact & Projects */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Phone className="w-5 h-5 ml-2" />
              التواصل والمشاريع
            </h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <p className="font-medium">الهاتف والواتساب:</p>
                <p className="text-blue-400">+222 34 14 14 97</p>
              </div>
              <div>
                <p className="font-medium">العضوية:</p>
                <p>مفتوحة عبر النموذج الإلكتروني</p>
              </div>
              <div>
                <p className="font-medium">المشروع الجاري:</p>
                <p>إطلاق منصة لتسهيل المطالبات</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-right mb-4 md:mb-0">
              <p className="text-lg font-semibold text-blue-400">
                "التأمين وعي... والتعويض حق"
              </p>
              <p className="text-sm text-gray-400 mt-1">شعار ONG A.A.S</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">
                © 2025 ONG A.A.S. جميع الحقوق محفوظة
              </p>
              <p className="text-xs text-gray-500 mt-1">
                جمعية مدنية مرخصة من وزارة الداخلية الموريتانية
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;