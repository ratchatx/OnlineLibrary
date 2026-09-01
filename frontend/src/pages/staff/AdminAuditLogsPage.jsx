import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import DataTable from '../../components/ui/DataTable';

const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs', {
        params: {
          search: search.trim() || undefined,
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      if (res.data?.success) {
        setLogs(res.data.data || []);
        setTotalCount(res.data.pagination?.total || 0);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [search, page, rowsPerPage]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns = [
    {
      id: 'id',
      label: 'Log ID',
      width: 90,
      render: (log) => (
        <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#64748B' }}>
          #{log.id}
        </Typography>
      ),
    },
    {
      id: 'action',
      label: 'Security Event / Action',
      render: (log) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
            {log.action}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            {log.details || 'System event recorded'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'user',
      label: 'Triggered By',
      render: (log) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
          {log.username || 'System Daemon'}
        </Typography>
      ),
    },
    {
      id: 'ip',
      label: 'IP Address',
      render: (log) => (
        <Chip label={log.ip_address || '127.0.0.1'} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.72rem', bgcolor: '#F1F5F9' }} />
      ),
    },
    {
      id: 'timestamp',
      label: 'Timestamp',
      render: (log) => (
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
          {log.created_at ? new Date(log.created_at).toLocaleString('en-US') : '-'}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', pb: 6 }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', mb: 0.5 }}>
          Security Trails & System Audit Logs
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          Immutable compliance record of user authentications, privilege grants, and circulation events.
        </Typography>
      </Box>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        headerActions={
          <TextField
            size="small"
            placeholder="Filter audit events by keyword..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ width: { xs: '100%', sm: 340 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: '1.2rem' }} />
                </InputAdornment>
              ),
            }}
          />
        }
      />
    </Box>
  );
};

export default AdminAuditLogsPage;
