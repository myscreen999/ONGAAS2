import React, { useEffect, useState } from 'react';
import { FileText, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { Claim } from '../../hooks/useAuth';

const Claims: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAllClaims } = useAuth();

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const claimsData = getAllClaims();
      // Show only the latest 5 claims for homepage
      setClaims(claimsData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'submitted': 'مُقدمة',
      'under_review': 'قيد المراجعة',
      'processing': 'قيد المعالجة',
      'completed': 'مكتملة',
      'rejected': 'مرفوضة'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'submitted': 'text-blue-600 bg-blue-100',
      'under_review': 'text-yellow-600 bg-yellow-100',
      'processing': 'text-purple-600 bg-purple-100',
      'completed': 'text-green-600 bg-green-100',
      'rejected': 'text-red-600 bg-red-100'
    };
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جارٍ تحميل المطالبات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">تتبع المطالبات</h2>
          <p className="text-lg text-gray-600">آخر المطالبات المقدمة وحالة تقدمها</p>
        </div>

        {claims.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد مطالبات حالياً</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {claims.map((claim) => (
              <div key={claim.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-blue-600 bg-blue-100 rounded-full p-1 ml-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{claim.claim_number}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 ml-1" />
                        تاريخ التقديم: {new Date(claim.created_at).toLocaleDateString('ar-EG')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                      {getStatusText(claim.status)}
                    </span>
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4 ml-1" />
                      {claim.progress}%
                    </div>
                  </div>
                </div>

                {/* Claim Description */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">وصف الحادث:</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded border text-sm">{claim.description}</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">تقدم المعالجة</span>
                    <span className="text-sm text-gray-600">{claim.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${claim.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between text-xs text-gray-500">
                  <span className={claim.progress >= 25 ? 'text-blue-600 font-medium' : ''}>مُقدمة</span>
                  <span className={claim.progress >= 50 ? 'text-blue-600 font-medium' : ''}>قيد المراجعة</span>
                  <span className={claim.progress >= 75 ? 'text-blue-600 font-medium' : ''}>قيد المعالجة</span>
                  <span className={claim.progress >= 100 ? 'text-green-600 font-medium' : ''}>مكتملة</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Claims;