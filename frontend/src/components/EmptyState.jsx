import React from 'react';
import { Inbox } from 'lucide-react';

function EmptyState({ message = 'Nothing to show here.', Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
      <Icon size={44} className="text-gray-300 mb-3" />
      <p className="text-gray-500 text-sm text-center max-w-xs">{message}</p>
    </div>
  );
}

export default EmptyState;
