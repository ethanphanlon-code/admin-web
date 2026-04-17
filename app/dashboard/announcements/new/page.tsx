import AnnouncementForm from '../AnnouncementForm';

export default function NewAnnouncementPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">New Announcement</h1>
      <AnnouncementForm />
    </div>
  );
}
