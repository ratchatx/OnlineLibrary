import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Skeleton,
} from '@mui/material';
import EmptyState from './EmptyState';

/**
 * Reusable DataTable Component
 * Standardizes tables, pagination, and loading skeleton across all management pages
 */
const DataTable = ({
  columns,
  data = [],
  loading = false,
  page = 0,
  rowsPerPage = 10,
  totalCount = 0,
  onPageChange,
  onRowsPerPageChange,
  emptyTitle = 'No Records Found',
  emptyDescription = 'There are no items matching your criteria.',
  emptyIcon,
  headerActions,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
      }}
    >
      {headerActions && (
        <Box sx={{ p: 2.5, px: 3, borderBottom: '1px solid #F1F5F9' }}>
          {headerActions}
        </Box>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id || col.field}
                  align={col.align || 'left'}
                  sx={{
                    width: col.width,
                    py: 1.8,
                    px: 2.5,
                    ...col.headerSx,
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <TableRow key={rIdx}>
                  {columns.map((col, cIdx) => (
                    <TableCell key={cIdx} sx={{ py: 2, px: 2.5 }}>
                      <Skeleton variant="text" height={24} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length > 0 ? (
              data.map((row, rIdx) => (
                <TableRow
                  key={row.id || rIdx}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.id || col.field}
                      align={col.align || 'left'}
                      sx={{ py: 1.8, px: 2.5, ...col.cellSx }}
                    >
                      {col.render ? col.render(row) : row[col.field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ py: 2, border: 0 }}>
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    icon={emptyIcon}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {onPageChange && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount || data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          sx={{
            borderTop: '1px solid #F1F5F9',
            fontFamily: '"Hanken Grotesk", sans-serif',
          }}
        />
      )}
    </Paper>
  );
};

export default DataTable;
