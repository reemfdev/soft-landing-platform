import React, {
  useEffect,
  useState
} from 'react';
import CompanyHeader from "../components/CompanyHeader";
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function CompanyDashboard() {

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [companyStages, setCompanyStages] = useState<any[]>([]);
  const [companyTasks, setCompanyTasks] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("");
  const [showApprovedPopup, setShowApprovedPopup] = useState(false);
  
  // حالة خاصة بالـ Demo لمتابعة أي مرحلة يضغط عليها المستخدم حالياً
  const [selectedDemoStageId, setSelectedDemoStageId] = useState<string>("");

  useEffect(() => {
    const fetchDashboard = async () => {
      // ================= DEMO MOCK DATA =================
      if (user?.isDemo) {
        const demoStages = [
          { id: "stg-1", stage_name: "Initial Review", stage_name_ar: "المراجعة المبدئية", stage_order: 1, status: "COMPLETED" },
          { id: "stg-2", stage_name: "Document Verification", stage_name_ar: "التحقق من الوثائق", stage_order: 2, status: "IN_PROGRESS" },
          { id: "stg-3", stage_name: "Final Approval", stage_name_ar: "الاعتماد النهائي", stage_order: 3, status: "PENDING" }
        ];

        const demoTasks = [
          // مهام المرحلة الأولى
          { id: "tsk-1", company_stage_id: "stg-1", title: "Fill Application Form", title_ar: "تعبئة نموذج الطلب", status: "COMPLETED" },
          { id: "tsk-2", company_stage_id: "stg-1", title: "Identity Verification", title_ar: "التحقق من الهوية", status: "COMPLETED" },
          
          // مهام المرحلة الثانية
          { id: "tsk-3", company_stage_id: "stg-2", title: "Upload Commercial Register", title_ar: "رفع السجل التجاري", status: "COMPLETED" },
          { id: "tsk-4", company_stage_id: "stg-2", title: "Sign Digital Agreement", title_ar: "توقيع الاتفاقية الرقمية", status: "IN_PROGRESS" },
          { id: "tsk-5", company_stage_id: "stg-2", title: "Submit Financial Statements", title_ar: "تقديم القوائم المالية", status: "PENDING" },
          
          // مهام المرحلة الثالثة
          { id: "tsk-6", company_stage_id: "stg-3", title: "Manager Final Review", title_ar: "مراجعة المدير النهائية", status: "PENDING" },
          { id: "tsk-7", company_stage_id: "stg-3", title: "Issue Certificate", title_ar: "إصدار الشهادة الرسمية", status: "PENDING" }
        ];

        setCompanyStages(demoStages);
        setCompanyTasks(demoTasks);
        setProgress(55); // نسبة إنجاز افتراضية للمشروع ككل
        setCurrentStage("Document Verification");
        setSelectedDemoStageId("stg-2"); // اجعل المرحلة الثانية هي النشطة افتراضياً عند الدخول

        if (localStorage.getItem("approval_popup_seen") !== "true") {
          setShowApprovedPopup(true);
        }
        return;
      }
      // ================= END DEMO MOCK DATA =================

      try {
        const token = localStorage.getItem("token");
        const companyId = user?.company_id;

        const companyResponse = await axios.get(
          `http://localhost:3000/companies/${companyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (
          companyResponse.data.status === "APPROVED" &&
          localStorage.getItem("approval_popup_seen") !== "true"
        ) {
          setShowApprovedPopup(true);
        }

        const stagesResponse = await axios.get(
          `http://localhost:3000/companies/${companyId}/stages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCompanyStages(stagesResponse.data.stages);

        const tasksResponse = await axios.get(
          `http://localhost:3000/companies/${companyId}/tasks`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCompanyTasks(tasksResponse.data.tasks);

        const progressResponse = await axios.get(
          `http://localhost:3000/companies/${companyId}/progress`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProgress(progressResponse.data.progress);

        const activeStage = stagesResponse.data.stages.find(
          (stage: any) => stage.status === "IN_PROGRESS"
        );
        if (activeStage) {
          setCurrentStage(activeStage.stage_name);
        }

      } catch (error) {
        console.log(error);
      }
    };

    fetchDashboard();
  }, []);

  // الحسابات والترتيب للمراحل الحقيقية والتجريبية
  const activeStage = [...companyStages]
    .sort((a: any, b: any) => a.stage_order - b.stage_order)
    .find((stage: any) => stage.status === "IN_PROGRESS");

  // الفلترة: لو كنا في الـ Demo نفلتر بناء على الـ Stage التي ضغط عليها العميل، لو حقيقي نفلتر بناء على الـ activeStage الحالية من السيرفر
  const currentStageTasks = companyTasks.filter((task: any) => {
    if (user?.isDemo) {
      return task.company_stage_id === selectedDemoStageId;
    }
    return task.company_stage_id === activeStage?.id;
  });

  return (
    <>
      <CompanyHeader />

      <div className="min-h-screen bg-[#F7F3EE]">
        <div className="p-8">
          
          {/* Progress Card */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#ECE7DD]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-500 text-sm">
                  {t('dashboard.currentStage')}
                </p>
                <h2 className="text-2xl font-bold text-[#1E3A5F] mt-1">
                  {user?.isDemo ? (
                    // في الـ Demo يعرض اسم المرحلة التي يضغط عليها حالياً
                    i18n.language.startsWith("ar")
                      ? companyStages.find((s: any) => s.id === selectedDemoStageId)?.stage_name_ar
                      : companyStages.find((s: any) => s.id === selectedDemoStageId)?.stage_name
                  ) : (
                    // في الوضع الحقيقي يقرأ من السيرفر
                    i18n.language.startsWith("ar")
                      ? (companyStages.find((s: any) => s.stage_name === currentStage)?.stage_name_ar || currentStage)
                      : currentStage
                  )}
                </h2>
              </div>
              <h1 className="text-5xl font-bold text-[#C5A55A]">
                {user?.isDemo ? (
                  // تحديث النسبة وهمياً في الـ Demo لتفاعل أجمل عند التنقل
                  selectedDemoStageId === "stg-1" ? "100%" : selectedDemoStageId === "stg-2" ? "55%" : "0%"
                ) : `${progress}%`}
              </h1>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                style={{ 
                  width: user?.isDemo ? (
                    selectedDemoStageId === "stg-1" ? "100%" : selectedDemoStageId === "stg-2" ? "55%" : "5%"
                  ) : `${progress}%` 
                }}
                className="h-full bg-[#C5A55A] rounded-full transition-all duration-500"
              ></div>
            </div>

            {/* Stages Badges */}
            <div className="flex gap-3 mt-8 flex-wrap">
              {[...companyStages]
                .sort((a: any, b: any) => a.stage_order - b.stage_order)
                .map((stage: any) => (
                  <button
                    key={stage.id}
                    type="button"
                    disabled={!user?.isDemo} // التعطيل فقط للحساب الحقيقي ليعتمد على السيرفر
                    onClick={() => setSelectedDemoStageId(stage.id)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      user?.isDemo && selectedDemoStageId === stage.id
                        ? "ring-2 ring-[#C5A55A] scale-105 shadow-sm" 
                        : ""
                    } ${
                      stage.status === "COMPLETED"
                        ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
                        : stage.status === "IN_PROGRESS"
                        ? "bg-[#FFF7E5] text-[#C5A55A] border border-[#F3D48B] hover:bg-[#ffeec7]"
                        : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {i18n.language.startsWith("ar")
                      ? (stage.stage_name_ar || stage.stage_name)
                      : stage.stage_name}
                    {stage.status === "COMPLETED" && " ✓"}
                  </button>
                ))}
            </div>
            {user?.isDemo && (
              <p className="text-xs text-gray-400 mt-3 italic text-right">
                * يمكنك الضغط على بطاقات المراحل بالأعلى للتنقل بين المهام والنسب المئوية تجريبياً.
              </p>
            )}
          </div>

          {/* Tasks List */}
          <div className="mt-10 space-y-5">
            {currentStageTasks.length === 0 ? (
              <p className="text-center text-gray-400 py-8">لا توجد مهام متوفرة لهذه المرحلة حالياً.</p>
            ) : (
              currentStageTasks.map((task: any) => (
                <div
                  key={task.id}
                  className="bg-white border border-[#ECE7DD] rounded-3xl p-6 flex items-center justify-between shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div>
                    <h3 className="text-[#1E3A5F] text-xl font-bold">
                      {i18n.language.startsWith("ar")
                        ? (task.title_ar || task.title)
                        : task.title}
                    </h3>
                  </div>

                  <div className="flex gap-3">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        task.status === "COMPLETED"
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : task.status === "IN_PROGRESS"
                          ? "bg-[#FFF7E5] text-[#C5A55A] border border-[#F3D48B]"
                          : task.status === "PENDING"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t(`status.${task.status}`)}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (user?.isDemo) {
                          alert("هذه الميزة (عرض تفاصيل المهمة المتقدمة) معطلة في نسخة العرض التجريبي.");
                        } else {
                          navigate(`/company-task/${task.id}`);
                        }
                      }}
                      className="bg-[#C5A55A] text-white px-5 py-2 rounded-xl hover:bg-[#B18F46] transition"
                    >
                      {t("view")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* PopUp Approval */}
      {showApprovedPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              🎉 {t("dashboard.approvedTitle")}
            </h2>
            <p className="text-gray-600 mb-6">
              {t("dashboard.approvedMessage")}
            </p>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("approval_popup_seen", "true");
                setShowApprovedPopup(false);
              }}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
            >
              {t("ok")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}