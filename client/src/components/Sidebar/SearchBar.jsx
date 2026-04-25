import { useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchBar({ value, onChange }) {
  return (
    <TextField
      size="small"
      placeholder="搜索对话..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      sx={{ mb: 1 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
      }}
    />
  );
}
