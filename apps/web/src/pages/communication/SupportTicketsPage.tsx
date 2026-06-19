import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  Plus, 
  MessageSquare, 
  User, 
  CheckCircle, 
  Clock, 
  Lock, 
  AlertCircle, 
  Send,
  UserPlus
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { 
  useMyTickets, 
  useAllTickets, 
  useCreateTicket, 
  useReplyToTicket, 
  useUpdateTicketStatus, 
  useAssignTicket,
  useTicket
} from '@/hooks/useCommunication';
import { TicketCategory, TicketStatus } from '@prime/shared-types';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface CreateTicketFormData {
  subject: string;
  category: TicketCategory;
  message: string;
}

interface ReplyFormData {
  message: string;
  attachmentUrl?: string;
}

export const SupportTicketsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const hasViewAll = user && ['SUPER_ADMIN', 'ADMIN', 'FACULTY'].includes(user.role);

  // Filter and pagination state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TicketStatus | ''>('');
  const [category, setCategory] = useState<TicketCategory | ''>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // API hooks
  const queryParams = {
    search: search || undefined,
    status: status || undefined,
    category: category || undefined,
    page,
    limit,
  };

  const myTicketsQuery = useMyTickets(queryParams);
  const allTicketsQuery = useAllTickets(queryParams);
  const currentQuery = hasViewAll ? allTicketsQuery : myTicketsQuery;

  const createTicketMutation = useCreateTicket();
  const replyMutation = useReplyToTicket();
  const statusMutation = useUpdateTicketStatus();
  const assignMutation = useAssignTicket();

  // Selected ticket query
  const ticketDetailQuery = useTicket(selectedTicketId || '');

  // Forms
  const { register: registerCreate, handleSubmit: handleSubmitCreate, reset: resetCreate, formState: { errors: createErrors } } = useForm<CreateTicketFormData>();
  const { register: registerReply, handleSubmit: handleSubmitReply, reset: resetReply } = useForm<ReplyFormData>();

  const tickets = currentQuery.data?.data || [];
  const meta = currentQuery.data?.meta || { total: 0, totalPages: 1 };

  const handleCreateSubmit = (data: CreateTicketFormData) => {
    createTicketMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Ticket created successfully');
        setIsCreateOpen(false);
        resetCreate();
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to create ticket');
      },
    });
  };

  const handleReplySubmit = (data: ReplyFormData) => {
    if (!selectedTicketId) return;
    replyMutation.mutate(
      { id: selectedTicketId, data },
      {
        onSuccess: () => {
          toast.success('Reply sent successfully');
          resetReply();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to send reply');
        },
      }
    );
  };

  const handleStatusChange = (newStatus: TicketStatus) => {
    if (!selectedTicketId) return;
    statusMutation.mutate(
      { id: selectedTicketId, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Ticket status marked as ${newStatus}`);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to update status');
        },
      }
    );
  };

  const handleAssignToMe = () => {
    if (!selectedTicketId || !user) return;
    assignMutation.mutate(
      { id: selectedTicketId, assigneeId: user.id },
      {
        onSuccess: () => {
          toast.success('Ticket assigned to you');
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to assign ticket');
        },
      }
    );
  };

  const columns = [
    {
      key: 'subject',
      header: 'Subject',
      render: (t: any) => (
        <div>
          <div className="font-semibold text-gray-900">{t.subject}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Clock className="w-3.5 h-3.5" />
            {new Date(t.createdAt).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (t: any) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
          {t.category}
        </span>
      ),
    },
    {
      key: 'creator',
      header: 'From',
      render: (t: any) => {
        const creatorEmail = t.creator?.email || 'Unknown';
        const role = t.creator?.role || 'User';
        const name = t.creator?.faculty 
          ? `${t.creator.faculty.firstName} ${t.creator.faculty.lastName}`
          : creatorEmail;
        return (
          <div>
            <div className="text-sm font-medium text-gray-900">{name}</div>
            <div className="text-xs text-gray-500 capitalize">{role.toLowerCase()}</div>
          </div>
        );
      },
    },
    {
      key: 'assignee',
      header: 'Assigned To',
      render: (t: any) => {
        if (!t.assignee) {
          return <span className="text-xs italic text-gray-400">Unassigned</span>;
        }
        const name = t.assignee.faculty 
          ? `${t.assignee.faculty.firstName} ${t.assignee.faculty.lastName}`
          : t.assignee.email;
        return (
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span>{name}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (t: any) => <StatusBadge status={t.status} />,
    },
  ];

  const detailTicket = ticketDetailQuery.data;
  const messages = detailTicket?.messages || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets"
        description={hasViewAll ? "Manage and resolve support queries from parents and students" : "Raise a ticket and get help from our administration support desk"}
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Ticket
          </Button>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-96">
          <SearchInput
            placeholder="Search tickets..."
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
          />
        </div>
        <div className="w-full md:w-auto flex flex-wrap gap-3 items-center justify-end">
          <FilterDropdown
            label="Category"
            value={category}
            onChange={(val) => { setCategory(val as TicketCategory | ''); setPage(1); }}
            options={Object.values(TicketCategory).map(c => ({ label: c, value: c }))}
          />
          <FilterDropdown
            label="Status"
            value={status}
            onChange={(val) => { setStatus(val as TicketStatus | ''); setPage(1); }}
            options={Object.values(TicketStatus).map(s => ({ label: s, value: s }))}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={tickets}
          isLoading={currentQuery.isLoading}
          onRowClick={(row) => setSelectedTicketId(row.id)}
          emptyTitle="No Support Tickets"
          emptyDescription="You haven't raised or received any support tickets yet."
        />
        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-end">
            <Pagination
              page={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* CREATE TICKET MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Support Ticket"
        size="md"
      >
        <form onSubmit={handleSubmitCreate(handleCreateSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              className={`input w-full ${createErrors.subject ? 'border-red-500' : ''}`}
              placeholder="E.g. Problem accessing monthly report card"
              {...registerCreate('subject', { required: 'Subject is required', minLength: { value: 5, message: 'Subject must be at least 5 characters' } })}
            />
            {createErrors.subject && <p className="text-red-500 text-xs mt-1">{createErrors.subject.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className={`input w-full ${createErrors.category ? 'border-red-500' : ''}`}
              {...registerCreate('category', { required: 'Category is required' })}
            >
              <option value="">Select Category</option>
              {Object.values(TicketCategory).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {createErrors.category && <p className="text-red-500 text-xs mt-1">{createErrors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message Detail</label>
            <textarea
              rows={4}
              className={`input w-full ${createErrors.message ? 'border-red-500' : ''}`}
              placeholder="Describe the issue in detail so our support staff can help..."
              {...registerCreate('message', { required: 'Message is required', minLength: { value: 10, message: 'Message must be at least 10 characters' } })}
            />
            {createErrors.message && <p className="text-red-500 text-xs mt-1">{createErrors.message.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createTicketMutation.isPending}>
              Create Ticket
            </Button>
          </div>
        </form>
      </Modal>

      {/* TICKET DETAILS MODAL */}
      <Modal
        isOpen={!!selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        title={detailTicket ? `Ticket details: ${detailTicket.subject}` : 'Loading details...'}
        size="lg"
      >
        {ticketDetailQuery.isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Clock className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : detailTicket ? (
          <div className="space-y-6">
            {/* Header info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div>
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    detailTicket.status === TicketStatus.OPEN ? 'bg-red-100 text-red-800' : 
                    detailTicket.status === TicketStatus.IN_PROGRESS ? 'bg-yellow-100 text-yellow-800' : 
                    detailTicket.status === TicketStatus.RESOLVED ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {detailTicket.status}
                  </span>
                  
                  {/* Status Toggle Buttons */}
                  {detailTicket.status !== TicketStatus.CLOSED && (
                    <div className="flex gap-1.5 ml-2">
                      {detailTicket.status !== TicketStatus.RESOLVED && (
                        <button 
                          type="button"
                          onClick={() => handleStatusChange(TicketStatus.RESOLVED)}
                          className="p-1 bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200 transition-colors"
                          title="Mark Resolved"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(TicketStatus.CLOSED)}
                        className="p-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded border border-gray-300 transition-colors"
                        title="Close Ticket"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {detailTicket.status === TicketStatus.CLOSED && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(TicketStatus.OPEN)}
                      className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium border border-blue-200 rounded"
                    >
                      Reopen Ticket
                    </button>
                  )}
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</span>
                <span className="inline-block mt-1.5 text-sm font-semibold text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-200">
                  {detailTicket.category}
                </span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned to</span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">
                    {detailTicket.assignee 
                      ? (detailTicket.assignee.faculty 
                        ? `${detailTicket.assignee.faculty.firstName} ${detailTicket.assignee.faculty.lastName}`
                        : detailTicket.assignee.email)
                      : 'Unassigned'}
                  </span>
                  
                  {/* Assign to me action */}
                  {hasViewAll && !detailTicket.assignee && (
                    <button
                      onClick={handleAssignToMe}
                      className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 font-semibold"
                    >
                      <UserPlus className="w-3 h-3" />
                      Claim Ticket
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Conversation Messages Thread */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-primary-600" />
                  Conversation Thread
                </h3>
              </div>
              <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto flex flex-col">
                {messages.map((msg: any) => {
                  const isCurrentUser = msg.senderId === user?.id;
                  const senderName = msg.sender?.faculty 
                    ? `${msg.sender.faculty.firstName} ${msg.sender.faculty.lastName}`
                    : (msg.sender?.email || 'System');
                  return (
                    <div 
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] rounded-xl p-3 border shadow-sm ${
                        isCurrentUser 
                          ? 'self-end bg-primary-50 border-primary-200 text-primary-950' 
                          : 'self-start bg-white border-gray-200 text-gray-950'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className="text-xs font-bold text-primary-900 flex items-center gap-1">
                          <User className="w-3 h-3 text-primary-500" />
                          {senderName}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      {msg.attachmentUrl && (
                        <div className="mt-2 text-xs border-t border-gray-200/50 pt-1.5">
                          <a 
                            href={msg.attachmentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline flex items-center gap-1 font-medium"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            View Attachment
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reply Editor */}
            {detailTicket.status !== TicketStatus.CLOSED ? (
              <form onSubmit={handleSubmitReply(handleReplySubmit)} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Send a Reply</label>
                  <textarea
                    rows={3}
                    className="input w-full"
                    placeholder="Type your message here..."
                    {...registerReply('message', { required: true })}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="w-full sm:w-80">
                    <input
                      type="text"
                      className="input w-full text-xs py-1.5"
                      placeholder="Attachment URL (Optional)"
                      {...registerReply('attachmentUrl')}
                    />
                  </div>
                  <Button type="submit" className="w-full sm:w-auto flex items-center gap-2" isLoading={replyMutation.isPending}>
                    <Send className="w-4 h-4" />
                    Reply
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-2 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg p-3 text-sm justify-center">
                <Lock className="w-4 h-4" />
                This ticket is closed. Reopen it to resume the conversation.
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
