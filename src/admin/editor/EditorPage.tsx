// Visual editor at /admin/editor (STUB from the foundation step; WS-C owns and replaces it).
// Rendered full-screen, outside the admin Layout sidebar (see AdminApp.tsx).
import { Link } from 'react-router-dom';
import { useAdminContent } from '../state/AdminContentContext';

export function EditorPage() {
  const { hasUnpublishedChanges } = useAdminContent();
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#06111d] px-4 text-center text-[#e8f0f7]">
      <div className="max-w-md space-y-4">
        <h1 className="text-xl font-semibold text-white">Visual editor</h1>
        <p className="text-sm text-[#8ea6bd]">
          The visual editor is not built yet.{hasUnpublishedChanges ? ' You have unpublished changes.' : ''}
        </p>
        <Link to="/admin" className="inline-block text-sm font-semibold text-[#00abf0] underline-offset-4 hover:underline">
          Back to admin
        </Link>
      </div>
    </main>
  );
}

export default EditorPage;
