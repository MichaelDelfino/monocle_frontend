import { React, useEffect, useState } from "react";
import { Chart, registerables } from "chart.js";
import { Bar } from "react-chartjs-2";

Chart.register(...registerables);

export default function BarChart({
  passedParts,
  failedParts,
  weekStart,
  weekEnd,
}) {
  const [graphData, setGraphData] = useState(null);
  useEffect(() => {
    const setDatasets = () => {
      // sort parts by timestamp first
      passedParts = orderPartsByTimestamp(passedParts);
      failedParts = orderPartsByTimestamp(failedParts);

      console.log(passedParts.length + failedParts.length);
      console.log(
        splitDataByDay(passedParts)[0] +
          splitDataByDay(passedParts)[1] +
          (splitDataByDay(failedParts)[0] + splitDataByDay(failedParts)[1])
      );

      const labels = ["Mon", "Tues", "Wed", "Thur", "Fri", "Sat", "Sun"];
      const datasets = [
        {
          label: "Passed Parts",
          data: splitDataByDay(passedParts),
          backgroundColor: "rgb(7, 237, 30, .2)",
        },
        {
          label: "Failed Parts",
          data: splitDataByDay(failedParts),
          backgroundColor: "rgb(235, 14, 14, .2)",
        },
      ];
      setGraphData({
        labels: labels,
        datasets: datasets,
      });
    };
    setDatasets();
  }, [passedParts, failedParts]);

  const orderPartsByTimestamp = data => {
    function compare(a, b) {
      if (a.timestamp < b.timestamp) {
        return -1;
      }
      if (a.timestamp > b.timestamp) {
        return 1;
      }
      return 0;
    }
    return data.sort(compare);
  };

  const splitDataByDay = data => {
    let splitData = [];
    let singleDay = [];
    let i = 1;
    for (const part of data) {
      if (parseInt(part.timestamp) > weekEnd + 86400000 * i) {
        splitData.push(singleDay.length);
        singleDay = [];
        i++;
      } else {
        // console.log(parseInt(part.timestamp), weekStart + 86400000 * i);
        singleDay.push(part);
      }
    }
    return splitData;
  };

  return (
    <div className="barchart">
      {graphData ? (
        <Bar
          data={graphData}
          options={{
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
              },
            },
          }}
        />
      ) : (
        <div></div>
      )}
    </div>
  );
}
