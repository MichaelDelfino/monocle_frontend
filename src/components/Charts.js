import React from 'react';

export const Charts = () => {
  return (
    <div className="charts">
      <div className="change-part-btns">
        <button
          className="btn btn-outline-warning m-2"
          onClick={changePart.bind(null, 0)}
        >
          Part 1
        </button>
        <button
          className="btn btn-outline-success m-2"
          onClick={changePart.bind(null, 1)}
        >
          Part 2
        </button>
        <button
          className="btn btn-outline-info m-2"
          onClick={changePart.bind(null, 2)}
        >
          Part 3
        </button>
      </div>
      <div className="line-graph">
        {partData ? (
          <LineGraph partData={partData} />
        ) : (
          'these arent droids youre looking for'
        )}
      </div>
      <div className="metric-buttons">
        <ul>
          <li>
            <button
              className="btn btn-outline-primary m-2"
              onClick={changeMetric.bind(null, 'diameter')}
            >
              diameter
            </button>
          </li>
          <li>
            <button
              className="btn btn-outline-primary m-2"
              onClick={changeMetric.bind(null, 'position')}
            >
              position
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};
