import {React, useEffect, useState } from "react";

// Chartjs Imports
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export const DemoLine = () => {
  const [graphData, setGraphData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const getDemoData = () => {
      // generate randomized linegraph data
      const [dataset_1, dataset_2, dataset_3, labels] = getRandomDataArrays();
      setGraphData({
        labels: labels,
        datasets: [
          {
            label: "Demo Data 1",
            data: dataset_1,
            fill: true,
            borderColor: "rgb(252, 186, 3, 1)",
            backgroundColor: "rgb(252, 186, 3, .2)",
            xAxisID: "xAxis",
            yAxisID: "yAxis",
          },
          {
            label: "Demo Data 2",
            data: dataset_2,
            fill: true,
            borderColor: "rgb(2, 117, 216, 1)",
            backgroundColor: "rgb(2, 117, 216, .2)",
            xAxisID: "xAxis",
            yAxisID: "yAxis",
          },
          // {
          //   label: "Demo Data 3",
          //   data: dataset_3,
          //   fill: true,
          //   borderColor: "rgb(92, 184, 92, 1)",
          //   backgroundColor: "rgb(92, 184, 92, .2)",
          //   xAxisID: "xAxis",
          //   yAxisID: "yAxis",
          // },
        ],
      });
    };
    getDemoData();
  }, []);

  const getRandomDataArrays = () => {
    const numOfPoints = 10;
    const min = 1;
    const max = 10;
    let count = 1;
    let array_1 = [];
    let array_2 = [];
    let array_3 = [];
    let labels = [];

    while (count <= numOfPoints) {
      array_1.push(Math.floor(Math.random() * (max - min + 1) + min));
      array_2.push(Math.floor(Math.random() * (max - min + 1) + min));
      array_3.push(Math.floor(Math.random() * (max - min + 1) + min));
      labels.push(count.toString());
      count++;
    }
    return [array_1, array_2, array_3, labels];
  };

  return (
    <div className="demo-line-inner">
      {graphData ? (
        <Line
          data={graphData}
          options={{
            plugins: {
              tooltip: {
                enabled: false,
              },
              legend: {
                display: false,
              },
            },
            maintainAspectRatio: false,
            elements: {
              line: {
                tension: 0.35,
              },
            },
            scales: {
              xAxis: {
                display: false,
              },
              yAxis: {
                display: false,
              },
            },
          }}
        />
      ) : (
        <p>no data loaded</p>
      )}
    </div>
  );
};
