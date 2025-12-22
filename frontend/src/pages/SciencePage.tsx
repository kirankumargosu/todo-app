import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { useScience } from "../hooks/useScience";

export default function SciencePage() {
  const {
    weeks,
    currentWeekIndex,
    loading,
    loadScience,
    prevWeek,
    nextWeek,
    jumpToCurrentWeek,
    handleTouchStart,
    handleTouchEnd,
  } = useScience();

  useEffect(() => {
    loadScience();
  }, []);

  if (weeks.length === 0) {
    return (
      <Typography>
        {loading ? "Loading..." : "No schedule available."}
      </Typography>
    );
  }

  const week = weeks[currentWeekIndex];

  return (
    <Box
      sx={{ mt: 2 }}
      onTouchStart={e => handleTouchStart(e.touches[0].clientX)}
      onTouchEnd={e => handleTouchEnd(e.changedTouches[0].clientX)}
    >
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Button onClick={prevWeek} disabled={currentWeekIndex === 0}>
          Prev
        </Button>

        <Typography variant="h6">
          {week.from} — {week.to}
        </Typography>

        <Button
          onClick={nextWeek}
          disabled={currentWeekIndex === weeks.length - 1}
        >
          Next
        </Button>
      </Box>

      <Box textAlign="center" mb={1}>
        <Button onClick={jumpToCurrentWeek}>
          Jump to current week
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <List>
          {week.study.map((s, idx) => {
            const [subject, chapter, ...rest] = s.split(":");
            return (
              <ListItem key={idx}>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">
                      {rest.join(":")}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {subject} • {chapter}
                    </Typography>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </Paper>

      <Typography variant="caption" display="block" mt={1}>
        Swipe left/right or use Prev/Next
      </Typography>
    </Box>
  );
}
