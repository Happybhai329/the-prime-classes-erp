import React, { useRef, useState, useEffect } from 'react';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { useNotifications, useUnreadCount, useMarkRead, useMarkAllRead } from '@/hooks/useNotifications';

export const NotificationPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const { data: unreadData } = useUnreadCount();
  const { data: notifData, isLoading } = useNotifications({ limit: 10 });
  const markReadMutation = useMarkRead();
  const markAllReadMutation = useMarkAllRead();

  const unreadCount = unreadData?.unreadCount || 0;
  const notifications = notifData?.data || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
        id="notification-bell"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto p-2">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
            ) : notifications.length > 0 ? (
              <div className="space-y-1">
                {notifications.map((n: any) => (
                  <div 
                    key={n.id} 
                    className={`p-3 rounded-lg text-left ${!n.isRead ? 'bg-primary-50/50' : 'hover:bg-gray-50'} transition-colors group relative`}
                  >
                    {!n.isRead && (
                      <div className="absolute top-4 left-2 w-2 h-2 bg-primary-500 rounded-full" />
                    )}
                    <div className="pl-3">
                      <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.body}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-gray-400">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                        {!n.isRead && (
                          <button 
                            onClick={(e) => handleMarkRead(n.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-xs text-primary-600 font-medium flex items-center gap-1 transition-opacity"
                          >
                            <Check className="h-3 w-3" /> Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium">No notifications yet</p>
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 text-center bg-gray-50">
              <span className="text-xs text-gray-500">Showing last 10 notifications</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
