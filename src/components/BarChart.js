import { React, useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';

Chart.register(...registerables);

export default function BarChart({ passedParts, failedParts }) {
  return <div>{/* <Bar /> */}</div>;
}
