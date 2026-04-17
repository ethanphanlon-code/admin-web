/**
 * CoHomed Audit Trail System
 * Comprehensive audit trail for compliance and forensics
 */

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  SIGN = 'sign',
  PAY = 'pay',
  INVITE = 'invite',
  APPROVE = 'approve',
  REJECT = 'reject',
  ESCALATE = 'escalate',
}

export enum ResourceType {
  GROUP = 'group',
  MEMBER = 'member',
  DOCUMENT = 'document',
  PAYMENT = 'payment',
  EXPENSE = 'expense',
  VOTE = 'vote',
  INVITE = 'invite',
  PROFILE = 'profile',
  NOTIFICATION = 'notification',
}

export enum UserRole {
  OWNER = 'owner',
  CO_OWNER = 'co_owner',
  ADMIN = 'admin',
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor_id: string;
  actor_role: UserRole;
  action: AuditAction;
  resource_type: ResourceType;
  resource_id: string;
  group_id: string | null;
  metadata: AuditMetadata;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditMetadata {
  before?: Record<string, any>;
  after?: Record<string, any>;
  reason?: string;
  details?: Record<string, any>;
  change_summary?: string;
}

export interface AuditLogFilter {
  actor_id?: string;
  group_id?: string;
  action?: AuditAction;
  resource_type?: ResourceType;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogResponse {
  data: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
}

/**
 * AuditLogRepository for querying audit logs
 */
export class AuditLogRepository {
  constructor(private supabase: any) {}

  async queryLogs(filters: AuditLogFilter): Promise<AuditLogResponse> {
    let query = this.supabase
      .from('audit_logs')
      .select('*', { count: 'exact' });

    if (filters.actor_id) {
      query = query.eq('actor_id', filters.actor_id);
    }

    if (filters.group_id) {
      query = query.eq('group_id', filters.group_id);
    }

    if (filters.action) {
      query = query.eq('action', filters.action);
    }

    if (filters.resource_type) {
      query = query.eq('resource_type', filters.resource_type);
    }

    if (filters.date_from) {
      query = query.gte('timestamp', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('timestamp', filters.date_to);
    }

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const { data, error, count } = await query
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      limit,
    };
  }

  async getLogsByGroup(groupId: string, limit: number = 100): Promise<AuditLogEntry[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('group_id', groupId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getLogsByUser(userId: string, limit: number = 100): Promise<AuditLogEntry[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('actor_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getLogsByAction(action: AuditAction, limit: number = 100): Promise<AuditLogEntry[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('action', action)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}
