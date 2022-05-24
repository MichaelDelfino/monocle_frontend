import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
Chart.register(...registerables, zoomPlugin);

export const PieChart = props => {
  const [partData, setPartData] = useState();

  useEffect(() => {
    fetchParts();
  }, []);

  // Todo - Make this part fetch modular,
  //        each component uses the same code
  const fetchParts = async (machine = 0) => {
    const res = await fetch('./part.json');
    const data = await res.json();
    console.log(data);

    const [machineNums, partTypes] = getPartTypesAndMachines(data);
    // const [borderColor, backgroundColor] = getPartColor(data);
    console.log(partTypes);
    console.log(machineNums);

    setPartData({
      labels: partTypes,
      machine: machineNums[machine],
      datasets: [
        {
          label: 'Type Distribution',
          data: [300, 50, 100],
          backgroundColor: [
            'rgb(240, 173, 78, .2)',
            'rgb(2, 117, 216, .2)',
            'rgb(92, 184, 92, .2)',
          ],
          borderColor: [
            'rgb(240, 173, 78, 1)',
            'rgb(2, 117, 216, 1)',
            'rgb(92, 184, 92, 1)',
          ],
          hoverBackgroundColor: [
            'rgb(240, 173, 78, 1)',
            'rgb(2, 117, 216, 1)',
            'rgb(92, 184, 92, 1)',
          ],
          hoverBorderColor: [
            'rgb(240, 173, 78, 1)',
            'rgb(2, 117, 216, 1)',
            'rgb(92, 184, 92, 1)',
          ],
          hoverOffset: 4,
        },
      ],
    });
  };

  const getPartTypesAndMachines = data => {
    const machines = data.map(data => data.machine);
    const partTypes = data.map(data => data.partType);
    return [machines, partTypes];
  };

  return (
    <div>
      {props ? <p>WAM {props.machine}</p> : 'no data'}
      <p></p>
      <div className="doughnut">
        {partData ? <Doughnut data={partData} /> : 'no data available'}
      </div>
    </div>
  );
};
