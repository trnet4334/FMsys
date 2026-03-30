import { SecurityPanel } from '../../../src/components/settings/security-panel';

export default function SecurityPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Security Settings</h1>
      <SecurityPanel />
    </div>
  );
}
