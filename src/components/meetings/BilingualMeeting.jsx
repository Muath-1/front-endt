import { useState } from 'react';
import ScreenRecorder from './ScreenRecorder';
import { Edit2, Download, Trash2, Copy, X, Plus, FileText } from 'lucide-react';

// Utility Components
const SectionHeader = ({ title, children }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="font-semibold text-lg text-blue-900">{title}</h2>
    {children}
  </div>
);

const ContentBox = ({ children, dir }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:hidden" dir={dir}>
    {children}
  </div>
);

const IconButton = ({ icon, color = 'gray' }) => (
  <button
    className={`text-${color}-500 hover:text-${color === 'gray' ? 'red-500' : color}-700 transition`}
  >
    {icon}
  </button>
);

export default function BilingualMeeting({ meeting, onUpdateMeeting }) {
  const [language, setLanguage] = useState('EN');

  const translations = {
    EN: {
      title: "Q4 Planning Meeting",
      status: "Done",
      date: "March 15, 2025 • 10:00 AM",
      meetingCompleted: "Meeting Completed",
      attendance: "Attendance",
      present: "Present",
      absent: "Absent",
      liveTranscription: "Transcription",
      aiSummary: "Summary",
      followUpTasks: "Follow-up Tasks",
      topics: "Topics",
      addTopic: "Add Topic",
      documents: "Documents",
      upload: "Upload",
      download: "Download",
      delete: "Delete",
      voting: "Voting",
      approveQ4Goals: "Approve Q4 Goals?",
      yes: "Yes",
      no: "No",
      comments: "Comments",
      addComment: "Add a comment...",
      discussQ4Goals: "Discuss Q4 Goals",
      saadComment: "Sorry, I cannot attend the meeting this week",
      saad: "Saad"
    },
    عربي: {
      title: "اجتماع تخطيط الربع الرابع",
      status: "مكتمل",
      date: "15 مارس 2025 • 10:00 صباحًا",
      meetingCompleted: "الاجتماع مكتمل",
      attendance: "الحضور",
      present: "حاضر",
      absent: "غائب",
      liveTranscription: "نص الاجتماع",
      aiSummary: "ملخص الاجتماع",
      followUpTasks: "مهام المتابعة",
      topics: "المواضيع",
      addTopic: "إضافة موضوع",
      documents: "المستندات",
      upload: "رفع",
      download: "تحميل",
      delete: "حذف",
      voting: "التصويت",
      approveQ4Goals: "هل توافق على أهداف الربع الرابع؟",
      yes: "نعم",
      no: "لا",
      comments: "التعليقات",
      addComment: "إضافة تعليق...",
      discussQ4Goals: "مناقشة أهداف الربع الرابع",
      saadComment: "عذرًا، لا أستطيع حضور الاجتماع هذا الأسبوع",
      saad: "سعد"
    }
  };

  const t = translations[language];
  const attendees = [
    { name: "Saud", present: true },
    { name: "Fahad", present: true },
    { name: "Khalid", present: true },
    { name: "Ahmed", present: true },
    { name: "Ahmed", present: false },
    { name: t.saad, present: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50" dir={language === 'عربي' ? 'rtl' : 'ltr'}>
      <div className="w-full h-screen rounded-2xl overflow-hidden shadow-2xl border border-blue-200">
        {/* Header */}
        <div className="p-6 bg-white flex items-center justify-between border-b border-blue-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h1 className="text-xl font-bold text-blue-900">{t.title}</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">{t.status}</span>
            <span className="text-sm text-blue-700">{t.date}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === 'EN' ? 'عربي' : 'EN')}
              className="text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors"
            >
              {language === 'EN' ? 'عربي' : 'English'}
            </button>
            <button className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-shadow shadow-md">
              {t.meetingCompleted}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 h-[calc(100vh-86px)]">
          {/* Screen Recording */}
          <div className="col-span-12 p-4 bg-blue-50 border-b border-blue-200">
            <ScreenRecorder
              userId={meeting?.userId || 'default'}
              meetingId={meeting?.id || '1'}
              onUploadComplete={(result) => {
                // Handle upload completion, e.g., update meeting with recording URL
                if (result?.url) {
                  onUpdateMeeting({ ...meeting, recordingUrl: result.url });
                }
              }}
            />
          </div>
          {/* Left Sidebar */}
          <aside className="col-span-1 p-6 bg-blue-80 border-r border-blue-200 overflow-y-auto [&::-webkit-scrollbar]:hidden">
            <h2 className="font-semibold text-blue-800 mb-5">{t.attendance}</h2>
            <div className="space-y-4">
              {attendees.map((attendee) => (
                <div key={attendee.name} className="flex items-center justify-between text-sm">
                  <span className="text-slate-800 font-medium">{attendee.name}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${attendee.present ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-8 p-6 overflow-y-auto bg-white border-r border-blue-200 [&::-webkit-scrollbar]:hidden">
            {/* Transcription */}
            <section className="mb-10">
              <SectionHeader title={t.liveTranscription} />
              <ContentBox dir="rtl">
                <p className="text-sm text-slate-700 leading-relaxed">
                  [10:00 AM] صباح الخير جميعًا، يعطيكم العافية على حضوركم اليوم. خلونا نبدأ الاجتماع مباشرة. أول شي، نبغى نراجع اللي صار الأسبوع اللي فات في مشروع لوحة التحكم الذكية ونتأكد إن الخط الزمني للحين تحت السيطرة.
                </p>
              </ContentBox>
            </section>

            {/* Summary */}
            <section className="mb-10">
              <SectionHeader title={t.aiSummary} />
              <ContentBox dir="rtl">
                <ul className="list-disc pr-4 mt-2 space-y-2 text-sm text-slate-700">
                  <li>عُقد الاجتماع لمراجعة تطورات مشروع "لوحة التحكم الذكية" وضمان سير المشروع ضمن الإطار الزمني المحدد.</li>
                  <li>تأخر تسليم واجهة المستخدم بسبب تغييرات مفاجئة طلبها العميل.</li>
                  <li>تم الاتفاق على تعيين مسؤول واضح لكل تذكرة.</li>
                </ul>
              </ContentBox>
            </section>

            {/* Tasks */}
            <section>
              <SectionHeader title={t.followUpTasks}>
                <button className="p-1.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition">
                  <Plus className="w-4 h-4" />
                </button>
              </SectionHeader>
              <ContentBox dir="rtl">
                <div className="rounded-lg border border-blue-200 p-4 space-y-4 max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden bg-blue-50">
                  {[
                    {
                      text: 'إبلاغ العميل بأن التعديلات الكبيرة تؤثر على وقت التسليم.',
                      owner: 'فريق التواصل مع العميل',
                      deadline: 'في أقرب وقت ممكن',
                      checked: false,
                    },
                    {
                      text: 'اختبار النسخة الأخيرة من الواجهة الأمامية.',
                      owner: 'مطور الواجهة',
                      deadline: 'اليوم',
                      checked: false,
                    },
                  ].map((task, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <input type="checkbox" defaultChecked={task.checked} className="accent-blue-700 mt-1" />
                      <div className="flex-1">
                        <span className={`text-sm block ${task.checked ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                          {task.text}
                        </span>
                        <div className="text-xs text-blue-700 mt-1">المسؤول: {task.owner}</div>
                        <div className="text-xs text-blue-700">الموعد: {task.deadline}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ContentBox>
            </section>
          </main>

          {/* Right Sidebar */}
          <aside className="col-span-3 p-6 bg-white overflow-y-auto [&::-webkit-scrollbar]:hidden">
            <section>
              <SectionHeader title={t.topics}>
                <button className="px-3 py-1 text-xs font-medium text-blue-700 border border-blue-300 rounded-md hover:bg-blue-100">
                  {t.addTopic}
                </button>
              </SectionHeader>
              <div className="p-4 border border-blue-200 rounded-xl shadow-sm space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-blue-800">{t.discussQ4Goals}</h3>
                    <div className="flex gap-2">
                      <IconButton icon={<Edit2 className="w-4 h-4" />} />
                      <IconButton icon={<Trash2 className="w-4 h-4" />} color="red" />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-md mb-4">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="font-medium text-blue-800">{t.documents}</span>
                      <button className="text-blue-700 hover:text-blue-800 text-xs font-medium">
                        {t.upload}
                      </button>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white border border-blue-200 rounded shadow-sm">
                      <div className="flex gap-2 items-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-slate-700">Q4-Goals.pdf</span>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <button className="text-blue-700 font-medium hover:text-blue-800">
                          {t.download}
                        </button>
                        <button className="text-red-500 font-medium hover:text-red-700">
                          {t.delete}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">{t.voting}</h4>
                    <p className="text-sm text-slate-700 mb-2">{t.approveQ4Goals}</p>
                    <button className="w-full p-2 bg-blue-200 hover:bg-blue-300 rounded-md text-blue-800 mb-2">
                      {t.yes}
                    </button>
                    <button className="w-full p-2 bg-blue-200 hover:bg-blue-300 rounded-md text-blue-800">
                      {t.no}
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-2">{t.comments}</h4>
                    <div className="bg-blue-50 p-3 rounded-lg mb-2 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-blue-800">{t.saad}</span>
                        <IconButton icon={<X className="w-3 h-3" />} />
                      </div>
                      <p className="text-xs text-slate-600">{t.saadComment}</p>
                    </div>
                    <button className="text-sm text-blue-700 hover:text-blue-800 font-medium transition">
                      {t.addComment}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
