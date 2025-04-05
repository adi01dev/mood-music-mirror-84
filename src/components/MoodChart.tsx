
import { useMemo } from "react";
import { MoodEntry } from "@/contexts/MoodContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";

interface MoodChartProps {
  moodHistory: MoodEntry[];
  days?: number;
}

const MoodChart: React.FC<MoodChartProps> = ({ moodHistory, days = 7 }) => {
  const chartData = useMemo(() => {
    // Create a map of the last X days
    const dateMap = new Map();
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, "MMM dd");
      dateMap.set(dateStr, {
        date: dateStr,
        moodScore: 0,
        hasEntry: false,
      });
    }
    
    // Fill in mood data
    moodHistory.forEach(entry => {
      const dateStr = format(new Date(entry.timestamp), "MMM dd");
      if (dateMap.has(dateStr)) {
        dateMap.set(dateStr, {
          date: dateStr,
          moodScore: entry.moodScore,
          hasEntry: true,
          category: entry.moodCategory,
        });
      }
    });
    
    // Convert map to array and reverse to chronological order
    return Array.from(dateMap.values()).reverse();
  }, [moodHistory, days]);

  const getMoodColor = (entry: any) => {
    if (!entry.hasEntry) return "#E5E7EB"; // gray for no entry
    
    const moodColors: Record<string, string> = {
      happy: "#34D399", // green
      calm: "#60A5FA", // blue
      sad: "#A78BFA", // purple
      anxious: "#FBBF24", // yellow
      angry: "#F87171", // red
      neutral: "#9CA3AF", // gray
    };
    
    return entry.category ? moodColors[entry.category] : "#9CA3AF";
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-3 rounded-md shadow-md border border-muted">
          <p className="font-medium">{label}</p>
          {data.hasEntry ? (
            <>
              <p className="text-sm capitalize">
                Mood: <span className="font-medium">{data.category}</span>
              </p>
              <p className="text-sm">
                Score: <span className="font-medium">{data.moodScore}/10</span>
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No entry</p>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickCount={6}
          />
          <Tooltip content={<CustomTooltip />} />
          <defs>
            {chartData.map((entry, index) => (
              <linearGradient
                key={`gradient-${index}`}
                id={`gradient-${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={getMoodColor(entry)}
                  stopOpacity={0.8}
                />
                <stop
                  offset="100%"
                  stopColor={getMoodColor(entry)}
                  stopOpacity={0.2}
                />
              </linearGradient>
            ))}
          </defs>
          <Area
            type="monotone"
            dataKey="moodScore"
            stroke="#0EA5E9"
            strokeWidth={2}
            fill="url(#colorMood)"
            activeDot={{ r: 6, fill: "#0EA5E9" }}
            isAnimationActive={true}
          />
          <defs>
            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.1} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodChart;
