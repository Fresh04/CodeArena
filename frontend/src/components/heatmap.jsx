import React, { useMemo, useState } from 'react';

const DAYS = ['Mon', 'Wed', 'Fri'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const HeatMap = ({ submissionDates = [], className = '' }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const {
    dailyCounts,
    totalSubmissions,
    maxStreak,
    currentStreak,
    activeDays
  } = useMemo(() => {
    const counts = {};
    let total = 0;
    let maxCount = 0;
    let currentCount = 0;
    let maxStreakCount = 0;
    let activeCount = 0;
    console.log(submissionDates);
    submissionDates.forEach(dateStr => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date encountered: ${dateStr}`);
        return;
      }
    
      const key = date.toISOString().split('T')[0];
    
      if (date.getFullYear() === selectedYear) {
        counts[key] = (counts[key] || 0) + 1;
        total += 1;
    
        if (counts[key] > 0) activeCount++;
    
        currentCount++;
        maxStreakCount = Math.max(maxStreakCount, currentCount);
      } else {
        currentCount = 0;
      }
      
      maxCount = Math.max(maxCount, counts[key] || 0);
    });
    

    return {
      dailyCounts: counts,
      totalSubmissions: total,
      maxStreak: maxStreakCount,
      currentStreak: currentCount,
      activeDays: activeCount
    };
  }, [submissionDates, selectedYear]);

  // Generate calendar grid
  const calendarData = useMemo(() => {
    const startDate = new Date(selectedYear, 0, 1);
    while (startDate.getDay() !== 1) {
      startDate.setDate(startDate.getDate() - 1);
    }

    const weeks = [];
    let currentWeek = [];
    const endDate = new Date(selectedYear, 11, 31);
    
    while (startDate <= endDate) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }
    if (currentWeek.length) weeks.push(currentWeek);

    return weeks;
  }, [selectedYear]);

  const monthLabels = useMemo(() => {
    const labels = [];
    let currentMonth = null;
    
    calendarData.forEach((week, weekIndex) => {
      const month = week[0].getMonth();
      if (month !== currentMonth) {
        currentMonth = month;
        labels.push({ month: MONTHS[month], weekIndex });
      }
    });
    
    return labels;
  }, [calendarData]);

  const getColorClass = count => {
    if (!count) return 'bg-gray-800';
    if (count <= 1) return 'bg-green-900';
    if (count <= 3) return 'bg-green-700';
    if (count <= 5) return 'bg-green-500';
    return 'bg-green-300';
  };

  return (
    <div className={`w-full bg-gray-900 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-base font-medium text-gray-200">
          {totalSubmissions.toLocaleString()} Submissions in {selectedYear}
        </h3>
        <select
          className="bg-gray-800 text-gray-200 rounded px-3 py-1 text-sm"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
        >
          {[...Array(5)].map((_, i) => (
            <option key={currentYear - i} value={currentYear - i}>
              {currentYear - i}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex gap-4 text-sm text-gray-400">
          <div>{activeDays} active days</div>
          <div>Current streak: {currentStreak} days</div>
          <div>Longest streak: {maxStreak} days</div>
        </div>
        
        <div className="relative pt-6">
          <div className="absolute top-0 left-8 right-0 flex">
          {monthLabels.map(({ month, weekIndex }) => (
            <div
              key={`${month}-${weekIndex}`}
              className="text-xs text-gray-400 absolute"
              style={{ left: `${weekIndex * 18}px` }}
            >
              {month}
            </div>
          ))}
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col gap-5 text-xs text-gray-400 pt-2">
              {DAYS.map(day => (
                <div key={day} className="h-4">{day}</div>
              ))}
            </div>

            <div className="flex gap-[3px]">
              {calendarData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.map(date => {
                    const dateKey = date.toISOString().split('T')[0];
                    const count = dailyCounts[dateKey] || 0;
                    
                    return (
                      <div
                        key={dateKey}
                        className={`w-4 h-4 rounded-sm ${getColorClass(count)} hover:ring-1 hover:ring-gray-300 group relative`}
                      >
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-700 text-gray-200 text-xs rounded hidden group-hover:block whitespace-nowrap z-10">
                          {count} Submissions on {date.toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatMap;