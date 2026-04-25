import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

export default function TokenUsageBar({ tokenCount }) {
  const { usage, maxTokens, percentage, isNearLimit, isOverLimit } = tokenCount;

  if (!usage) return null;

  let color = 'primary';
  if (isOverLimit) color = 'error';
  else if (isNearLimit) color = 'warning';

  return (
    <Box sx={{ px: 2, pt: 1, flexShrink: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          color={color}
          sx={{ flex: 1, height: 6, borderRadius: 3 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          {usage.toLocaleString()} / {maxTokens.toLocaleString()}
        </Typography>
      </Box>
      {isOverLimit && (
        <Alert severity="error" sx={{ mt: 0.5, py: 0 }}>
          <Typography variant="caption">Token 即将用尽，建议新建对话</Typography>
        </Alert>
      )}
      {isNearLimit && !isOverLimit && (
        <Alert severity="warning" sx={{ mt: 0.5, py: 0 }}>
          <Typography variant="caption">接近 Token 上限</Typography>
        </Alert>
      )}
    </Box>
  );
}
