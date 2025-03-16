// src/components/admin/ChatFilterForm.js
'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Grid,
  IconButton,
  Collapse
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

export default function ChatFilterForm({ 
  initialSearch = '', 
  initialStatus = 'all', 
  initialDateFrom = '', 
  initialDateTo = '',
  statusOptions = [] 
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const hasActiveFilters = status !== 'all' || dateFrom || dateTo;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (status !== 'all') params.set('status', status);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    
    // Reset to page 1 when applying filters
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
  };
  
  const handleReset = () => {
    setSearch('');
    setStatus('all');
    setDateFrom('');
    setDateTo('');
    
    router.push(pathname);
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }} component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Search by title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              endAdornment: search ? (
                <IconButton 
                  size="small" 
                  onClick={() => setSearch('')}
                  aria-label="clear search"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : null
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              label="Status"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={12} md={5}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              startIcon={showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
            </Button>
            
            <Button 
              type="submit" 
              variant="contained" 
              startIcon={<FilterIcon />}
            >
              Apply Filters
            </Button>
            
            {(search || hasActiveFilters) && (
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleReset}
                startIcon={<ClearIcon />}
              >
                Clear All
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
      
      <Collapse in={showAdvancedFilters}>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="From Date"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="To Date"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
}