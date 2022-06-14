import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
Chart.register(...registerables, zoomPlugin);

export default function PieChart({ passedParts, failedParts }) {
  const [partData, setPartData] = useState(null);

  useEffect(() => {
    setDatasets(passedParts, failedParts);
  }, [passedParts, failedParts]);

  const setDatasets = (passedParts, failedParts) => {
    console.log(passedParts, failedParts);
    setPartData({
      labels: ["Pass", "Fail"],
      datasets: [
        {
          label: "Pass Fail Distribution",
          data: [passedParts.length, failedParts.length],
          backgroundColor: ["rgb(38, 240, 72, .2)", "rgb(235, 14, 14, .2)"],
          borderColor: ["rgb(38, 240, 72, 1)", "rgb(235, 14, 14, 1)"],
          hoverBackgroundColor: ["rgb(38, 240, 72, 1)", "rgb(235, 14, 14, 1)"],
          hoverBorderColor: ["rgb(38, 240, 72, 1)", "rgb(235, 14, 14, 1)"],
          hoverOffset: 4,
        },
      ],
    });
  };

  return (
    <div className="pie-chart">
      <div className="doughnut">
        {partData ? (
          <Doughnut
            data={partData}
            options={{
              plugins: {
                legend: {
                  display: false,
                },
              },
            }}
          />
        ) : (
          "no data available"
        )}
      </div>
    </div>
  );
}
